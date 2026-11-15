const dispatch = require('dispatch');

export const {
  sendEmail,
  validateStrictSingleRecipient,
  sendWhatsApp,
  normalizePhoneNumber,
  DispatchQueue,
  createDispatchQueue,
  defaultQueue,
  queueCampaign,
  cancelCampaign,
  getCampaign
} = dispatch;

export default dispatch;
