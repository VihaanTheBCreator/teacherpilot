import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseIntent, generateMessage } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const prompt = body.prompt;
    const requestedTone = body.tone;
    const teacherId = body.teacherId || 'teacher-vihaan';

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt string is required' }, { status: 400 });
    }

    // 1. Parse intent
    const intent = await parseIntent(prompt);
    if (requestedTone) {
      intent.tone = requestedTone;
    }

    // 2. Fetch teacher and school context
    let teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { school: true }
    });
    if (!teacher) {
      teacher = await prisma.teacher.findFirst({
        include: { school: true }
      });
    }

    const schoolContext = {
      schoolName: teacher?.school?.name || 'GEMS Our Own Indian School',
      teacherName: teacher?.name || 'Vihaan Bhandari',
      teacherRole: `Class Teacher, Grade ${teacher?.classGrade || '11-A'}`,
      classGrade: teacher?.classGrade || 'Grade 11-A',
      brandColor: teacher?.school?.brandColor || '#005a36'
    };

    // 3. Query students according to targetFilter
    const targetFilter = intent.targetFilter || {};
    const whereClause: any = {};
    if (teacher) {
      whereClause.teacherId = teacher.id;
    }

    if (targetFilter.stayBack === true) {
      whereClause.stayBack = true;
    }
    if (targetFilter.remedial === true) {
      whereClause.remedial = true;
    }
    if (targetFilter.busRoute) {
      whereClause.busRoute = { contains: targetFilter.busRoute };
    }
    if (targetFilter.consentStatus) {
      whereClause.consentStatus = targetFilter.consentStatus;
    }
    if (Array.isArray(targetFilter.studentIds) && targetFilter.studentIds.length > 0) {
      whereClause.id = { in: targetFilter.studentIds };
    }

    let students = await prisma.student.findMany({
      where: whereClause,
      include: { guardians: true, assessments: true }
    });

    // If filter was too restrictive and matched 0 students, fallback to all students of the teacher
    if (students.length === 0) {
      students = await prisma.student.findMany({
        where: teacher ? { teacherId: teacher.id } : {},
        include: { guardians: true, assessments: true }
      });
    }

    // 4. Generate messages for each recipient
    const recipientsList: any[] = [];
    const messagesList: any[] = [];

    for (const student of students) {
      const primaryGuardian = student.guardians[0] || {
        id: `guard-${student.id}`,
        name: `Parent of ${student.name}`,
        salutation: 'Mr./Mrs.',
        email: 'parent@gemsedu.com',
        whatsappNumber: '+971500000000'
      };

      const msg = await generateMessage(intent, student, primaryGuardian, schoolContext);

      const recipientData = {
        studentId: student.id,
        studentName: student.name,
        gender: student.gender,
        transport: student.transport,
        busRoute: student.busRoute,
        busStop: student.busStop,
        stayBack: student.stayBack,
        remedial: student.remedial,
        consentStatus: student.consentStatus,
        guardianId: primaryGuardian.id,
        guardianName: primaryGuardian.name,
        guardianSalutation: primaryGuardian.salutation,
        email: primaryGuardian.email,
        whatsappNumber: primaryGuardian.whatsappNumber,
        emailSubject: msg.emailSubject,
        emailBodyHtml: msg.emailBodyHtml,
        whatsappText: msg.whatsappText
      };

      recipientsList.push(recipientData);
      messagesList.push({
        studentId: student.id,
        studentName: student.name,
        guardianId: primaryGuardian.id,
        guardianName: primaryGuardian.name,
        email: primaryGuardian.email,
        whatsappNumber: primaryGuardian.whatsappNumber,
        emailSubject: msg.emailSubject,
        emailBodyHtml: msg.emailBodyHtml,
        whatsappText: msg.whatsappText
      });
    }

    // 5. Persist the generated draft campaign to the database so /preview never loses data on refresh
    let draftCampaignId = `draft-${Date.now()}`;
    if (teacher) {
      try {
        const campaign = await prisma.dispatchCampaign.create({
          data: {
            teacherId: teacher.id,
            prompt,
            scenario: intent.scenario || 'custom',
            tone: intent.tone || 'Warm',
            status: 'DRAFT',
            recipients: {
              create: recipientsList.map(r => ({
                guardianId: r.guardianId,
                emailSubject: r.emailSubject,
                emailBodyHtml: r.emailBodyHtml,
                whatsappText: r.whatsappText,
                emailStatus: 'PENDING',
                whatsappStatus: 'PENDING'
              }))
            }
          }
        });
        draftCampaignId = campaign.id;
      } catch (dbErr) {
        console.warn('Could not persist draft to database, returning memory draft id', dbErr);
      }
    }

    return NextResponse.json({
      draftId: draftCampaignId,
      intent,
      recipients: recipientsList,
      messages: messagesList,
      count: recipientsList.length
    });
  } catch (err: any) {
    console.error('Error generating messages:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
