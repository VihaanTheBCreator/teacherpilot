/**
 * TeacherPilot - Dispatch Package Entry Point (TypeScript)
 */

export * from './email';
export * from './whatsapp';
export * from './queue';

import { sendEmail } from './email';
import { sendWhatsApp } from './whatsapp';
import { createDispatchQueue, defaultQueue, queueCampaign, cancelCampaign, getCampaign } from './queue';

export {
  sendEmail,
  sendWhatsApp,
  createDispatchQueue,
  defaultQueue,
  queueCampaign,
  cancelCampaign,
  getCampaign
};

export default {
  sendEmail,
  sendWhatsApp,
  createDispatchQueue,
  defaultQueue,
  queueCampaign,
  cancelCampaign,
  getCampaign
};
