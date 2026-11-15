/**
 * Multi-Channel Message Generator
 * Produces personalized official HTML emails and WhatsApp flash alerts.
 * Applies SBI Behavior Filtering and UAE School Communication protocols.
 */

const { applySbiFilter } = require('./sbiFilter');
const { getSalutation, wrapEmailHtml, formatWhatsAppText } = require('./templates');

/**
 * Generate personalized messages for a student and guardian
 * @param {import('./types').Intent} intent
 * @param {import('./types').StudentData} student
 * @param {import('./types').GuardianData} guardian
 * @param {import('./types').SchoolContext} [schoolContext]
 * @returns {Promise<import('./types').GeneratedMessage>}
 */
async function generateMessage(intent, student, guardian, schoolContext = {}) {
  // Check if Gemini API is available and custom generation is requested
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'undefined' && apiKey.trim() !== '' && intent.scenario === 'custom') {
    try {
      const generated = await generateWithGemini(intent, student, guardian, schoolContext, apiKey);
      if (generated) return generated;
    } catch (err) {
      // Fallback to offline generation on error
    }
  }

  return generateMessageOffline(intent, student, guardian, schoolContext);
}

/**
 * Offline instantaneous generation
 * @param {import('./types').Intent} intent
 * @param {import('./types').StudentData} student
 * @param {import('./types').GuardianData} guardian
 * @param {import('./types').SchoolContext} [schoolContext]
 * @returns {import('./types').GeneratedMessage}
 */
