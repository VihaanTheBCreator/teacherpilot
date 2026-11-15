import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cancelCampaign } from '@/lib/dispatch';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const campaignId = body.campaignId;

    if (!campaignId) {
      return NextResponse.json({ success: false, error: 'campaignId is required' }, { status: 400 });
    }

    // Cancel in dispatch queue
    const cancelRes = cancelCampaign(campaignId);

    // Update in database
    await prisma.dispatchCampaign.update({
      where: { id: campaignId },
      data: { status: 'CANCELLED' }
    }).catch(() => {});

    if (cancelRes && cancelRes.success === false && cancelRes.status !== 'CANCELLED') {
      return NextResponse.json({
        success: false,
        error: cancelRes.error || 'Undo window has expired',
        status: cancelRes.status
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      campaignId,
      status: 'CANCELLED',
      message: 'Campaign cancelled within 10s undo window. No messages dispatched.'
    });
  } catch (err: any) {
    console.error('Error undoing campaign:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
