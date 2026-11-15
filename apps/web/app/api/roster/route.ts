import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const dbStudents = await prisma.student.findMany({
      include: {
        guardians: true,
        assessments: {
          orderBy: { date: 'desc' },
          take: 5
        },
        teacher: true
      },
      orderBy: { name: 'asc' }
    });

    const students = dbStudents.map((s) => {
      const primaryGuardian = s.guardians[0] || null;
      return {
        ...s,
        parentName: primaryGuardian?.name || null,
        parentSalutation: primaryGuardian?.salutation || null,
        parentEmail: primaryGuardian?.email || null,
        parentWhatsApp: primaryGuardian?.whatsappNumber || null,
        guardianName: primaryGuardian?.name || null,
        guardianEmail: primaryGuardian?.email || null,
        guardianWhatsApp: primaryGuardian?.whatsappNumber || null
      };
    });

    return NextResponse.json({
      students,
      total: students.length
    });
  } catch (err: any) {
    console.error('Error fetching roster:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
