/**
 * TeacherPilot - Strict 1-to-1 Email Dispatch Engine
 * UAE PDPL Compliant: Zero CC / Zero BCC leak. Every message is sent in isolated SMTP transaction.
 */

const nodemailer = require('nodemailer');

/**
 * Validates that the recipient is a single valid email address.
 * Strictly disallows multiple addresses, commas, semicolons, CC, BCC.
 */
function validateStrictSingleRecipient(to, options = {}) {
  if (options.cc || options.bcc) {
    throw new Error('UAE PDPL Compliance Violation: CC and BCC are strictly forbidden. 1-to-1 isolation required.');
  }

  if (!to || typeof to !== 'string') {
    throw new Error('Invalid recipient email address: Must be a non-empty string.');
  }

  const cleaned = to.trim();
  if (cleaned.includes(',') || cleaned.includes(';') || cleaned.includes('\n')) {
    throw new Error(`Strict 1-to-1 violation: Multiple recipients detected in "${to}". Emails must be dispatched individually.`);
  }

  // Simple RFC-compliant check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned)) {
    throw new Error(`Invalid email format: "${cleaned}"`);
  }

  return cleaned;
}

/**
 * Creates or retrieves a Nodemailer transporter.
 */
function getTransporter(options = {}) {
  const host = options.smtpConfig?.host || process.env.SMTP_HOST;
  const user = options.smtpConfig?.auth?.user || process.env.SMTP_USER;
  const pass = options.smtpConfig?.auth?.pass || process.env.SMTP_PASS;
  const port = options.smtpConfig?.port || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587);

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  }

  return null;
}

/**
 * Sends a strict 1-to-1 email to a single recipient.
 * Falls back to structured simulation when SMTP credentials are offline or dryRun is set.
 *
 * @param {Object} options
 * @param {string} options.to - Single recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Personalised HTML body
 * @param {string} [options.text] - Optional plain text alternative
 * @param {string} [options.from] - Sender address (default: school sender)
 * @param {boolean} [options.dryRun] - Force simulated delivery
 * @param {Object} [options.smtpConfig] - Custom SMTP credentials
 * @returns {Promise<{ success: boolean, messageId: string, timestamp: Date, recipient: string, simulated: boolean, error?: string }>}
 */
async function sendEmail(options) {
  const timestamp = new Date();
  
  try {
    const recipient = validateStrictSingleRecipient(options?.to, options);
    const subject = options?.subject || '(No Subject)';
    const html = options?.html || '<p></p>';
    const from = options?.from || process.env.SCHOOL_EMAIL_FROM || '"GEMS OOIS Dubai" <notifications@gems.edu>';
    const isDryRun = options?.dryRun === true || process.env.DISPATCH_DRY_RUN === 'true';

    const transporter = isDryRun ? null : getTransporter(options);

    if (transporter) {
      // Live SMTP Dispatch
      const info = await transporter.sendMail({
        from,
        to: recipient,
        subject,
        html,
        text: options.text
      });

      return {
        success: true,
        messageId: info.messageId,
        timestamp,
        recipient,
        simulated: false
      };
    } else {
      // Offline / Simulated Dispatch
      const simulatedId = `sim-mail-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@teacherpilot.local`;
      console.log(`[EMAIL DISPATCH - SIMULATED 1-TO-1] To: ${recipient} | Subject: "${subject}" | ID: ${simulatedId}`);

      return {
        success: true,
        messageId: simulatedId,
        timestamp,
        recipient,
        simulated: true
      };
    }
  } catch (error) {
    console.error(`[EMAIL DISPATCH ERROR] Failed to send email to ${options?.to}:`, error.message);
    return {
      success: false,
      messageId: '',
      timestamp,
      recipient: options?.to || 'unknown',
      simulated: false,
      error: error.message
    };
  }
}

module.exports = {
  sendEmail,
  validateStrictSingleRecipient
};
