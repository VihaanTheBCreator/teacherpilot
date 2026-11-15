const ai = require('ai');

export const {
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
} = ai;

export default ai;
