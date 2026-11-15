import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const campaigns = await prisma.dispatchCampaign.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        teacher: true,
        recipients: {
          include: {
            guardian: {
              include: {
                student: true
              }
            }
          }
        }
      }
    });

    const summary = campaigns.map(c => {
      const totalRecipients = c.recipients.length;
      const emailSentCount = c.recipients.filter(r => r.emailStatus === 'SENT').length;
      const whatsappSentCount = c.recipients.filter(r => r.whatsappStatus === 'SENT').length;
      const emailFailedCount = c.recipients.filter(r => r.emailStatus === 'FAILED').length;
      const whatsappFailedCount = c.recipients.filter(r => r.whatsappStatus === 'FAILED').length;

      return {
        ...c,
        totalRecipients,
        emailSentCount,
        whatsappSentCount,
        emailFailedCount,
        whatsappFailedCount
      };
    });

    return NextResponse.json({
      campaigns: summary,
      total: summary.length
    });
  } catch (err: any) {
    console.error('Error fetching campaigns:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
