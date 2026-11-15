/**
 * TeacherPilot - Verification Test Suite for packages/dispatch
 *
 * Tests:
 * 1. Strict 1-to-1 email isolation (CC/BCC rejection + single recipient dispatch)
 * 2. 1-to-1 WhatsApp dispatch (phone normalization + dryRun simulation + school sandbox fallback)
 * 3. Multi-tenant WhatsApp session resolution & unlinked sandbox protection
 * 4. 10-second undo dispatch queue - successful cancellation during undo window
 * 5. 10-second undo dispatch queue - execution upon undo window expiration with status tracking
 */

const assert = require('assert');
const {
  sendEmail,
  validateStrictSingleRecipient,
  sendWhatsApp,
  normalizePhoneNumber,
  createDispatchQueue
} = require('./index');

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING TEACHERPILOT DISPATCH ENGINE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`• Testing: ${name} ... `);
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log('❌ FAILED');
      console.error(err);
      failed++;
    }
  }

  // --- 1. EMAIL TESTS ---
  console.log('\n--- 1. EMAIL DISPATCH TESTS ---');

  await test('Reject CC address to prevent guardian data leak (PDPL rule)', async () => {
    let errorCaught = false;
    try {
      await sendEmail({
        to: 'parent1@gmail.com',
        cc: 'parent2@gmail.com',
        subject: 'Stay-back update',
        html: '<p>Stay-back cancelled</p>'
      });
    } catch (e) {
      errorCaught = true;
      assert.ok(e.message.includes('CC and BCC are strictly forbidden'));
    }
    const res = await sendEmail({
      to: 'parent1@gmail.com',
      cc: 'parent2@gmail.com',
      subject: 'Stay-back update',
      html: '<p>Stay-back cancelled</p>'
    });
    assert.strictEqual(res.success, false);
    assert.ok(res.error.includes('CC and BCC are strictly forbidden'));
  });

  await test('Reject multiple recipients in "to" field (PDPL rule)', async () => {
    const res = await sendEmail({
      to: 'parent1@gmail.com, parent2@gmail.com',
      subject: 'Stay-back update',
      html: '<p>Update</p>'
    });
    assert.strictEqual(res.success, false);
    assert.ok(res.error.includes('Multiple recipients detected'));
  });

  await test('Dispatch isolated 1-to-1 simulated email successfully', async () => {
    const res = await sendEmail({
      to: 'parent@gems.edu',
      subject: 'Class 11-A: Stay-back Update for Aarav',
      html: '<p>Dear Mr. Sharma, Aarav will board Bus 14 today.</p>',
      dryRun: true
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.simulated, true);
    assert.strictEqual(res.recipient, 'parent@gems.edu');
    assert.ok(res.messageId.startsWith('sim-mail-'));
    assert.ok(res.timestamp instanceof Date);
  });

  // --- 2. WHATSAPP TESTS ---
  console.log('\n--- 2. WHATSAPP DISPATCH TESTS ---');

  await test('Normalize UAE phone numbers to standard E.164 format', async () => {
    assert.strictEqual(normalizePhoneNumber('+971 50 123 4567'), '+971501234567');
    assert.strictEqual(normalizePhoneNumber('0501234567'), '+971501234567');
    assert.strictEqual(normalizePhoneNumber('971501234567'), '+971501234567');
  });

  await test('Dispatch 1-to-1 WhatsApp in simulation/dry-run mode', async () => {
    const res = await sendWhatsApp({
      recipient: '+971501234567',
      message: '📢 GEMS OOIS Alert: Stay-back for Aarav is cancelled today. Regular Bus 14 at 2:15 PM.',
      dryRun: true
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.simulated, true);
    assert.strictEqual(res.recipient, '+971501234567');
    assert.ok(res.timestamp instanceof Date);
  });

  await test('Graceful School Sandbox mode when teacher session is unlinked', async () => {
    const res = await sendWhatsApp({
      recipient: '+971501234567',
      message: '📢 School test notification',
      teacherId: 'teacher-unlinked-999',
      sessionPath: '/tmp/nonexistent-session-dir',
      dryRun: false
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.sandbox, true);
    assert.strictEqual(res.simulated, true);
    assert.ok(res.output.includes('SANDBOX:'));
  });

  await test('Reject empty WhatsApp message body', async () => {
    const res = await sendWhatsApp({
      recipient: '+971501234567',
      message: '   ',
      dryRun: true
    });
    assert.strictEqual(res.success, false);
    assert.ok(res.error.includes('cannot be empty'));
  });

  // --- 3. QUEUE TESTS: UNDO CANCELLATION ---
  console.log('\n--- 3. 10-SECOND UNDO QUEUE: CANCELLATION ---');

  await test('Queue campaign into WAITING_UNDO and cancel within grace window', async () => {
    const queue = createDispatchQueue({
      undoWindowMs: 2000, // fast 2s window for unit test
      dryRun: true
    });

    const campaign = queue.queueCampaign({
      teacherId: 'teacher-1',
      prompt: 'Stay-back cancelled today',
      scenario: 'stayback_cancel',
      recipients: [
        {
          guardianName: 'Rajesh Sharma',
          studentName: 'Aarav Sharma',
          email: 'rajesh@example.com',
          whatsappNumber: '+971501234567',
          emailSubject: 'Stay-back cancelled for Aarav',
          emailBodyHtml: '<p>Aarav will board regular bus at 2:15 PM.</p>',
          whatsappText: 'Aarav will board regular bus 14 at 2:15 PM.'
        }
      ]
    });

    assert.strictEqual(campaign.status, 'WAITING_UNDO');
    assert.strictEqual(campaign.recipientCount, 1);
    assert.ok(campaign.undoExpiresAt instanceof Date);

    // Verify stored state is WAITING_UNDO
    const stored = queue.getCampaign(campaign.campaignId);
    assert.strictEqual(stored.status, 'WAITING_UNDO');

    // Cancel after 400ms (within the window)
    await new Promise((r) => setTimeout(r, 400));
    const cancelRes = queue.cancelCampaign(campaign.campaignId);

    assert.strictEqual(cancelRes.success, true);
    assert.strictEqual(cancelRes.status, 'CANCELLED');

    // Wait until past the 2000ms window to guarantee nothing dispatched
    await new Promise((r) => setTimeout(r, 1800));

    const finalStored = queue.getCampaign(campaign.campaignId);
    assert.strictEqual(finalStored.status, 'CANCELLED');
    assert.strictEqual(finalStored.dispatchedAt, null);
    assert.strictEqual(finalStored.recipients[0].emailStatus, 'PENDING');
    assert.strictEqual(finalStored.recipients[0].whatsappStatus, 'PENDING');

    queue.destroy();
  });

  // --- 4. QUEUE TESTS: FULL DISPATCH EXECUTION ---
  console.log('\n--- 4. 10-SECOND UNDO QUEUE: EXPIRATION & DISPATCH ---');

  await test('Queue campaign, allow window to expire, and execute sequential 1-to-1 dispatch', async () => {
    const queue = createDispatchQueue({
      undoWindowMs: 1500, // 1.5s for fast automated test
      recipientIntervalMs: 50,
      dryRun: true
    });

    let dispatchingEmitted = false;
    let completedEmitted = false;
    const dispatchedRecipients = [];

    queue.on('campaign:dispatching', () => {
      dispatchingEmitted = true;
    });

    queue.on('recipient:dispatched', ({ recipient }) => {
      dispatchedRecipients.push(recipient);
    });

    const completionPromise = new Promise((resolve) => {
      queue.on('campaign:completed', ({ campaign }) => {
        completedEmitted = true;
        resolve(campaign);
      });
    });

    const campaign = queue.queueCampaign({
      teacherId: 'teacher-vihaan',
      prompt: 'Bus 14 running 25 mins late',
      scenario: 'bus_delay',
      recipients: [
        {
          guardianName: 'Priya Iyer',
          studentName: 'Ananya Iyer',
          email: 'priya.iyer@example.com',
          whatsappNumber: '+971501234567',
          emailSubject: 'Bus 14 Delay Notice - Ananya Iyer',
          emailBodyHtml: '<p>Dear Mrs. Iyer, Bus 14 is delayed by 25 mins.</p>',
          whatsappText: '🚌 Bus 14 is delayed by 25 mins due to Al Khail Road traffic.'
        },
        {
          guardianName: 'Mohammed Al-Maktoum',
          studentName: 'Zayed Al-Maktoum',
          email: 'mohammed.z@example.com',
          whatsappNumber: '+971509876543',
          emailSubject: 'Bus 14 Delay Notice - Zayed Al-Maktoum',
          emailBodyHtml: '<p>Dear Mr. Al-Maktoum, Bus 14 is delayed by 25 mins.</p>',
          whatsappText: '🚌 Bus 14 is delayed by 25 mins due to Al Khail Road traffic.'
        }
      ]
    });

    assert.strictEqual(campaign.status, 'WAITING_UNDO');

    // Wait for completion
    const completedCampaign = await completionPromise;

    assert.strictEqual(dispatchingEmitted, true);
    assert.strictEqual(completedEmitted, true);
    assert.strictEqual(completedCampaign.status, 'COMPLETED');
    assert.ok(completedCampaign.dispatchedAt instanceof Date);
    assert.ok(completedCampaign.completedAt instanceof Date);
    assert.strictEqual(completedCampaign.recipients.length, 2);

    // Verify all recipients have SENT status and timestamps
    for (const rec of completedCampaign.recipients) {
      assert.strictEqual(rec.emailStatus, 'SENT');
      assert.strictEqual(rec.whatsappStatus, 'SENT');
      assert.ok(rec.emailSentAt instanceof Date);
      assert.ok(rec.whatsappSentAt instanceof Date);
    }

    assert.strictEqual(dispatchedRecipients.length, 2);

    // Verify that attempting to cancel an already COMPLETED campaign fails gracefully
    const lateCancel = queue.cancelCampaign(campaign.campaignId);
    assert.strictEqual(lateCancel.success, false);
    assert.strictEqual(lateCancel.status, 'COMPLETED');

    queue.destroy();
  });

  console.log('\n====================================================');
  console.log(`📊 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
