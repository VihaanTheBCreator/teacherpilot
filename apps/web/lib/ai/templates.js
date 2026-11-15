/**
 * Preset Scenarios and Email/WhatsApp Templates
 * Designed for UAE CBSE Schools (GEMS Our Own Indian School)
 */

const PRESET_SCENARIOS = [
  {
    id: 'stayback_cancel',
    title: 'Stay-Back Cancelled Today',
    urgency: 'immediate',
    tone: 'Institutional',
    icon: 'fa-ban text-red-400',
    prompt: 'Stay-back for Grade 11-Commerce is CANCELLED today due to an unavoidable schedule change. Regular bus dispersal at 2:10 PM. Own-transport students pickup from Gate 3 by 2:20 PM.',
    targetFilter: { stayBack: true },
    filterDescription: 'Students enrolled in afternoon stay-back'
  },
  {
    id: 'bus_delay',
    title: 'Bus 14 Running 25 Mins Late',
    urgency: 'immediate',
    tone: 'Institutional',
    icon: 'fa-bus text-amber-400',
    prompt: 'Bus 14 is delayed by approximately 25 minutes due to heavy roadworks near Hessa Street. Revised drop-off is 4:10 PM. All students are safe with bus monitor Mary.',
    targetFilter: { busRoute: 'Bus 14' },
    filterDescription: 'Students assigned to Bus Route 14'
  },
  {
    id: 'remedial',
    title: 'Accountancy <35% Remedial Warning',
    urgency: 'today',
    tone: 'Firm',
    icon: 'fa-triangle-exclamation text-amber-400',
    prompt: 'Diagnostic Unit Test 2 scores: Students scoring below 35% require mandatory remedial revision. CBSE separate passing criteria in Theory (33%) applies. Extra support class Thursday 2:15 PM.',
    targetFilter: { remedial: true, maxScore: 35 },
    filterDescription: 'Students scoring below 35% needing remedial revision'
  },
  {
    id: 'consent_chase',
    title: 'Dubai Museum Field Trip Consent Chasing',
    urgency: 'today',
    tone: 'Firm',
    icon: 'fa-clipboard-check text-blue-400',
    prompt: 'Reminder: Field trip consent and AED 95 fee for Dubai Museum of the Future is due in 48 hours. Please submit digital consent and payment to confirm bus seat booking.',
    targetFilter: { consentStatus: 'PENDING' },
    filterDescription: 'Students with pending digital field trip consent'
  },
  {
    id: 'praise',
    title: 'Star Student Effort Recognition',
    urgency: 'planning',
    tone: 'Warm',
    icon: 'fa-star text-yellow-400',
    prompt: 'Commendation: Outstanding consistency, classroom leadership, and active peer mentorship during Term 2 business project presentations.',
    targetFilter: { minScore: 80 },
    filterDescription: 'Top performing students with exemplary effort (Score >= 80%)'
  }
];

/**
 * Format Guardian greeting based on tone
 */
function getSalutation(guardian, tone) {
  const title = guardian.salutation || 'Mr./Mrs.';
  const name = guardian.name || 'Parent/Guardian';
  if (tone === 'Warm') {
    return `Dear ${title} ${name},`;
  } else if (tone === 'Institutional') {
    return `Respected ${title} ${name},`;
  }
  return `Dear ${title} ${name},`;
}

/**
 * Generate standard GEMS Green branded HTML email container
 */
function wrapEmailHtml({
  schoolName = 'GEMS OUR OWN INDIAN SCHOOL',
  headerSub = 'Official Homeroom Communication',
  salutation,
  introParagraph,
  cardHtml,
  closingParagraph,
  actionHtml,
  teacherName = 'Ms. Sunita Sharma',
  teacherRole = 'Class Teacher, Grade 11-Commerce • Senior Secondary Wing',
  schoolSub = 'GEMS Our Own Indian School, Dubai (CBSE Affiliated)',
  brandColor = '#005a36'
}) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${schoolName} - Notice</title>
</head>
<body style="margin: 0; padding: 16px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    
    <!-- GEMS Green Header -->
    <div style="background-color: ${brandColor}; padding: 20px 24px; color: #ffffff;">
      <div style="font-size: 18px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
        ${schoolName}
      </div>
      <div style="font-size: 11px; opacity: 0.9; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.3px;">
        ${headerSub}
      </div>
    </div>

    <!-- Email Body -->
    <div style="padding: 24px; font-size: 14px; line-height: 1.6; color: #334155;">
      <p style="margin-top: 0; font-weight: 600; color: #0f172a;">${salutation}</p>
      <p style="margin-bottom: 16px;">${introParagraph}</p>

      ${cardHtml}

      ${actionHtml ? `<div style="margin: 20px 0;">${actionHtml}</div>` : ''}

      <p style="margin-top: 16px; margin-bottom: 24px; color: #475569; font-size: 13px;">
        ${closingParagraph}
      </p>

      <!-- Signature Section -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">
        <div style="font-weight: 700; color: #0f172a; font-size: 14px;">${teacherName}</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${teacherRole}</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${schoolSub}</div>
      </div>
    </div>

    <!-- Official Footer Notice -->
    <div style="background-color: #f1f5f9; padding: 12px 24px; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; text-align: center;">
      This is a verified 1-to-1 official notification from GEMS Education. All student records remain confidential under UAE Data Protection regulations.
    </div>

  </div>
</body>
</html>`;
}

/**
 * Helper to ensure WhatsApp message does not exceed 400 characters
 */
function formatWhatsAppText(rawText) {
  let cleaned = rawText.trim();
  if (cleaned.length <= 400) return cleaned;
  // Compact by trimming whitespace and extra lines
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
  if (cleaned.length <= 400) return cleaned;
  return cleaned.slice(0, 397) + '...';
}

module.exports = {
  PRESET_SCENARIOS,
  getSalutation,
  wrapEmailHtml,
  formatWhatsAppText
};
