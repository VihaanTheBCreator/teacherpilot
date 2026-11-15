const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // 1. Seed School
  const school = await prisma.school.upsert({
    where: { id: 'gems-oow-001' },
    update: {},
    create: {
      id: 'gems-oow-001',
      name: 'GEMS Our Own Indian School',
      brandColor: '#005a36',
      logoUrl: '/gems-logo.png',
    },
  });
  console.log(`Seeded School: ${school.name}`);

  // 2. Seed Teacher
  const teacher = await prisma.teacher.upsert({
    where: { email: 'vihaan.bhandari@gemsedu.com' },
    update: {},
    create: {
      id: 'teacher-vihaan',
      schoolId: school.id,
      name: 'Vihaan Bhandari',
      email: 'vihaan.bhandari@gemsedu.com',
      classGrade: '11-A',
      gmailToken: JSON.stringify({ simulated: true }),
    },
  });
  console.log(`Seeded Teacher: ${teacher.name}`);

  // 3. Read Roster
  const rosterPath = path.resolve(__dirname, '../../../../teacherpilot/roster.json');
  console.log(`Reading roster from: ${rosterPath}`);
  const rosterData = JSON.parse(fs.readFileSync(rosterPath, 'utf8'));

  // 4. Seed Students & Guardians
  for (const item of rosterData) {
    const busRoute = item.transport && item.transport.startsWith('Bus') ? item.transport : null;
    
    const student = await prisma.student.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        gender: item.gender,
        transport: item.transport,
        busRoute: busRoute,
        busStop: item.busStop,
        busSeat: item.busSeat,
        stayBack: Boolean(item.stayBack),
        remedial: Boolean(item.remedial),
        lastScore: item.lastScore !== undefined ? Number(item.lastScore) : null,
        consentStatus: item.consentStatus || 'PENDING',
        medicalAlert: item.medicalAlert || null,
        teacherId: teacher.id,
      },
      create: {
        id: item.id,
        name: item.name,
        gender: item.gender,
        transport: item.transport,
        busRoute: busRoute,
        busStop: item.busStop,
        busSeat: item.busSeat,
        stayBack: Boolean(item.stayBack),
        remedial: Boolean(item.remedial),
        lastScore: item.lastScore !== undefined ? Number(item.lastScore) : null,
        consentStatus: item.consentStatus || 'PENDING',
        medicalAlert: item.medicalAlert || null,
        teacherId: teacher.id,
      },
    });

    // Seed Guardian
    await prisma.guardian.upsert({
      where: { id: `guard-${item.id}` },
      update: {
        name: item.parentName,
        salutation: item.parentSalutation,
        email: item.parentEmail,
        whatsappNumber: item.parentWhatsApp,
        relationship: 'Parent',
        preferredChannel: 'BOTH',
      },
      create: {
        id: `guard-${item.id}`,
        studentId: student.id,
        name: item.parentName,
        salutation: item.parentSalutation,
        email: item.parentEmail,
        whatsappNumber: item.parentWhatsApp,
        relationship: 'Parent',
        preferredChannel: 'BOTH',
      },
    });

    // Seed AssessmentScore if lastScore exists
    if (item.lastScore !== undefined && item.lastScore !== null) {
      await prisma.assessmentScore.create({
        data: {
          studentId: student.id,
          subject: 'Term 1 Mathematics',
          score: Number(item.lastScore),
          maxScore: 100,
        },
      });
    }

    console.log(`Seeded Student: ${student.name} (${student.id}) and Guardian: ${item.parentName}`);
  }

  const countStudents = await prisma.student.count();
  const countGuardians = await prisma.guardian.count();
  console.log(`Seeding complete: ${countStudents} students, ${countGuardians} guardians in database.`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
