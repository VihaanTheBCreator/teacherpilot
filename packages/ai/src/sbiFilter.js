/**
 * Situation-Behavior-Impact (SBI) Behavior Filter
 * 
 * Ensures parent communications are objective, purely factual, and free of blame language.
 * Compliant with UAE KHDA and CBSE professional standards.
 */

const BLAME_PATTERNS = [
  { pattern: /\b(he|she|they)\s+always\s+disturbs?\s+(the\s+class|others)?/gi, replacement: 'Classroom focus during collaborative sessions requires consistent reinforcement.' },
  { pattern: /\b(he|she|they)\s+never\s+(does|do|submits?)\s+(his|her|their)?\s*homework\b/gi, replacement: 'Assignment submissions currently have pending items requiring completion.' },
  { pattern: /\b(he|she|they)\s+never\s+pays?\s+attention\b/gi, replacement: 'Independent focus during instruction shows periodic lapses.' },
  { pattern: /\b(he|she)\s+is\s+lazy\b/gi, replacement: 'Student requires structured encouragement to sustain daily academic engagement.' },
  { pattern: /\b(he|she)\s+is\s+failing\b/gi, replacement: 'Current assessment score is below the CBSE 33% subject passing benchmark.' },
  { pattern: /\bterrible\s+performance\b/gi, replacement: 'Assessment results identify specific areas requiring targeted revision.' },
  { pattern: /\b(careless|irresponsible)\s+(behavior|attitude)?\b/gi, replacement: 'Requires structured reminders to manage deadlines and materials.' },
  { pattern: /\b(stubborn|refuses\s+to\s+listen)\b/gi, replacement: 'Responds best to direct 1-to-1 guided clarification.' },
  { pattern: /\bdisruptive\s+in\s+class\b/gi, replacement: 'Engagement in classroom discussions requires redirection to core topics.' },
  { pattern: /\bno\s+effort\b/gi, replacement: 'Demonstrates potential that requires consistent reinforcement.' },
  { pattern: /\bworst\s+(score|marks?|grade)\b/gi, replacement: 'Diagnostic scores indicate critical foundational review is needed.' }
];

/**
 * Filter text to adhere to SBI factual communication guidelines
 * @param {string} text - Input text
 * @returns {string} Sanitized, factual text
 */
function applySbiFilter(text) {
  if (!text || typeof text !== 'string') return '';
  let filtered = text;
  for (const { pattern, replacement } of BLAME_PATTERNS) {
    filtered = filtered.replace(pattern, replacement);
  }
  return filtered;
}

module.exports = {
  applySbiFilter,
  BLAME_PATTERNS
};
