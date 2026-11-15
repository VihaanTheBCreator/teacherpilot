import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Seeded/standard GEMS teacher profiles
const DEFAULT_TEACHERS = [
  {
    id: 'teacher-vihaan',
    name: 'Vihaan Bhandari',
    email: 'vihaan.bhandari@gemsedu.com',
    classGrade: '11-A',
    role: 'Class Teacher & Department Head'
  },
  {
    id: 'teacher-sunita',
    name: 'Sunita Sharma',
    email: 'sunita.sharma@gemsedu.com',
    classGrade: '10-B',
    role: 'Senior Science Teacher'
  }
];

async function ensureDefaultTeachers() {
  let school = await prisma.school.findFirst();
  if (!school) {
    school = await prisma.school.create({
      data: {
        id: 'gems-oow-001',
        name: 'GEMS Our Own Indian School',
        brandColor: '#005a36'
      }
    });
  }

  for (const def of DEFAULT_TEACHERS) {
    const existing = await prisma.teacher.findFirst({
      where: {
        OR: [{ id: def.id }, { email: def.email }]
      }
    });
    if (!existing) {
      await prisma.teacher.create({
        data: {
          id: def.id,
          schoolId: school.id,
          name: def.name,
          email: def.email,
          classGrade: def.classGrade,
          gmailToken: '{"simulated":true}'
        }
      });
    }
  }

  return school;
}

export async function GET() {
  try {
    await ensureDefaultTeachers();
    const teachers = await prisma.teacher.findMany({
      include: { school: true }
    });

    return NextResponse.json({
      success: true,
      availableTeachers: teachers.map(t => ({
        id: t.id,
        name: t.name,
        email: t.email,
        classGrade: t.classGrade,
        schoolName: t.school?.name || 'GEMS Our Own Indian School'
      }))
    });
  } catch (err: any) {
    console.error('Error in GET /api/auth/login:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const school = await ensureDefaultTeachers();
    const body = await request.json().catch(() => ({}));
    const { teacherId, email, name, classGrade } = body;

    let teacher = null;

    if (teacherId) {
      teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
        include: { school: true }
      });
    }

    if (!teacher && email) {
      teacher = await prisma.teacher.findUnique({
        where: { email },
        include: { school: true }
      });
    }

    // If teacher doesn't exist yet but email/name is provided (e.g. Google SSO or new registration)
    if (!teacher && (email || name)) {
      const targetEmail = email || `${(name || 'teacher').toLowerCase().replace(/\s+/g, '.')}@gemsedu.com`;
      const targetName = name || (email ? email.split('@')[0].replace('.', ' ') : 'Teacher');
      const targetGrade = classGrade || '11-A';
      const targetId = `teacher-${Date.now()}`;

      teacher = await prisma.teacher.create({
        data: {
          id: targetId,
          schoolId: school.id,
          name: targetName,
          email: targetEmail,
          classGrade: targetGrade,
          gmailToken: '{"simulated":true}'
        },
        include: { school: true }
      });
    }

    // Default fallback to first teacher in DB
    if (!teacher) {
      teacher = await prisma.teacher.findFirst({
        include: { school: true }
      });
    }

    const available = await prisma.teacher.findMany({
      include: { school: true }
    });

    const teacherData = {
      id: teacher?.id,
      name: teacher?.name,
      email: teacher?.email,
      classGrade: teacher?.classGrade,
      schoolName: teacher?.school?.name || 'GEMS Our Own Indian School',
      brandColor: teacher?.school?.brandColor || '#005a36'
    };

    const response = NextResponse.json({
      success: true,
      teacher: teacherData,
      availableTeachers: available.map(t => ({
        id: t.id,
        name: t.name,
        email: t.email,
        classGrade: t.classGrade
      })),
      message: `Signed in as ${teacherData.name} (${teacherData.classGrade})`
    });

    // Set active session cookie
    response.cookies.set('teacherpilot_session', JSON.stringify({
      teacherId: teacherData.id,
      email: teacherData.email,
      name: teacherData.name
    }), {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('Error in POST /api/auth/login:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
