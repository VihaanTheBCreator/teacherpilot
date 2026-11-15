const email = require('./dispatch/email');
const whatsapp = require('./dispatch/whatsapp');
const queue = require('./dispatch/queue');

export const { sendEmail } = email;
export const { sendWhatsApp } = whatsapp;
export const {
  createDispatchQueue,
  defaultQueue,
  queueCampaign,
  cancelCampaign,
  getCampaign
} = queue;

export default {
  sendEmail,
  sendWhatsApp,
  createDispatchQueue,
  defaultQueue,
  queueCampaign,
  cancelCampaign,
  getCampaign
};
