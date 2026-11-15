/**
 * TeacherPilot - 1-to-1 WhatsApp Dispatch Engine
 * Multi-tenant Mudslide wrapper with dynamic per-teacher sessions and school sandbox fallback.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const DEFAULT_CACHE_DIR = process.env.MUDSLIDE_CACHE_DIR || '/Users/AMIT/.local/share/mudslide';
const SESSIONS_ROOT = process.env.MUDSLIDE_SESSIONS_ROOT || '/Users/AMIT/.local/share/mudslide_sessions';
const DEFAULT_BIN_PATH = process.env.MUDSLIDE_BIN_PATH || '/Users/AMIT/.gemini/antigravity/bin/mudslide';

/**
 * Normalizes a phone number to standard E.164 format.
 * Examples:
 *  "+971 50 123 4567" -> "+971501234567"
 *  "0501234567" -> "+971501234567" (UAE standard)
 *  "971501234567" -> "+971501234567"
 */
function normalizePhoneNumber(raw) {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Invalid phone number: must be a non-empty string.');
  }

  // Strip all whitespace, hyphens, parentheses
  let cleaned = raw.replace(/[\s\-\(\)\.]/g, '').trim();

  // UAE local number starting with 05...
  if (/^05\d{8}$/.test(cleaned)) {
    cleaned = '+971' + cleaned.slice(1);
  }

  // Missing leading '+' but has country code
  if (/^\d{10,15}$/.test(cleaned)) {
    cleaned = '+' + cleaned;
  }

  if (!/^\+\d{10,15}$/.test(cleaned)) {
    throw new Error(`Invalid E.164 phone number format: "${raw}"`);
  }

  return cleaned;
}

/**
 * Resolves the effective session cache directory for a teacher.
 * Supports multi-tenant teacher sessions and fallback to school-level session.
 */
function resolveSessionDir(options = {}) {
  // 1. Explicit session path or cache dir
  if (options.sessionPath && typeof options.sessionPath === 'string') {
    return options.sessionPath;
  }
  if (options.cacheDir && typeof options.cacheDir === 'string') {
    return options.cacheDir;
  }

  // 2. Per-teacher dynamic session path
  if (options.teacherId && typeof options.teacherId === 'string') {
    const teacherSessionDir = path.join(SESSIONS_ROOT, options.teacherId.replace(/[^a-zA-Z0-9_-]/g, '_'));
    if (fs.existsSync(path.join(teacherSessionDir, 'creds.json'))) {
      return teacherSessionDir;
    }
  }

  // 3. School default shared session
  return DEFAULT_CACHE_DIR;
}

/**
 * Verifies if an active WhatsApp session exists at the specified directory.
 */
function hasActiveSession(cacheDir) {
  try {
    if (!fs.existsSync(cacheDir)) return false;
    // Mudslide stores Baileys multi-device credentials in creds.json
    return fs.existsSync(path.join(cacheDir, 'creds.json'));
  } catch (e) {
    return false;
  }
}

/**
 * Resolves the mudslide command and arguments.
 */
function getMudslideInvocation(cacheDir) {
  if (fs.existsSync(DEFAULT_BIN_PATH)) {
    return {
      command: DEFAULT_BIN_PATH,
      argsPrefix: ['-c', cacheDir]
    };
  }

  return {
    command: 'npx',
    argsPrefix: ['--yes', 'mudslide', '-c', cacheDir]
  };
}

/**
 * Sends a 1-to-1 WhatsApp message via Mudslide CLI.
 * Gracefully switches to school sandbox mode if no active teacher session is linked.
 *
 * @param {Object} options
 * @param {string} options.recipient - E.164 phone number (e.g. "+971501234567")
 * @param {string} options.message - Text message content (<400 chars recommended)
 * @param {string} [options.teacherId] - Optional teacher ID for multi-tenant session isolation
 * @param {string} [options.sessionPath] - Explicit custom session folder
 * @param {boolean} [options.dryRun] - Run in simulation mode without sending
 * @param {boolean} [options.sandbox] - Explicitly run in sandbox mode
 * @param {number} [options.timeoutMs] - CLI execution timeout in ms (default 30000)
 * @returns {Promise<{ success: boolean, timestamp: Date, recipient: string, simulated: boolean, sandbox?: boolean, output?: string, error?: string }>}
 */
