import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json({ success: false, error: 'Student name is required' }, { status: 400 });
    }

    let teacher = null;
    if (body.teacherId) {
      teacher = await prisma.teacher.findUnique({ where: { id: body.teacherId } });
    }
    if (!teacher) {
      teacher = await prisma.teacher.findFirst();
    }
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'No teacher found' }, { status: 400 });
    }

    const studentId = body.id || `STU-${Date.now()}`;
    const transport = body.transport || 'Bus 14';
    const busRoute = body.busRoute || (transport.toLowerCase().includes('bus') ? transport : null);

    const student = await prisma.student.create({
      data: {
        id: studentId,
        teacherId: teacher.id,
        name: body.name.trim(),
        gender: body.gender || 'Other',
        transport: transport,
        busRoute: busRoute,
        busStop: body.busStop || null,
        busSeat: body.busSeat || null,
        stayBack: Boolean(body.stayBack),
        remedial: Boolean(body.remedial),
        lastScore: typeof body.lastScore === 'number' ? body.lastScore : parseFloat(body.lastScore) || null,
        consentStatus: (body.consentStatus || 'PENDING').toUpperCase(),
        medicalAlert: body.medicalAlert || null,
        guardians: {
          create: {
            id: `guard-${studentId}`,
            name: body.parentName || body.guardianName || `Parent of ${body.name}`,
            salutation: body.parentSalutation || body.salutation || 'Mr./Mrs.',
            email: body.parentEmail || body.email || '',
            whatsappNumber: body.parentWhatsApp || body.phone || body.whatsappNumber || '',
            preferredChannel: body.preferredChannel || 'BOTH'
          }
        }
      },
      include: {
        guardians: true
      }
    });

    return NextResponse.json({
      success: true,
      student,
      message: `Student "${student.name}" added successfully`
    }, { status: 201 });
  } catch (err: any) {
    console.error('Error adding student:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = body.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Student id is required' }, { status: 400 });
    }

    const existingStudent = await prisma.student.findUnique({
      where: { id },
      include: { guardians: true }
    });

    if (!existingStudent) {
      return NextResponse.json({ success: false, error: `Student with id ${id} not found` }, { status: 404 });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.transport !== undefined) {
      updateData.transport = body.transport;
      if (body.busRoute === undefined && body.transport.toLowerCase().includes('bus')) {
        updateData.busRoute = body.transport;
      }
    }
    if (body.busRoute !== undefined) updateData.busRoute = body.busRoute;
    if (body.busStop !== undefined) updateData.busStop = body.busStop;
    if (body.busSeat !== undefined) updateData.busSeat = body.busSeat;
    if (body.stayBack !== undefined) updateData.stayBack = Boolean(body.stayBack);
    if (body.remedial !== undefined) updateData.remedial = Boolean(body.remedial);
    if (body.lastScore !== undefined) updateData.lastScore = body.lastScore !== null ? Number(body.lastScore) : null;
    if (body.consentStatus !== undefined) updateData.consentStatus = body.consentStatus.toUpperCase();
    if (body.medicalAlert !== undefined) updateData.medicalAlert = body.medicalAlert;

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: updateData,
      include: { guardians: true }
    });

    // Update guardian info if provided
    const hasParentUpdates = body.parentName || body.parentSalutation || body.parentEmail || body.parentWhatsApp || body.preferredChannel;
    if (hasParentUpdates) {
      const primaryGuardian = existingStudent.guardians[0];
      const guardianData: any = {};
      if (body.parentName) guardianData.name = body.parentName;
      if (body.parentSalutation) guardianData.salutation = body.parentSalutation;
      if (body.parentEmail) guardianData.email = body.parentEmail;
      if (body.parentWhatsApp) guardianData.whatsappNumber = body.parentWhatsApp;
      if (body.preferredChannel) guardianData.preferredChannel = body.preferredChannel;

      if (primaryGuardian) {
        await prisma.guardian.update({
          where: { id: primaryGuardian.id },
          data: guardianData
        });
      } else {
        await prisma.guardian.create({
          data: {
            id: `guard-${id}`,
            studentId: id,
            name: body.parentName || `Parent of ${updatedStudent.name}`,
            salutation: body.parentSalutation || 'Mr./Mrs.',
            email: body.parentEmail || '',
            whatsappNumber: body.parentWhatsApp || '',
            preferredChannel: body.preferredChannel || 'BOTH'
          }
        });
      }
    }

    const finalStudent = await prisma.student.findUnique({
      where: { id },
      include: { guardians: true }
    });

    return NextResponse.json({
      success: true,
      student: finalStudent,
      message: `Student "${finalStudent?.name}" updated successfully`
    });
  } catch (err: any) {
    console.error('Error updating student:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    let id: string | null = null;
    const url = new URL(request.url);
    id = url.searchParams.get('id');

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Student id is required' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: { guardians: true }
    });

    if (!student) {
      return NextResponse.json({ success: false, error: `Student with id ${id} not found` }, { status: 404 });
    }

    // Clean up dependent records in foreign key order
    const guardianIds = student.guardians.map(g => g.id);
    if (guardianIds.length > 0) {
      await prisma.messageRecipient.deleteMany({
        where: { guardianId: { in: guardianIds } }
      });
      await prisma.guardian.deleteMany({
        where: { id: { in: guardianIds } }
      });
    }

    await prisma.assessmentScore.deleteMany({
      where: { studentId: id }
    });

    await prisma.student.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      id,
      message: `Student "${student.name}" deleted successfully`
    });
  } catch (err: any) {
    console.error('Error deleting student:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
