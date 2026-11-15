const intent = require('./ai/intent');
const generator = require('./ai/generator');
const templates = require('./ai/templates');
const sbiFilter = require('./ai/sbiFilter');

export const { parseIntent, parseIntentOffline } = intent;
export const { generateMessage, generateMessages, generateMessageOffline } = generator;
export const {
  presets,
  PRESET_SCENARIOS,
  getSalutation,
  wrapEmailHtml,
  formatWhatsAppText
} = templates;
export const { applySbiFilter, BLAME_PATTERNS } = sbiFilter;

export default {
  parseIntent,
  parseIntentOffline,
  generateMessage,
  generateMessages,
  generateMessageOffline,
  presets,
  PRESET_SCENARIOS,
  applySbiFilter,
  BLAME_PATTERNS,
  getSalutation,
  wrapEmailHtml,
  formatWhatsAppText
};
