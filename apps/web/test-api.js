/**
 * TeacherPilot Apps/Web API Verification Test Suite
 * Starts the server, runs end-to-end HTTP tests against all required API routes:
 * 1. Health check
 * 2. Roster directory
 * 3. AI intent & dual-channel message compose
 * 4. 10s undo dispatch queue
 * 5. Undo cancellation
 * 6. Campaign audit log
 * 7. Single campaign recipient details
 * 8. Bulk CSV/JSON roster import
 * 9. Teacher Auth Login (Profile switch & SSO)
 * 10. Teacher Auth Session
 * 11. Downloadable CSV Template (/api/roster/template)
 * 12. Single Student Add (/api/roster/student POST)
 * 13. Single Student Update (/api/roster/student PUT)
 * 14. Single Student Delete (/api/roster/student DELETE)
 */

const { spawn } = require('child_process');
const http = require('http');

const PORT = 3055;
const BASE_URL = `http://localhost:${PORT}`;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const method = options.method || 'GET';
  const headers = options.headers || {};
  let body = options.body;

  if (body && typeof body === 'object') {
    body = JSON.stringify(body);
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, { method, headers, body });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return {
    status: res.status,
    headers: res.headers,
    body: json,
    rawText: text
  };
}

async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await request('/api/health');
      if (res.status === 200) {
        return true;
      }
    } catch {
      // server starting
    }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Server failed to start on port ${PORT}`);
}

async function runTests() {
  console.log('🚀 Starting Next.js server on port', PORT, '...');
  const server = spawn('node', ['../../node_modules/.bin/next', 'start', '-p', String(PORT)], {
    cwd: __dirname,
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: String(PORT),
      DISPATCH_DRY_RUN: 'true'
    }
  });

  const cleanup = () => {
    try {
      server.kill('SIGTERM');
    } catch {}
  };

  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  try {
    await waitForServer();
    console.log('✅ Server online at', BASE_URL);

    let passed = 0;
    let failed = 0;

    const assert = (condition, desc) => {
      if (condition) {
        console.log(`  ✓ ${desc}`);
        passed++;
      } else {
        console.error(`  ✗ FAIL: ${desc}`);
        failed++;
      }
    };

    console.log('\n--- 1. Testing GET /api/health ---');
    const healthRes = await request('/api/health');
    assert(healthRes.status === 200, 'Health returns 200 OK');
    assert(healthRes.body?.status === 'ok', 'Health status is ok');

    console.log('\n--- 2. Testing GET /api/roster ---');
    const rosterRes = await request('/api/roster');
    assert(rosterRes.status === 200, 'GET /api/roster returns 200 OK');
    assert(Array.isArray(rosterRes.body?.students), 'Returns students array');
    assert(rosterRes.body?.total >= 8, `Roster has at least 8 seeded students (got ${rosterRes.body?.total})`);
    const student1 = rosterRes.body.students[0];
    assert(student1 && student1.name && student1.guardians, 'Student has name and guardians linked');
    assert(student1.parentName, 'Includes flattened parentName for direct access');

    console.log('\n--- 3. Testing POST /api/compose/generate ---');
    const genRes = await request('/api/compose/generate', {
      method: 'POST',
      body: {
        prompt: 'Stay-back cancelled today, please notify all parents',
        tone: 'Warm',
        teacherId: 'teacher-vihaan'
      }
    });
    assert(genRes.status === 200, 'POST /api/compose/generate returns 200 OK');
    assert(genRes.body?.intent?.scenario === 'stayback_cancel', 'AI parses intent scenario correctly');
    assert(Array.isArray(genRes.body?.recipients) && genRes.body.recipients.length > 0, 'Returns recipients with generated messages');
    const rec1 = genRes.body.recipients[0];
    assert(rec1.emailSubject && rec1.emailSubject.includes('Stay-back'), 'Generates personalized emailSubject');
    assert(rec1.emailBodyHtml && rec1.emailBodyHtml.includes('GEMS'), 'Generates styled school HTML email');
    assert(rec1.whatsappText && rec1.whatsappText.length > 0 && rec1.whatsappText.length < 500, 'Generates WhatsApp flash alert');

    console.log('\n--- 4. Testing POST /api/dispatch/send (with 10s undo window) ---');
    const sendRes = await request('/api/dispatch/send', {
      method: 'POST',
      body: {
        teacherId: 'teacher-vihaan',
        prompt: 'Stay-back cancelled today',
        tone: 'Warm',
        scenario: 'stayback_cancel',
        recipients: genRes.body.recipients.slice(0, 2)
      }
    });
    assert(sendRes.status === 200, 'POST /api/dispatch/send returns 200 OK');
    assert(sendRes.body?.campaignId, 'Returns campaignId');
    assert(sendRes.body?.status === 'WAITING_UNDO', 'Status is WAITING_UNDO');
    assert(sendRes.body?.undoExpiresAt, 'Returns undoExpiresAt timestamp');
    const campaignIdToCancel = sendRes.body.campaignId;

    console.log('\n--- 5. Testing POST /api/dispatch/undo within grace period ---');
    const undoRes = await request('/api/dispatch/undo', {
      method: 'POST',
      body: {
        campaignId: campaignIdToCancel
      }
    });
    assert(undoRes.status === 200, 'POST /api/dispatch/undo returns 200 OK');
    assert(undoRes.body?.success === true, 'Undo returns success: true');
    assert(undoRes.body?.status === 'CANCELLED', 'Campaign status updated to CANCELLED');

    console.log('\n--- 6. Testing GET /api/campaigns ---');
    const campaignsRes = await request('/api/campaigns');
    assert(campaignsRes.status === 200, 'GET /api/campaigns returns 200 OK');
    assert(Array.isArray(campaignsRes.body?.campaigns), 'Returns campaigns array');
    const foundCancelled = campaignsRes.body.campaigns.find(c => c.id === campaignIdToCancel);
    assert(foundCancelled && foundCancelled.status === 'CANCELLED', 'Audit log reflects cancelled campaign');

    console.log('\n--- 7. Testing GET /api/campaigns/:id ---');
    const singleCampRes = await request(`/api/campaigns/${campaignIdToCancel}`);
    assert(singleCampRes.status === 200, 'GET /api/campaigns/:id returns 200 OK');
    assert(singleCampRes.body?.campaign?.id === campaignIdToCancel, 'Returns matching campaign');
    assert(Array.isArray(singleCampRes.body?.recipients), 'Includes individual recipient delivery details');

    console.log('\n--- 8. Testing POST /api/roster/import ---');
    const newStudentId = `STU-TEST-${Date.now()}`;
    const importRes = await request('/api/roster/import', {
      method: 'POST',
      body: {
        students: [
          {
            id: newStudentId,
            name: 'Karan Malhotra',
            gender: 'Male',
            parentName: 'Deepak Malhotra',
            parentSalutation: 'Mr.',
            parentEmail: 'deepak.malhotra@example.com',
            parentWhatsApp: '+971501112233',
            transport: 'Bus 14',
            busStop: 'Tecom Block B',
            stayBack: false,
            remedial: true,
            lastScore: 65,
            consentStatus: 'SUBMITTED'
          }
        ]
      }
    });
    assert(importRes.status === 200, 'POST /api/roster/import returns 200 OK');
    assert(importRes.body?.success === true && importRes.body?.imported === 1, 'Successfully imported 1 student record');

    const rosterCheck = await request('/api/roster');
    const importedStudent = rosterCheck.body?.students?.find(s => s.id === newStudentId);
    assert(importedStudent && importedStudent.name === 'Karan Malhotra', 'Imported student persists and is retrievable via GET /api/roster');

    console.log('\n--- 9. Testing GET & POST /api/auth/login ---');
    const loginGetRes = await request('/api/auth/login');
    assert(loginGetRes.status === 200, 'GET /api/auth/login returns 200 OK');
    assert(Array.isArray(loginGetRes.body?.availableTeachers) && loginGetRes.body.availableTeachers.length >= 2, 'Lists available teachers (Vihaan Bhandari & Sunita Sharma)');

    const loginPostRes = await request('/api/auth/login', {
      method: 'POST',
      body: { teacherId: 'teacher-sunita' }
    });
    assert(loginPostRes.status === 200, 'POST /api/auth/login returns 200 OK');
    assert(loginPostRes.body?.teacher?.name === 'Sunita Sharma', 'Switches active teacher to Sunita Sharma');
    assert(loginPostRes.body?.teacher?.classGrade === '10-B', 'Sets correct class grade 10-B');

    console.log('\n--- 10. Testing GET & POST /api/auth/session ---');
    const sessionRes = await request('/api/auth/session?teacherId=teacher-vihaan');
    assert(sessionRes.status === 200, 'GET /api/auth/session returns 200 OK');
    assert(sessionRes.body?.authenticated === true, 'Session reports authenticated: true');
    assert(sessionRes.body?.user?.name === 'Vihaan Bhandari', 'Session resolves teacher details');
    assert(typeof sessionRes.body?.user?.studentCount === 'number', 'Includes teacher student count');

    console.log('\n--- 11. Testing GET /api/roster/template ---');
    const templateRes = await request('/api/roster/template');
    assert(templateRes.status === 200, 'GET /api/roster/template returns 200 OK');
    const contentDisposition = templateRes.headers.get('content-disposition') || '';
    assert(contentDisposition.includes('gems_class_roster_template.csv'), 'Headers include attachment disposition for gems_class_roster_template.csv');
    assert(templateRes.rawText.includes('name,gender,parentName'), 'CSV contains required roster headers');
    assert(templateRes.rawText.includes('Aarav Sharma') && templateRes.rawText.includes('Diya Sengupta'), 'CSV includes sample rows');

    console.log('\n--- 12. Testing POST /api/roster/student (Quick-Add) ---');
    const createdStuId = `STU-SINGLE-${Date.now()}`;
    const addStudentRes = await request('/api/roster/student', {
      method: 'POST',
      body: {
        id: createdStuId,
        teacherId: 'teacher-vihaan',
        name: 'Rhea Chakraborty',
        gender: 'Female',
        transport: 'Bus 14',
        busStop: 'Tecom Block C',
        stayBack: true,
        remedial: false,
        lastScore: 92,
        consentStatus: 'SUBMITTED',
        parentName: 'Priya Chakraborty',
        parentSalutation: 'Mrs.',
        parentEmail: 'priya.c@example.com',
        parentWhatsApp: '+971509998877'
      }
    });
    assert(addStudentRes.status === 201 || addStudentRes.status === 200, 'POST /api/roster/student returns 201/200 OK');
    assert(addStudentRes.body?.student?.name === 'Rhea Chakraborty', 'Student created with correct name');
    assert(addStudentRes.body?.student?.guardians?.length > 0, 'Guardian automatically linked to student');

    console.log('\n--- 13. Testing PUT /api/roster/student (Update) ---');
    const updateStudentRes = await request('/api/roster/student', {
      method: 'PUT',
      body: {
        id: createdStuId,
        transport: 'Own Transport',
        stayBack: false,
        remedial: true,
        parentWhatsApp: '+971508887766'
      }
    });
    assert(updateStudentRes.status === 200, 'PUT /api/roster/student returns 200 OK');
    assert(updateStudentRes.body?.student?.transport === 'Own Transport', 'Student transport updated');
    assert(updateStudentRes.body?.student?.stayBack === false, 'Student stayBack updated to false');
    assert(updateStudentRes.body?.student?.remedial === true, 'Student remedial updated to true');
    assert(updateStudentRes.body?.student?.guardians?.[0]?.whatsappNumber === '+971508887766', 'Guardian WhatsApp contact updated');

    console.log('\n--- 14. Testing DELETE /api/roster/student (Remove) ---');
    const deleteStudentRes = await request(`/api/roster/student?id=${createdStuId}`, {
      method: 'DELETE'
    });
    assert(deleteStudentRes.status === 200, 'DELETE /api/roster/student returns 200 OK');
    assert(deleteStudentRes.body?.success === true, 'Delete returns success: true');

    const checkDeletedRes = await request('/api/roster');
    const foundDeleted = checkDeletedRes.body?.students?.find(s => s.id === createdStuId);
    assert(!foundDeleted, 'Student successfully removed from database and roster query');

    console.log(`\n========================================`);
    console.log(`API TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    cleanup();
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
