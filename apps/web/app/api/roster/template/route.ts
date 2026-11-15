import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CSV_HEADER = 'name,gender,parentName,parentSalutation,parentEmail,parentWhatsApp,transport,busRoute,busStop,busSeat,stayBack,remedial,lastScore,consentStatus,medicalAlert';

const SAMPLE_ROWS = [
  'Aarav Sharma,Male,Rajesh Sharma,Mr.,rajesh.sharma@example.com,+971501234567,Bus 14,Bus 14,Al Barsha Heights 1,12A,true,false,82,SUBMITTED,',
  'Diya Sengupta,Female,Ananya Sengupta,Mrs.,ananya.s@example.com,+971509876543,Own Transport,,Gate 2 Private Pickup,,false,true,41,PENDING,Asthma inhaler in clinic'
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get('format');

  if (format === 'json') {
    return NextResponse.json({
      headers: CSV_HEADER.split(','),
      sampleRows: [
        {
          name: 'Aarav Sharma',
          gender: 'Male',
          parentName: 'Rajesh Sharma',
          parentSalutation: 'Mr.',
          parentEmail: 'rajesh.sharma@example.com',
          parentWhatsApp: '+971501234567',
          transport: 'Bus 14',
          busRoute: 'Bus 14',
          busStop: 'Al Barsha Heights 1',
          busSeat: '12A',
          stayBack: true,
          remedial: false,
          lastScore: 82,
          consentStatus: 'SUBMITTED',
          medicalAlert: null
        },
        {
          name: 'Diya Sengupta',
          gender: 'Female',
          parentName: 'Ananya Sengupta',
          parentSalutation: 'Mrs.',
          parentEmail: 'ananya.s@example.com',
          parentWhatsApp: '+971509876543',
          transport: 'Own Transport',
          busRoute: null,
          busStop: 'Gate 2 Private Pickup',
          busSeat: null,
          stayBack: false,
          remedial: true,
          lastScore: 41,
          consentStatus: 'PENDING',
          medicalAlert: 'Asthma inhaler in clinic'
        }
      ]
    });
  }

  const csvContent = [CSV_HEADER, ...SAMPLE_ROWS].join('\r\n') + '\r\n';

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="gems_class_roster_template.csv"',
      'Cache-Control': 'no-cache'
    }
  });
}
