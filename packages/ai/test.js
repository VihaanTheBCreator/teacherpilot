/**
 * Test Runner for packages/ai
 * Verifies all 5 scenarios generate proper email & whatsapp formats,
 * parses natural language prompts correctly, enforces SBI filtering,
 * and maintains WhatsApp length under 400 characters.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  parseIntent,
  parseIntentOffline,
  generateMessage,
  generateMessages,
  presets,
  applySbiFilter
} = require('./index');

// Load sample roster
const rosterPath = path.resolve(__dirname, '../../teacherpilot/roster.json');
let roster = [];
try {
  roster = JSON.parse(fs.readFileSync(rosterPath, 'utf-8'));
} catch (e) {
  // Fallback in case path differs
  roster = [
    {
      id: "STU-101",
      name: "Vihaan Bhandari",
      parentName: "Vrajesh Bhandari",
      parentSalutation: "Mr.",
      parentEmail: "vrajesh.bhandari@gmail.com",
      parentWhatsApp: "+971501769909",
      transport: "Bus 14",
      busStop: "Al Barsha Heights, Tecom Block A",
      busSeat: "12A",
      stayBack: true,
      remedial: false,
      lastScore: 78,
      consentStatus: "SUBMITTED"
    },
    {
      id: "STU-102",
      name: "Ayaan Patel",
      parentName: "Sunil Patel",
      parentSalutation: "Mr.",
      parentEmail: "sunil.patel.dxb@gmail.com",
      parentWhatsApp: "+971503344551",
      transport: "Bus 14",
      busStop: "The Greens, Al Sidir 3",
      busSeat: "14B",
      stayBack: true,
      remedial: true,
      lastScore: 32,
      consentStatus: "PENDING"
    },
    {
      id: "STU-103",
      name: "Fatima Al-Mansoor",
      parentName: "Mansoor Al-Mansoor",
      parentSalutation: "Mr.",
      parentEmail: "mansoor.almansoor@outlook.com",
      parentWhatsApp: "+971508899112",
      transport: "Own Transport",
      busStop: "Gate 3 (Private Pickup)",
      stayBack: false,
      remedial: false,
      lastScore: 91,
      consentStatus: "SUBMITTED"
    }
  ];
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 Running TeacherPilot AI Engine Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  async function asyncTest(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  // --- TEST GROUP 1: Presets ---
  console.log('📦 Test Group 1: Preset Scenarios');
  test('Presets array contains exactly 5 scenarios', () => {
    assert.strictEqual(presets.length, 5);
    const expectedIds = ['stayback_cancel', 'bus_delay', 'remedial', 'consent_chase', 'praise'];
    for (const id of expectedIds) {
      assert.ok(presets.find(p => p.id === id), `Missing scenario: ${id}`);
    }
  });

  // --- TEST GROUP 2: Intent Parsing ---
  console.log('\n🧠 Test Group 2: Intent Parsing (Offline & Fallback)');
  
  test('Scenario 1: Stay-back cancellation detection', () => {
    const intent = parseIntentOffline('Stay-back for Grade 11-Commerce cancelled today, regular bus at 2:10 PM');
    assert.strictEqual(intent.scenario, 'stayback_cancel');
    assert.strictEqual(intent.targetFilter.stayBack, true);
    assert.strictEqual(intent.urgency, 'immediate');
    assert.ok(intent.keyFacts.length >= 1);
  });

  test('Scenario 2: Bus delay detection', () => {
    const intent = parseIntentOffline('Bus 14 is running 25 mins late due to roadworks');
    assert.strictEqual(intent.scenario, 'bus_delay');
    assert.strictEqual(intent.targetFilter.busRoute, 'Bus 14');
    assert.strictEqual(intent.urgency, 'immediate');
    assert.ok(intent.keyFacts.some(f => f.includes('Bus 14')));
  });

  test('Scenario 3: Remedial notice detection', () => {
    const intent = parseIntentOffline('Diagnostic Unit Test 2: students scoring below 35% require remedial revision');
    assert.strictEqual(intent.scenario, 'remedial');
    assert.strictEqual(intent.targetFilter.remedial, true);
    assert.strictEqual(intent.urgency, 'today');
  });

  test('Scenario 4: Field trip consent chasing', () => {
    const intent = parseIntentOffline('Reminder: Field trip consent and AED 95 fee for Dubai Museum due in 48 hours');
    assert.strictEqual(intent.scenario, 'consent_chase');
    assert.strictEqual(intent.targetFilter.consentStatus, 'PENDING');
    assert.strictEqual(intent.urgency, 'today');
  });

  test('Scenario 5: Star student commendation', () => {
    const intent = parseIntentOffline('Commendation for star student: outstanding consistency and classroom leadership');
    assert.strictEqual(intent.scenario, 'praise');
    assert.strictEqual(intent.urgency, 'planning');
    assert.strictEqual(intent.tone, 'Warm');
  });

  // --- TEST GROUP 3: SBI Behavior Filtering ---
  console.log('\n🛡️ Test Group 3: Situation-Behavior-Impact (SBI) Filtering');

  test('Strips accusatory blame language ("he always disturbs")', () => {
    const raw = "He always disturbs the class and doesn't listen.";
    const filtered = applySbiFilter(raw);
    assert.ok(!filtered.includes('always disturbs'));
    assert.ok(filtered.includes('Classroom focus'));
  });

  test('Strips "he is failing" and "lazy"', () => {
    const raw = "He is lazy and he is failing";
    const filtered = applySbiFilter(raw);
    assert.ok(!filtered.includes('lazy'));
    assert.ok(!filtered.includes('failing'));
    assert.ok(filtered.includes('benchmark') || filtered.includes('engagement'));
  });

  // --- TEST GROUP 4: Message Generation for All 5 Scenarios ---
  console.log('\n✉️ Test Group 4: Dual-Channel Message Generation & Formatting');

  for (const preset of presets) {
    await asyncTest(`Generate dual-channel messages for scenario [${preset.id}]`, async () => {
      const intent = parseIntentOffline(preset.prompt, { tone: preset.tone });
      const sampleStudent = roster[0]; // Vihaan Bhandari
      const guardian = {
        name: sampleStudent.parentName,
        salutation: sampleStudent.parentSalutation,
        email: sampleStudent.parentEmail,
        whatsappNumber: sampleStudent.parentWhatsApp
      };

      const msg = await generateMessage(intent, sampleStudent, guardian);

      // Verify Student & Guardian Personalization
      assert.strictEqual(msg.studentId, sampleStudent.id);
      assert.strictEqual(msg.studentName, sampleStudent.name);
      assert.strictEqual(msg.guardianEmail, sampleStudent.parentEmail);
      assert.strictEqual(msg.guardianWhatsApp, sampleStudent.parentWhatsApp);

      // Verify Email Subject
      assert.ok(msg.emailSubject.length > 5, 'Email subject should be populated');
      assert.ok(msg.emailSubject.includes(sampleStudent.name), 'Email subject must include student name');

      // Verify HTML Email Body
      assert.ok(msg.emailBodyHtml.includes('#005a36'), 'HTML email must include GEMS green branding (#005a36)');
      assert.ok(msg.emailBodyHtml.includes('GEMS OUR OWN INDIAN SCHOOL'), 'HTML email must include School header');
      assert.ok(msg.emailBodyHtml.includes(guardian.salutation), 'HTML email must include guardian salutation');
      assert.ok(msg.emailBodyHtml.includes(sampleStudent.name), 'HTML email must include student name');
      assert.ok(msg.emailBodyHtml.includes('Ms. Sunita Sharma'), 'HTML email must include teacher signature');

      // Verify WhatsApp Message
      assert.ok(msg.whatsappText.length > 10, 'WhatsApp text must not be empty');
      assert.ok(msg.whatsappText.length <= 400, `WhatsApp text must be < 400 chars (was ${msg.whatsappText.length})`);
      assert.ok(msg.whatsappText.includes(sampleStudent.name), 'WhatsApp text must include student name');
      assert.ok(msg.whatsappText.includes(guardian.salutation), 'WhatsApp text must include parent salutation');
    });
  }

  // --- TEST GROUP 5: Batch Message Generation & PII Isolation ---
  console.log('\n🔒 Test Group 5: Batch Generation & 100% PII Isolation');

  await asyncTest('Batch generation for 8 roster students with zero PII cross-contamination', async () => {
    const intent = parseIntentOffline(presets[0].prompt);
    const messages = await generateMessages(intent, roster);

    assert.strictEqual(messages.length, roster.length);

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const student = roster[i];

      // Must have own student's name
      assert.ok(msg.emailBodyHtml.includes(student.name), `Message ${i} must include ${student.name}`);
      assert.strictEqual(msg.guardianEmail, student.parentEmail);

      // Must NOT contain other students' names in private greeting / subject
      for (let j = 0; j < roster.length; j++) {
        if (i !== j) {
          const otherStudent = roster[j];
          assert.ok(
            !msg.emailSubject.includes(otherStudent.name),
            `Email subject leak: found ${otherStudent.name} in message for ${student.name}`
          );
          assert.ok(
            !msg.whatsappText.includes(otherStudent.name),
            `WhatsApp leak: found ${otherStudent.name} in message for ${student.name}`
          );
        }
      }
    }
  });

  console.log('\n====================================================');
  console.log(`🏁 Test Summary: ${passed}/${total} passed`);
  console.log('====================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