function generateMessageOffline(intent, student, guardian, schoolContext = {}) {
  const tone = intent.tone || 'Institutional';
  const schoolName = schoolContext.schoolName || 'GEMS OUR OWN INDIAN SCHOOL';
  const teacherName = schoolContext.teacherName || 'Ms. Sunita Sharma';
  const teacherRole = schoolContext.teacherRole || 'Class Teacher, Grade 11-Commerce • Senior Secondary Wing';
  const classGrade = schoolContext.classGrade || 'Grade 11-Commerce';
  const brandColor = schoolContext.brandColor || '#005a36';

  const sName = student.name || 'Student';
  const gName = guardian.name || student.parentName || 'Parent';
  const gSalutation = guardian.salutation || student.parentSalutation || 'Mr./Mrs.';
  const gEmail = guardian.email || student.parentEmail || '';
  const gWhatsApp = guardian.whatsappNumber || student.parentWhatsApp || '';

  const guardianObj = { name: gName, salutation: gSalutation };
  const salutationLine = getSalutation(guardianObj, tone);

  let emailSubject = '';
  let cardHtml = '';
  let introParagraph = '';
  let closingParagraph = '';
  let actionHtml = '';
  let whatsappText = '';

  const scenario = intent.scenario || 'custom';

  switch (scenario) {
    case 'stayback_cancel': {
      if (tone === 'Warm') {
        emailSubject = `Schedule Update: Stay-back cancelled today for ${sName}`;
      } else if (tone === 'Firm') {
        emailSubject = `Important Notice: Grade 11 Stay-Back Cancelled Today - ${sName}`;
      } else {
        emailSubject = `Urgent: ${classGrade} Stay-Back Cancelled Today - ${sName}`;
      }

      introParagraph = `Please be advised of an immediate schedule adjustment for <strong>${sName}</strong> (${classGrade}) for today.`;

      const isOwnTransport = (student.transport || '').toLowerCase().includes('own') || (student.transport || '').toLowerCase().includes('private');
      const transportDetail = isOwnTransport
        ? `Please arrange private pickup at <strong>Gate 3 by 2:20 PM</strong>.`
        : `Student will board regular <strong>${student.transport || 'Bus'} at 2:10 PM</strong> (Designated stop: <em>${student.busStop || 'Standard Stop'}</em>).`;

      cardHtml = `
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px 18px; border-radius: 6px; margin: 18px 0;">
          <div style="color: #991b1b; font-weight: 700; font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">
            ⚠️ Schedule Change Alert — Dispersal at 2:10 PM
          </div>
          <div style="color: #374151; font-size: 13px; line-height: 1.6;">
            Today's after-school stay-back session has been cancelled due to an administrative schedule update.<br><br>
            <strong>Transport & Collection Plan:</strong><br>
            ${transportDetail}
          </div>
        </div>
      `;

      closingParagraph = `We appreciate your prompt understanding and cooperation in ensuring smooth, safe student dispersal. If you require emergency assistance, please call the school reception.`;

      const waTransport = isOwnTransport
        ? `🚗 *Pick-up:* Gate 3 by 2:20 PM.`
        : `🚌 *Bus:* Boarding ${student.transport || 'Bus'} at 2:10 PM.\n📍 *Stop:* ${student.busStop || 'Standard Stop'}`;

      whatsappText = formatWhatsAppText(
        `🚨 *URGENT NOTICE — GEMS OOIS*\n` +
        `Dear ${gSalutation} ${gName}, today's stay-back for *${sName}* is *CANCELLED*.\n\n` +
        `${waTransport}\n\n` +
        `Please acknowledge receipt of this message. Thank you.`
      );
      break;
    }

    case 'bus_delay': {
      const route = student.transport || student.busRoute || 'Bus 14';
      emailSubject = `Transport Notice: ${route} Delayed - ${sName}`;
      introParagraph = `We are writing to provide a live transportation update regarding <strong>${sName}</strong> (${classGrade}) on <strong>${route}</strong>.`;

      cardHtml = `
        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px 18px; border-radius: 6px; margin: 18px 0;">
          <div style="color: #92400e; font-weight: 700; font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">
            🚌 Bus Route Delay Notification
          </div>
          <div style="color: #374151; font-size: 13px; line-height: 1.6;">
            <strong>Route:</strong> ${route}<br>
            <strong>Status:</strong> Delayed by approximately 25 minutes due to heavy roadworks and traffic near Hessa Street.<br>
            <strong>Revised Drop-off:</strong> Approx 4:10 PM at <em>${student.busStop || 'Designated Stop'}</em>${student.busSeat ? ` (Assigned Seat #${student.busSeat})` : ''}.<br>
            <strong>Safety Confirmation:</strong> All students are seated comfortably and supervised by STS Bus Monitor Mary.
          </div>
        </div>
      `;

      closingParagraph = `You may track real-time bus location via the official STS App. Thank you for your patience.`;

      whatsappText = formatWhatsAppText(
        `🚌 *BUS DELAY NOTICE — GEMS OOIS*\n` +
        `Dear ${gSalutation} ${gName}, ${route} carrying *${sName}* is delayed by approx 25 mins due to roadworks.\n\n` +
        `⏰ *Est. Drop-off:* 4:10 PM\n` +
        `📍 *Stop:* ${student.busStop || 'Designated Stop'}${student.busSeat ? ` (Seat ${student.busSeat})` : ''}\n` +
        `🛡️ All students are safe with bus monitor.\n\n` +
        `Live GPS is active on the STS App.`
      );
      break;
    }

    case 'remedial': {
      emailSubject = `Academic Progress & Support Notice: Accountancy Unit Test 2 - ${sName}`;
      introParagraph = `Please review this academic diagnostic progress report for <strong>${sName}</strong> in Grade 11 Accountancy.`;

      const scoreVal = student.lastScore !== undefined && student.lastScore !== null ? student.lastScore : 32;

      cardHtml = `
        <div style="background-color: #fefce8; border-left: 4px solid #ca8a04; padding: 16px 18px; border-radius: 6px; margin: 18px 0;">
          <div style="color: #854d0e; font-weight: 700; font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">
            📊 Assessment Summary & Targeted Intervention
          </div>
          <div style="color: #374151; font-size: 13px; line-height: 1.6;">
            <strong>Assessment:</strong> Diagnostic Unit Test 2 (Ledgers & Depreciation)<br>
            <strong>Student Score:</strong> <span style="color: #dc2626; font-weight: 700;">${scoreVal}%</span> (CBSE Separate Passing Benchmark: 33% Theory)<br>
            <strong>Intervention Plan:</strong> Mandatory targeted revision session on <strong>Thursday at 2:15 PM</strong> in Room 204.<br>
            <strong>Focus Areas:</strong> Journal entries balance checks and depreciation schedules.
          </div>
        </div>
      `;

      actionHtml = `
        <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #475569;">
          <strong>Action Required:</strong> A personalized practice worksheet has been assigned on Google Classroom. Please ensure ${sName} completes exercises 1-4 prior to Thursday.
        </div>
      `;

      closingParagraph = `Our goal is to partner closely with you to ensure ${sName} strengthens core subject concepts and builds confidence for the forthcoming term examinations.`;

      whatsappText = formatWhatsAppText(
        `📚 *ACADEMIC SUPPORT NOTICE — GEMS OOIS*\n` +
        `Dear ${gSalutation} ${gName}, Unit Test 2 score for *${sName}* is ${scoreVal}% (CBSE passing criteria: 33%).\n\n` +
        `🗓️ *Remedial Class:* Thursday at 2:15 PM (Room 204)\n` +
        `📝 *Action:* Please ensure ${sName} completes the practice worksheet on Google Classroom.\n\n` +
        `Thank you for supporting your child's academic growth.`
      );
      break;
    }

    case 'consent_chase': {
      emailSubject = `Action Required: Dubai Museum of the Future Field Trip Consent - ${sName}`;
      introParagraph = `This is a reminder regarding the forthcoming Grade 11-Commerce educational visit to the <strong>Dubai Museum of the Future</strong>.`;

      cardHtml = `
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 18px; border-radius: 6px; margin: 18px 0;">
          <div style="color: #1e40af; font-weight: 700; font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">
            📋 Field Trip Registration Pending (48-Hour Window)
          </div>
          <div style="color: #374151; font-size: 13px; line-height: 1.6;">
            <strong>Destination:</strong> Dubai Museum of the Future<br>
            <strong>Activity Fee:</strong> AED 95 (Includes entry ticket, guided innovation workshop, and STS transport)<br>
            <strong>Status for ${sName}:</strong> Digital Parent Consent & Payment Pending<br>
            <strong>Deadline:</strong> Submissions close in <strong>48 hours</strong> to finalize RTA and bus manifests.
          </div>
        </div>
      `;

      actionHtml = `
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #166534;">
          👉 <strong>How to Complete:</strong> Log into the GEMS Parent Portal, navigate to <em>Activities & Excursions</em>, approve consent, and submit the AED 95 fee.
        </div>
      `;

      closingParagraph = `Bus seating reservations cannot be held past the deadline. Thank you for your prompt attention to this matter.`;

      whatsappText = formatWhatsAppText(
        `📋 *FIELD TRIP CONSENT DUE — GEMS OOIS*\n` +
        `Dear ${gSalutation} ${gName}, digital consent and AED 95 fee for *${sName}*'s trip to Dubai Museum of the Future is due in *48 hours*.\n\n` +
        `📲 Complete submission via GEMS Parent Portal to secure bus seat reservation.\n\n` +
        `Thank you for your timely assistance.`
      );
      break;
    }

    case 'praise': {
      emailSubject = `Commendation: Outstanding Effort & Leadership - ${sName}`;
      introParagraph = `We are delighted to share wonderful news regarding <strong>${sName}</strong>'s exemplary performance and leadership in ${classGrade}.`;

      const scoreDisplay = student.lastScore ? `${student.lastScore}%` : 'Outstanding';

      cardHtml = `
        <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 16px 18px; border-radius: 6px; margin: 18px 0;">
          <div style="color: #854d0e; font-weight: 700; font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">
            ⭐ Student Commendation & Recognition
          </div>
          <div style="color: #374151; font-size: 13px; line-height: 1.6;">
            <strong>Awarded to:</strong> ${sName}<br>
            <strong>Category:</strong> Classroom Leadership & Active Peer Mentorship<br>
            <strong>Term 2 Academic Standing:</strong> ${scoreDisplay}<br>
            <strong>Commendation Notes:</strong> ${sName} demonstrated exceptional consistency, maturity, and collaborative spirit during the Term 2 business project presentations.
          </div>
        </div>
      `;

      closingParagraph = `Thank you for your continuous encouragement at home. It is a genuine pleasure teaching ${sName} in our class.`;

      whatsappText = formatWhatsAppText(
        `⭐ *STUDENT COMMENDATION — GEMS OOIS*\n` +
        `Dear ${gSalutation} ${gName}, we are proud to share that *${sName}* received a special classroom commendation for outstanding leadership and peer mentorship in ${classGrade} today!\n\n` +
        `Thank you for your continuous support at home.`
      );
      break;
    }

    default: {
      // Custom scenario
      const filteredPrompt = applySbiFilter(intent.rawPrompt || 'Important School Update');
      emailSubject = `School Notification: ${classGrade} Update - ${sName}`;
      introParagraph = `Please review this official school update concerning <strong>${sName}</strong> (${classGrade}).`;

      cardHtml = `
        <div style="background-color: #f8fafc; border-left: 4px solid #005a36; padding: 16px 18px; border-radius: 6px; margin: 18px 0;">
          <div style="color: #005a36; font-weight: 700; font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">
            Notice Details
          </div>
          <div style="color: #374151; font-size: 13px; line-height: 1.6;">
            ${filteredPrompt}
          </div>
        </div>
      `;

      closingParagraph = `Should you have any inquiries, please contact the homeroom teacher or school administrative desk.`;

      whatsappText = formatWhatsAppText(
        `📢 *SCHOOL NOTICE — GEMS OOIS*\n` +
        `Dear ${gSalutation} ${gName}, update regarding *${sName}*:\n\n` +
        `${filteredPrompt.slice(0, 220)}\n\n` +
        `Thank you.`
      );
      break;
    }
  }

  const emailBodyHtml = wrapEmailHtml({
    schoolName,
    salutation: salutationLine,
    introParagraph,
    cardHtml,
    closingParagraph,
    actionHtml,
    teacherName,
    teacherRole,
    brandColor
  });

  return {
    studentId: student.id,
    studentName: sName,
    guardianName: gName,
    guardianEmail: gEmail,
    guardianWhatsApp: gWhatsApp,
    emailSubject,
    emailBodyHtml,
    whatsappText
  };
}

