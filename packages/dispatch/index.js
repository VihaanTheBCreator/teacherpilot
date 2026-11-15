/**
 * TeacherPilot - Dispatch Package Entry Point
 * Exports sendEmail, sendWhatsApp, createDispatchQueue, and helper utilities.
 */

const { sendEmail, validateStrictSingleRecipient } = require('./email');
const { sendWhatsApp, normalizePhoneNumber } = require('./whatsapp');
const {
  DispatchQueue,
  createDispatchQueue,
  defaultQueue,
  queueCampaign,
  cancelCampaign,
  getCampaign
} = require('./queue');

module.exports = {
  // Email dispatch
  sendEmail,
  validateStrictSingleRecipient,

  // WhatsApp dispatch
  sendWhatsApp,
  normalizePhoneNumber,

  // 10-second undo dispatch queue
  DispatchQueue,
  createDispatchQueue,
  defaultQueue,
  queueCampaign,
  cancelCampaign,
  getCampaign
};
