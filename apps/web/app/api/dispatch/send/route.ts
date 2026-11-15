import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { queueCampaign } from '@/lib/dispatch';

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => ({}));
    const data = rawBody.campaignData || rawBody;

    const prompt = data.prompt || '';
    const tone = data.tone || 'Warm';
    const scenario = data.scenario || 'custom';
    const rawRecipients = Array.isArray(data.recipients) ? data.recipients : [];

    // Ensure valid teacher
    let teacher = null;
    if (data.teacherId) {
      teacher = await prisma.teacher.findUnique({ where: { id: data.teacherId } });
    }
    if (!teacher) {
      teacher = await prisma.teacher.findFirst();
    }
    if (!teacher) {
      return NextResponse.json({ error: 'No teacher found in database' }, { status: 400 });
    }

    // Lookup fallback guardian if needed
    const defaultGuardian = await prisma.guardian.findFirst();

    // Map and validate recipients
    const preparedRecipients: any[] = [];
    for (const r of rawRecipients) {
      let gId = r.guardianId;
      if (gId) {
        const gExists = await prisma.guardian.findUnique({ where: { id: gId } });
        if (!gExists) {
          gId = defaultGuardian?.id || '';
        }
      } else {
        gId = defaultGuardian?.id || '';
      }

      preparedRecipients.push({
        guardianId: gId,
        guardianName: r.guardianName || r.name || 'Parent',
        studentName: r.studentName || 'Student',
        email: r.email || '',
        whatsappNumber: r.whatsappNumber || r.phone || '',
        emailSubject: r.emailSubject || 'School Notice',
        emailBodyHtml: r.emailBodyHtml || '<p>School Notice</p>',
        whatsappText: r.whatsappText || 'School Notice'
      });
    }

    // 1. Create DispatchCampaign in database
    const campaign = await prisma.dispatchCampaign.create({
      data: {
        teacherId: teacher.id,
        prompt,
        scenario,
        tone,
        status: 'WAITING_UNDO',
        recipients: {
          create: preparedRecipients.map(r => ({
            guardianId: r.guardianId,
            emailSubject: r.emailSubject,
            emailBodyHtml: r.emailBodyHtml,
            whatsappText: r.whatsappText,
            emailStatus: 'PENDING',
            whatsappStatus: 'PENDING'
          }))
        }
      },
      include: { recipients: true }
    });

    // 2. Enqueue campaign with 10-second undo window in packages/dispatch
    const queuePayloadRecipients = campaign.recipients.map((dbRec: any, idx: number) => {
      const orig = preparedRecipients[idx] || {};
      return {
        id: dbRec.id,
        campaignId: campaign.id,
        guardianId: dbRec.guardianId,
        guardianName: orig.guardianName,
        studentName: orig.studentName,
        email: orig.email,
        whatsappNumber: orig.whatsappNumber,
        emailSubject: dbRec.emailSubject,
        emailBodyHtml: dbRec.emailBodyHtml,
        whatsappText: dbRec.whatsappText
      };
    });

    const queueResult = queueCampaign({
      id: campaign.id,
      teacherId: campaign.teacherId,
      prompt: campaign.prompt,
      scenario: campaign.scenario,
      tone: campaign.tone,
      recipients: queuePayloadRecipients,
      customUndoWindowMs: 10000
    });

    return NextResponse.json({
      campaignId: campaign.id,
      status: 'WAITING_UNDO',
      undoExpiresAt: queueResult.undoExpiresAt,
      secondsRemaining: queueResult.secondsRemaining || 10,
      recipientCount: campaign.recipients.length
    });
  } catch (err: any) {
    console.error('Error dispatching campaign:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
