/**
 * TeacherPilot - Strict 1-to-1 Email Dispatch Engine (TypeScript)
 * UAE PDPL Compliant: Zero CC / Zero BCC leak. Every message is sent in isolated SMTP transaction.
 */

export interface SmtpAuthConfig {
  user: string;
  pass: string;
}

export interface SmtpConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: SmtpAuthConfig;
}

export interface EmailDispatchOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  dryRun?: boolean;
  smtpConfig?: SmtpConfig;
  gmailToken?: Record<string, any>;
  cc?: never;
  bcc?: never;
}

export interface EmailDispatchResult {
  success: boolean;
  messageId: string;
  timestamp: Date;
  recipient: string;
  simulated: boolean;
  error?: string;
}

const { sendEmail, validateStrictSingleRecipient } = require('./email.js');

export { sendEmail, validateStrictSingleRecipient };
export default sendEmail;
