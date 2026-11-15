import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function parseCsv(csvText: string): any[] {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const headers = parseLine(lines[0]).map(h => h.replace(/^["']|["']$/g, '').toLowerCase());
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]).map(c => c.replace(/^["']|["']$/g, ''));
    const obj: any = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] || '';
    });

    const isTrue = (val: string) => ['true', 'yes', '1', 'y'].includes((val || '').toLowerCase());

    const studentObj = {
      id: obj['id'] || obj['studentid'] || undefined,
      name: obj['name'] || obj['studentname'] || obj['student'] || 'Unnamed Student',
      gender: obj['gender'] || 'Other',
      parentName: obj['parentname'] || obj['guardianname'] || obj['parent'] || 'Parent',
      parentSalutation: obj['parentsalutation'] || obj['salutation'] || 'Mr./Mrs.',
      parentEmail: obj['parentemail'] || obj['email'] || '',
      parentWhatsApp: obj['parentwhatsapp'] || obj['whatsapp'] || obj['phone'] || '',
      transport: obj['transport'] || 'Bus',
      busRoute: obj['busroute'] || obj['bus'] || null,
      busStop: obj['busstop'] || null,
      busSeat: obj['busseat'] || null,
      stayBack: isTrue(obj['stayback']),
      remedial: isTrue(obj['remedial']),
      lastScore: parseFloat(obj['lastscore'] || obj['score'] || '0') || null,
      consentStatus: (obj['consentstatus'] || obj['consent'] || 'PENDING').toUpperCase(),
      medicalAlert: obj['medicalalert'] || null
    };
    rows.push(studentObj);
  }

  return rows;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let rawItems: any[] = [];
    const errors: string[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as Blob | null;
      if (!file) {
        return NextResponse.json({ success: false, error: 'No file provided in form-data' }, { status: 400 });
      }
      const text = await file.text();
      try {
        const json = JSON.parse(text);
        rawItems = Array.isArray(json) ? json : (json.students || []);
      } catch {
        rawItems = parseCsv(text);
      }
    } else {
      const body = await request.json().catch(() => null);
      if (body) {
        if (Array.isArray(body)) {
          rawItems = body;
        } else if (Array.isArray(body.students)) {
          rawItems = body.students;
        } else if (typeof body.csvText === 'string') {
          rawItems = parseCsv(body.csvText);
        }
      } else {
        const text = await request.text();
        rawItems = parseCsv(text);
      }
    }

    if (!rawItems || rawItems.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid student records found to import' }, { status: 400 });
    }

    let teacher = await prisma.teacher.findFirst();
    if (!teacher) {
      const school = await prisma.school.create({
        data: { name: 'GEMS Our Own Indian School', brandColor: '#005a36' }
      });
      teacher = await prisma.teacher.create({
        data: {
          id: 'teacher-vihaan',
          schoolId: school.id,
          name: 'Vihaan Bhandari',
          email: 'vihaan.bhandari@gemsedu.com',
          classGrade: '11-A'
        }
      });
    }

    let importedCount = 0;

    for (const item of rawItems) {
      try {
        const studentId = item.id || `STU-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const busRoute = item.busRoute || (item.transport && item.transport.toLowerCase().includes('bus') ? item.transport : null);

        const student = await prisma.student.upsert({
          where: { id: studentId },
          update: {
            name: item.name,
            gender: item.gender || 'Other',
            transport: item.transport || 'Bus 14',
            busRoute: busRoute,
            busStop: item.busStop || null,
            busSeat: item.busSeat || null,
            stayBack: Boolean(item.stayBack),
            remedial: Boolean(item.remedial),
            lastScore: item.lastScore !== null && item.lastScore !== undefined ? Number(item.lastScore) : null,
            consentStatus: item.consentStatus || 'PENDING',
            medicalAlert: item.medicalAlert || null
          },
          create: {
            id: studentId,
            teacherId: teacher.id,
            name: item.name,
            gender: item.gender || 'Other',
            transport: item.transport || 'Bus 14',
            busRoute: busRoute,
            busStop: item.busStop || null,
            busSeat: item.busSeat || null,
            stayBack: Boolean(item.stayBack),
            remedial: Boolean(item.remedial),
            lastScore: item.lastScore !== null && item.lastScore !== undefined ? Number(item.lastScore) : null,
            consentStatus: item.consentStatus || 'PENDING',
            medicalAlert: item.medicalAlert || null
          }
        });

        const guardianId = `guard-${student.id}`;
        await prisma.guardian.upsert({
          where: { id: guardianId },
          update: {
            name: item.parentName || item.guardianName || 'Parent',
            salutation: item.parentSalutation || item.guardianSalutation || 'Mr./Mrs.',
            email: item.parentEmail || item.guardianEmail || item.email || '',
            whatsappNumber: item.parentWhatsApp || item.guardianWhatsApp || item.whatsappNumber || ''
          },
          create: {
            id: guardianId,
            studentId: student.id,
            name: item.parentName || item.guardianName || 'Parent',
            salutation: item.parentSalutation || item.guardianSalutation || 'Mr./Mrs.',
            email: item.parentEmail || item.guardianEmail || item.email || '',
            whatsappNumber: item.parentWhatsApp || item.guardianWhatsApp || item.whatsappNumber || ''
          }
        });

        importedCount++;
      } catch (err: any) {
        errors.push(`Failed to import record ${item.name || item.id}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported: importedCount,
      errors
    });
  } catch (err: any) {
    console.error('Error importing roster:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
