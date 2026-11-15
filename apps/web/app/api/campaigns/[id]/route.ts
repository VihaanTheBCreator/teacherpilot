import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCampaign } from '@/lib/dispatch';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const campaignId = resolvedParams?.id;
    if (!campaignId) {
      return NextResponse.json({ error: 'campaign id is required' }, { status: 400 });
    }

    const campaign = await prisma.dispatchCampaign.findUnique({
      where: { id: campaignId },
      include: {
        teacher: {
          include: { school: true }
        },
        recipients: {
          include: {
            guardian: {
              include: { student: true }
            }
          }
        }
      }
    });

    if (!campaign) {
      // Check in-memory queue fallback
      const queued = getCampaign(campaignId);
      if (queued) {
        return NextResponse.json({ campaign: queued, recipients: queued.recipients });
      }
      return NextResponse.json({ error: `Campaign ${campaignId} not found` }, { status: 404 });
    }

    // Format recipients with friendly flattened fields
    const formattedRecipients = campaign.recipients.map(r => ({
      id: r.id,
      guardianId: r.guardianId,
      name: r.guardian.name,
      salutation: r.guardian.salutation,
      email: r.guardian.email,
      whatsappNumber: r.guardian.whatsappNumber,
      studentName: r.guardian.student?.name || 'Student',
      studentTransport: r.guardian.student?.transport || '',
      busRoute: r.guardian.student?.busRoute || '',
      emailSubject: r.emailSubject,
      emailBodyHtml: r.emailBodyHtml,
      whatsappText: r.whatsappText,
      emailStatus: r.emailStatus,
      whatsappStatus: r.whatsappStatus,
      emailSentAt: r.emailSentAt,
      whatsappSentAt: r.whatsappSentAt,
      createdAt: r.createdAt
    }));

    return NextResponse.json({
      campaign: {
        ...campaign,
        recipientsCount: campaign.recipients.length,
        emailSentCount: campaign.recipients.filter(r => r.emailStatus === 'SENT').length,
        whatsappSentCount: campaign.recipients.filter(r => r.whatsappStatus === 'SENT').length
      },
      recipients: formattedRecipients
    });
  } catch (err: any) {
    console.error('Error fetching campaign details:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