async function sendWhatsApp(options) {
  const timestamp = new Date();

  try {
    const rawRecipient = options?.recipient || options?.to;
    const recipient = normalizePhoneNumber(rawRecipient);
    const message = (options?.message || options?.text || '').trim();

    if (!message) {
      throw new Error('WhatsApp message body cannot be empty.');
    }

    const isDryRun = options?.dryRun === true ||
      process.env.DISPATCH_DRY_RUN === 'true' ||
      process.env.MUD_SLIDE_DRY_RUN === '1';

    const cacheDir = resolveSessionDir(options);
    const activeSession = hasActiveSession(cacheDir);

    // Explicit dry-run
    if (isDryRun) {
      console.log(`[WHATSAPP DISPATCH - SIMULATED 1-TO-1] To: ${recipient} | Length: ${message.length} chars | Message: "${message.slice(0, 60)}..."`);
      return {
        success: true,
        timestamp,
        recipient,
        simulated: true,
        output: `SIMULATED: Dispatched 1-to-1 WhatsApp to ${recipient}`
      };
    }

    // Graceful School Sandbox Mode when teacher session is unlinked
    if (options?.sandbox === true || !activeSession || process.env.WHATSAPP_SANDBOX_MODE === 'true') {
      console.log(`[WHATSAPP DISPATCH - SCHOOL SANDBOX MODE] No active WhatsApp session at ${cacheDir}. Safely logged message for ${recipient}.`);
      return {
        success: true,
        timestamp,
        recipient,
        simulated: true,
        sandbox: true,
        output: `SANDBOX: Teacher WhatsApp unlinked; message logged in school sandbox mode for ${recipient}`
      };
    }

    // Live Execution via Mudslide CLI
    const { command, argsPrefix } = getMudslideInvocation(cacheDir);
    const args = [...argsPrefix, 'send', recipient, message];
    const timeoutMs = options?.timeoutMs || 30000;

    return new Promise((resolve) => {
      let stdoutData = '';
      let stderrData = '';
      let finished = false;

      const proc = spawn(command, args, {
        env: {
          ...process.env,
          MUDSLIDE_CACHE_DIR: cacheDir
        }
      });

      const timer = setTimeout(() => {
        if (!finished) {
          finished = true;
          proc.kill('SIGKILL');
          resolve({
            success: false,
            timestamp,
            recipient,
            simulated: false,
            error: `Mudslide process timed out after ${timeoutMs}ms`
          });
        }
      }, timeoutMs);

      proc.stdout?.on('data', (data) => {
        stdoutData += data.toString();
      });

      proc.stderr?.on('data', (data) => {
        stderrData += data.toString();
      });

      proc.on('close', (code) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);

        if (code === 0) {
          console.log(`[WHATSAPP DISPATCH - LIVE SUCCESS] To: ${recipient}`);
          resolve({
            success: true,
            timestamp,
            recipient,
            simulated: false,
            output: stdoutData.trim()
          });
        } else {
          const errMsg = stderrData.trim() || stdoutData.trim() || `Process exited with code ${code}`;
          console.error(`[WHATSAPP DISPATCH ERROR] Failed to send to ${recipient}: ${errMsg}`);
          resolve({
            success: false,
            timestamp,
            recipient,
            simulated: false,
            error: errMsg
          });
        }
      });

      proc.on('error', (err) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        resolve({
          success: false,
          timestamp,
          recipient,
          simulated: false,
          error: err.message
        });
      });
    });
  } catch (error) {
    console.error(`[WHATSAPP DISPATCH ERROR] Invalid request:`, error.message);
    return {
      success: false,
      timestamp,
      recipient: options?.recipient || 'unknown',
      simulated: false,
      error: error.message
    };
  }
}

module.exports = {
  sendWhatsApp,
  normalizePhoneNumber,
  resolveSessionDir,
  hasActiveSession
};