/**
 * Gemini-powered generator for custom requests
 */
async function generateWithGemini(intent, student, guardian, schoolContext, apiKey) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  const prompt = `You are a school communications AI for GEMS Our Own Indian School in Dubai.
Generate a strictly factual, polite message for:
Student: ${student.name}
Parent: ${guardian.salutation} ${guardian.name}
Tone: ${intent.tone}
Scenario Details: ${intent.rawPrompt}

Apply SBI guidelines (purely factual, zero blame language).
Output strict JSON:
{
  "emailSubject": "string",
  "emailNoticeBody": "HTML formatted body text",
  "whatsappText": "string (<380 chars, emojis OK)"
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      }),
      signal: controller.signal
    }
  );

  clearTimeout(timeoutId);

  if (!response.ok) return null;
  const data = await response.json();
  const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) return null;

  const parsed = JSON.parse(candidateText);
  const tone = intent.tone || 'Institutional';
  const salutationLine = getSalutation(guardian, tone);

  const cardHtml = `
    <div style="background-color: #f8fafc; border-left: 4px solid #005a36; padding: 16px 18px; border-radius: 6px; margin: 18px 0;">
      <div style="color: #374151; font-size: 13px; line-height: 1.6;">
        ${applySbiFilter(parsed.emailNoticeBody || intent.rawPrompt)}
      </div>
    </div>
  `;

  const emailBodyHtml = wrapEmailHtml({
    schoolName: schoolContext.schoolName || 'GEMS OUR OWN INDIAN SCHOOL',
    salutation: salutationLine,
    introParagraph: `Please review the following communication regarding <strong>${student.name}</strong>:`,
    cardHtml,
    closingParagraph: `Thank you for your cooperation and engagement.`,
    teacherName: schoolContext.teacherName || 'Ms. Sunita Sharma',
    teacherRole: schoolContext.teacherRole || 'Class Teacher',
    brandColor: schoolContext.brandColor || '#005a36'
  });

  return {
    studentId: student.id,
    studentName: student.name,
    guardianName: guardian.name,
    guardianEmail: guardian.email,
    guardianWhatsApp: guardian.whatsappNumber,
    emailSubject: parsed.emailSubject || `School Update - ${student.name}`,
    emailBodyHtml,
    whatsappText: formatWhatsAppText(applySbiFilter(parsed.whatsappText || ''))
  };
}

/**
 * Batch generate messages for multiple students
 * @param {import('./types').Intent} intent
 * @param {import('./types').StudentData[]} students
 * @param {import('./types').SchoolContext} [schoolContext]
 * @returns {Promise<import('./types').GeneratedMessage[]>}
 */
async function generateMessages(intent, students, schoolContext = {}) {
  const results = [];
  for (const student of students) {
    const guardian = {
      name: student.parentName || 'Parent',
      salutation: student.parentSalutation || 'Mr./Mrs.',
      email: student.parentEmail || '',
      whatsappNumber: student.parentWhatsApp || ''
    };
    const msg = await generateMessage(intent, student, guardian, schoolContext);
    results.push(msg);
  }
  return results;
}

module.exports = {
  generateMessage,
  generateMessages,
  generateMessageOffline
};
