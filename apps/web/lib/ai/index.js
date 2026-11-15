const { parseIntent, parseIntentOffline } = require('./intent');
const { generateMessage, generateMessages, generateMessageOffline } = require('./generator');
const { PRESET_SCENARIOS, getSalutation, wrapEmailHtml, formatWhatsAppText } = require('./templates');
const { applySbiFilter, BLAME_PATTERNS } = require('./sbiFilter');

module.exports = {
  // Intent Parsing
  parseIntent,
  parseIntentOffline,

  // Message Generation
  generateMessage,
  generateMessages,
  generateMessageOffline,

  // Preset Scenarios
  presets: PRESET_SCENARIOS,
  PRESET_SCENARIOS,

  // SBI Filter
  applySbiFilter,
  BLAME_PATTERNS,

  // Formatting & Templates
  getSalutation,
  wrapEmailHtml,
  formatWhatsAppText
};
