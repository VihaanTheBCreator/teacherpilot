/**
 * TeacherPilot - 10-Second Undo Dispatch Queue
 *
 * Implements the core safety pattern:
 * 1. Puts campaign into WAITING_UNDO state for 10 seconds with a countdown timer.
 * 2. If cancelCampaign(id) is invoked within 10s: aborts immediately, zero messages sent.
 * 3. When 10s expires: executes strict sequential 1-to-1 dispatch to all recipients.
 * 4. Records exact delivery timestamps and SENT/FAILED statuses per channel.
 */

const EventEmitter = require('events');
const crypto = require('crypto');
const { sendEmail } = require('./email');
const { sendWhatsApp } = require('./whatsapp');

function generateId(prefix = 'c') {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

class DispatchQueue extends EventEmitter {
  /**
   * @param {Object} [options]
   * @param {number} [options.undoWindowMs] - Undo grace period in milliseconds (default: 10000)
   * @param {number} [options.recipientIntervalMs] - Interval between sequential recipient sends (default: 200)
   * @param {boolean} [options.dryRun] - Run dispatch in dry-run simulation mode
   * @param {Object} [options.prisma] - Optional PrismaClient instance for database persistence
   */
  constructor(options = {}) {
    super();
    this.undoWindowMs = typeof options.undoWindowMs === 'number' ? options.undoWindowMs : 10000;
    this.recipientIntervalMs = typeof options.recipientIntervalMs === 'number' ? options.recipientIntervalMs : 200;
    this.dryRun = options.dryRun !== undefined ? options.dryRun : (process.env.DISPATCH_DRY_RUN === 'true');
    this.prisma = options.prisma || null;

    // In-memory campaign storage
    this.campaigns = new Map();
    // Active timeout references for cancellation
    this.timers = new Map();
    // Active interval tickers for countdown
    this.tickers = new Map();

    // Auto-discover DB client if not explicitly passed
    if (!this.prisma) {
      try {
        const dbPackage = require('../db');
        if (dbPackage && dbPackage.prisma) {
          this.prisma = dbPackage.prisma;
        }
      } catch (e) {
        // Standalone or DB not initialized yet
      }
    }
  }

  /**
   * Queues a campaign for dispatch with a 10-second undo window.
   *
   * @param {Object} campaignInput
   * @param {string} [campaignInput.id] - Optional pre-generated campaign ID
   * @param {string} [campaignInput.teacherId]
   * @param {string} [campaignInput.prompt]
   * @param {string} [campaignInput.scenario]
   * @param {string} [campaignInput.tone]
   * @param {Array<Object>} campaignInput.recipients - List of recipient payloads
   * @param {number} [campaignInput.customUndoWindowMs] - Override undo window for specific run/test
   * @returns {Object} { campaignId, status, undoExpiresAt, secondsRemaining }
   */
  queueCampaign(campaignInput) {
    if (!campaignInput || !Array.isArray(campaignInput.recipients)) {
      throw new Error('Invalid campaign: recipients array is required.');
    }

    const campaignId = campaignInput.id || generateId('camp');
    const undoWindow = typeof campaignInput.customUndoWindowMs === 'number' 
      ? campaignInput.customUndoWindowMs 
      : this.undoWindowMs;

    const createdAt = new Date();
    const undoExpiresAt = new Date(createdAt.getTime() + undoWindow);

    // Format recipients
    const recipients = campaignInput.recipients.map((r, idx) => ({
      id: r.id || generateId('rec'),
      campaignId,
      guardianId: r.guardianId || generateId('grd'),
      guardianName: r.guardianName || r.name || 'Parent',
      studentName: r.studentName || 'Student',
      email: r.email || '',
      whatsappNumber: r.whatsappNumber || r.phone || '',
      emailSubject: r.emailSubject || '',
      emailBodyHtml: r.emailBodyHtml || '',
      whatsappText: r.whatsappText || '',
      emailStatus: 'PENDING',
      whatsappStatus: 'PENDING',
      emailSentAt: null,
      whatsappSentAt: null,
      emailError: null,
      whatsappError: null,
      createdAt: new Date()
    }));

    const campaignRecord = {
      id: campaignId,
      teacherId: campaignInput.teacherId || 'default-teacher',
      prompt: campaignInput.prompt || '',
      scenario: campaignInput.scenario || 'custom',
      tone: campaignInput.tone || 'Warm',
      status: 'WAITING_UNDO',
      createdAt,
      undoExpiresAt,
      dispatchedAt: null,
      completedAt: null,
      recipients
    };

    this.campaigns.set(campaignId, campaignRecord);

    console.log(`[DISPATCH QUEUE] Campaign ${campaignId} queued. WAITING_UNDO for ${undoWindow / 1000}s. Expires at ${undoExpiresAt.toISOString()}`);
    this.emit('campaign:queued', { campaignId, campaign: campaignRecord });

    // Sync DB status if prisma available and campaign exists in DB
    if (this.prisma?.dispatchCampaign) {
      this.prisma.dispatchCampaign.findUnique({ where: { id: campaignId } })
        .then((record) => {
          if (record) {
            return this.prisma.dispatchCampaign.update({
              where: { id: campaignId },
              data: { status: 'WAITING_UNDO' }
            });
          }
        })
        .catch(() => {});
    }

    // Set 1-second interval ticker for countdown updates
    const ticker = setInterval(() => {
      const remainingMs = campaignRecord.undoExpiresAt.getTime() - Date.now();
      const secondsRemaining = Math.max(0, Math.ceil(remainingMs / 1000));
      this.emit('campaign:tick', {
        campaignId,
        secondsRemaining,
        undoExpiresAt: campaignRecord.undoExpiresAt
      });

      if (remainingMs <= 0) {
        clearInterval(ticker);
        this.tickers.delete(campaignId);
      }
    }, 1000);
    this.tickers.set(campaignId, ticker);

    // Set the execution timer for undo window expiration
    const timer = setTimeout(async () => {
      this.timers.delete(campaignId);
      clearInterval(ticker);
      this.tickers.delete(campaignId);

      await this._executeDispatch(campaignId);
    }, undoWindow);

    this.timers.set(campaignId, timer);

    return {
      campaignId,
      status: 'WAITING_UNDO',
      undoExpiresAt,
      secondsRemaining: Math.ceil(undoWindow / 1000),
      recipientCount: recipients.length
    };
  }

  /**
   * Cancels a pending campaign within its undo window.
   *
   * @param {string} campaignId
   * @returns {Object} Result of cancellation
   */
  cancelCampaign(campaignId) {
    const campaign = this.campaigns.get(campaignId);

    if (!campaign) {
      return {
        success: false,
        error: `Campaign "${campaignId}" not found in queue.`
      };
    }

    if (campaign.status !== 'WAITING_UNDO') {
      return {
        success: false,
        status: campaign.status,
        error: `Cannot undo campaign in status "${campaign.status}". Undo window has passed.`
      };
    }

    // Clear timers
    const timer = this.timers.get(campaignId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(campaignId);
    }

    const ticker = this.tickers.get(campaignId);
    if (ticker) {
      clearInterval(ticker);
      this.tickers.delete(campaignId);
    }

    // Transition status to CANCELLED
    campaign.status = 'CANCELLED';
    console.log(`[DISPATCH QUEUE] Campaign ${campaignId} successfully CANCELLED within undo window. Zero messages sent.`);

    // Sync DB status if prisma available and campaign exists in DB
    if (this.prisma?.dispatchCampaign) {
      this.prisma.dispatchCampaign.findUnique({ where: { id: campaignId } })
        .then((record) => {
          if (record) {
            return this.prisma.dispatchCampaign.update({
              where: { id: campaignId },
              data: { status: 'CANCELLED' }
            });
          }
        })
        .catch(() => {});
    }

    this.emit('campaign:cancelled', { campaignId, campaign });

    return {
      success: true,
      campaignId,
      status: 'CANCELLED',
      message: 'Campaign aborted successfully within 10-second undo window. No emails or WhatsApp messages dispatched.'
    };
  }

  /**
   * Executes sequential 1-to-1 dispatch to all recipients.
   * Private worker method triggered after undo window expires.
   *
   * @private
   * @param {string} campaignId
   */
  async _executeDispatch(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign || campaign.status === 'CANCELLED') {
      return;
    }

    campaign.status = 'DISPATCHING';
    campaign.dispatchedAt = new Date();
    console.log(`[DISPATCH QUEUE] Undo window expired for ${campaignId}. Beginning sequential 1-to-1 dispatch to ${campaign.recipients.length} recipients.`);

    this.emit('campaign:dispatching', { campaignId, campaign });

    if (this.prisma?.dispatchCampaign) {
      try {
        const exists = await this.prisma.dispatchCampaign.findUnique({ where: { id: campaignId } });
        if (exists) {
          await this.prisma.dispatchCampaign.update({
            where: { id: campaignId },
            data: { status: 'DISPATCHING', dispatchedAt: campaign.dispatchedAt }
          });
        }
      } catch (err) {
        // continue
      }
    }

    // Sequential 1-to-1 dispatch loop
    for (let i = 0; i < campaign.recipients.length; i++) {
      const recipient = campaign.recipients[i];
      console.log(`[DISPATCH QUEUE] Processing recipient [${i + 1}/${campaign.recipients.length}]: ${recipient.guardianName} (${recipient.studentName})`);

      // 1. Strict 1-to-1 Email Dispatch
      if (recipient.email && recipient.emailSubject) {
        const emailRes = await sendEmail({
          to: recipient.email,
          subject: recipient.emailSubject,
          html: recipient.emailBodyHtml,
          dryRun: this.dryRun
        });

        recipient.emailStatus = emailRes.success ? 'SENT' : 'FAILED';
        recipient.emailSentAt = emailRes.success ? emailRes.timestamp : null;
        recipient.emailError = emailRes.error || null;
      }

      // 2. Strict 1-to-1 WhatsApp Dispatch
      if (recipient.whatsappNumber && recipient.whatsappText) {
        const waRes = await sendWhatsApp({
          recipient: recipient.whatsappNumber,
          message: recipient.whatsappText,
          teacherId: campaign.teacherId,
          dryRun: this.dryRun
        });

        recipient.whatsappStatus = waRes.success ? 'SENT' : 'FAILED';
        recipient.whatsappSentAt = waRes.success ? waRes.timestamp : null;
        recipient.whatsappError = waRes.error || null;
      }

      // Sync recipient status to DB if available
      if (this.prisma?.messageRecipient) {
        try {
          const recExists = await this.prisma.messageRecipient.findUnique({ where: { id: recipient.id } });
          if (recExists) {
            await this.prisma.messageRecipient.update({
              where: { id: recipient.id },
              data: {
                emailStatus: recipient.emailStatus,
                whatsappStatus: recipient.whatsappStatus,
                emailSentAt: recipient.emailSentAt,
                whatsappSentAt: recipient.whatsappSentAt
              }
            });
          }
        } catch (e) {
          // continue
        }
      }

      this.emit('recipient:dispatched', {
        campaignId,
        index: i,
        total: campaign.recipients.length,
        recipient
      });

      // Polite pacing between recipients to adhere to rate limits
      if (i < campaign.recipients.length - 1 && this.recipientIntervalMs > 0) {
        await new Promise((r) => setTimeout(r, this.recipientIntervalMs));
      }
    }

    // Mark campaign COMPLETED
    campaign.status = 'COMPLETED';
    campaign.completedAt = new Date();
    console.log(`[DISPATCH QUEUE] Campaign ${campaignId} COMPLETED. All recipients processed.`);

    if (this.prisma?.dispatchCampaign) {
      try {
        const exists = await this.prisma.dispatchCampaign.findUnique({ where: { id: campaignId } });
        if (exists) {
          await this.prisma.dispatchCampaign.update({
            where: { id: campaignId },
            data: { status: 'COMPLETED' }
          });
        }
      } catch (err) {
        // continue
      }
    }

    this.emit('campaign:completed', { campaignId, campaign });
  }

  /**
   * Retrieves campaign details by ID.
   *
   * @param {string} campaignId
   * @returns {Object|null}
   */
  getCampaign(campaignId) {
    return this.campaigns.get(campaignId) || null;
  }

  /**
   * Returns all campaigns in the queue.
   *
   * @returns {Array<Object>}
   */
  getAllCampaigns() {
    return Array.from(this.campaigns.values());
  }

  /**
   * Cleans up all active timers and tickers.
   */
  destroy() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    for (const ticker of this.tickers.values()) {
      clearInterval(ticker);
    }
    this.timers.clear();
    this.tickers.clear();
  }
}

/**
 * Factory function to create a dispatch queue instance.
 */
function createDispatchQueue(options = {}) {
  return new DispatchQueue(options);
}

// Default singleton queue instance for app-wide use
const defaultQueue = new DispatchQueue();

module.exports = {
  DispatchQueue,
  createDispatchQueue,
  defaultQueue,
  queueCampaign: (input) => defaultQueue.queueCampaign(input),
  cancelCampaign: (id) => defaultQueue.cancelCampaign(id),
  getCampaign: (id) => defaultQueue.getCampaign(id)
};
