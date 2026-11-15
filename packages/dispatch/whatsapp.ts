/**
 * TeacherPilot - 1-to-1 WhatsApp Dispatch Engine (TypeScript)
 * Multi-tenant Mudslide wrapper with dynamic per-teacher sessions and school sandbox fallback.
 */

export interface WhatsAppDispatchOptions {
  recipient: string;
  message: string;
  to?: string;
  text?: string;
  teacherId?: string;
  sessionPath?: string;
  cacheDir?: string;
  dryRun?: boolean;
  sandbox?: boolean;
  timeoutMs?: number;
}

export interface WhatsAppDispatchResult {
  success: boolean;
  timestamp: Date;
  recipient: string;
  simulated: boolean;
  sandbox?: boolean;
  output?: string;
  error?: string;
}

const {
  sendWhatsApp,
  normalizePhoneNumber,
  resolveSessionDir,
  hasActiveSession
} = require('./whatsapp.js');

export {
  sendWhatsApp,
  normalizePhoneNumber,
  resolveSessionDir,
  hasActiveSession
};

export default sendWhatsApp;
