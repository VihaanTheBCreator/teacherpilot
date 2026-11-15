/**
 * Teacher Intent Parser
 * Converts natural language teacher instructions into structured machine-readable intents.
 * Supports Gemini API with ultra-fast offline rule-based fallback.
 */

const { PRESET_SCENARIOS } = require('./templates');

/**
 * Fast offline NLP intent classifier
 * @param {string} prompt - Teacher's raw input
 * @param {object} [options] - Optional overrides (e.g. tone, schoolContext)
 * @returns {import('./types').Intent}
 */
function parseIntentOffline(prompt, options = {}) {
  const text = (prompt || '').trim();
  const lower = text.toLowerCase();

  let scenario = 'custom';
  let targetFilter = {};
  let tone = options.tone || 'Institutional';
  let urgency = 'today';
  const keyFacts = [];

  // 1. Detect Scenario & Target Filter
  if (lower.includes('stay-back') || lower.includes('stayback') || (lower.includes('stay') && lower.includes('back'))) {
    scenario = 'stayback_cancel';
    targetFilter = { stayBack: true };
    urgency = 'immediate';
    tone = options.tone || 'Institutional';
    keyFacts.push("Stay-back is cancelled today");
    if (lower.includes('2:10') || lower.includes('regular bus')) {
      keyFacts.push("Regular bus departure at 2:10 PM");
    }
    if (lower.includes('gate 3') || lower.includes('own transport') || lower.includes('pickup')) {
      keyFacts.push("Private transport pickup at Gate 3 by 2:20 PM");
    }
  } else if (lower.includes('bus') && (lower.includes('delay') || lower.includes('late') || lower.includes('running') || lower.includes('traffic'))) {
    scenario = 'bus_delay';
    urgency = 'immediate';
    tone = options.tone || 'Institutional';

    // Extract bus route number
    const busMatch = text.match(/bus\s*(\d+)/i);
    const routeName = busMatch ? `Bus ${busMatch[1]}` : 'Bus 14';
    targetFilter = { busRoute: routeName };

    // Extract delay minutes
    const delayMatch = text.match(/(\d+)\s*(mins?|minutes)/i);
    const delayMins = delayMatch ? delayMatch[1] : '25';
    keyFacts.push(`${routeName} is delayed by approximately ${delayMins} minutes`);

    // Extract drop-off or reason
    if (lower.includes('hessa') || lower.includes('roadworks') || lower.includes('traffic')) {
      keyFacts.push("Delay caused by heavy roadworks/traffic");
    }
    keyFacts.push("All students are safe on board with the bus monitor");
  } else if (lower.includes('remedial') || lower.includes('below 35') || lower.includes('<35') || lower.includes('under 35') || (lower.includes('unit test') && lower.includes('score'))) {
    scenario = 'remedial';
    targetFilter = { remedial: true, maxScore: 35 };
    urgency = 'today';
    tone = options.tone || 'Firm';
    keyFacts.push("Diagnostic Unit Test 2 score below 35% threshold");
    keyFacts.push("CBSE theory separate passing criteria (33%) mandatory compliance");
    keyFacts.push("Mandatory remedial revision session scheduled Thursday 2:15 PM");
  } else if (lower.includes('consent') || lower.includes('field trip') || lower.includes('trip') || lower.includes('museum') || lower.includes('fee')) {
    scenario = 'consent_chase';
    targetFilter = { consentStatus: 'PENDING' };
    urgency = 'today';
    tone = options.tone || 'Firm';
    keyFacts.push("Field trip consent and registration fee pending");
    if (lower.includes('48 hours') || lower.includes('deadline')) {
      keyFacts.push("Submission deadline is within 48 hours");
    }
    if (lower.includes('95') || lower.includes('aed')) {
      keyFacts.push("AED 95 activity fee required to confirm bus seat booking");
    }
  } else if (lower.includes('star') || lower.includes('praise') || lower.includes('commendation') || lower.includes('leadership') || lower.includes('appreciation')) {
    scenario = 'praise';
    targetFilter = { minScore: 80 };
    urgency = 'planning';
    tone = options.tone || 'Warm';
    keyFacts.push("Exceptional academic commitment and class leadership");
    keyFacts.push("Active peer mentorship during Term 2 presentations");
  } else {
    // Custom scenario
    scenario = 'custom';
    targetFilter = {};
    urgency = lower.includes('urgent') || lower.includes('immediate') ? 'immediate' : 'today';
    tone = options.tone || (lower.includes('please') ? 'Warm' : 'Institutional');
    if (text.length > 0) {
      keyFacts.push(text.slice(0, 100));
    }
  }

  // Tone detection heuristics if not strictly specified
  if (!options.tone) {
    if (lower.includes('warm') || lower.includes('proud') || lower.includes('pleased') || lower.includes('congratulat')) {
      tone = 'Warm';
    } else if (lower.includes('strictly') || lower.includes('mandatory') || lower.includes('immediate action') || lower.includes('firm')) {
      tone = 'Firm';
    }
  }

  return {
    scenario,
    targetFilter,
    tone,
    urgency,
    keyFacts: keyFacts.length > 0 ? keyFacts : [text],
    rawPrompt: text
  };
}

/**
 * Parse Intent with Gemini AI (fallback to offline parser on failure or no key)
 * @param {string} prompt - Natural language prompt from teacher
 * @param {object} [options] - Options
 * @returns {Promise<import('./types').Intent>}
 */
async function parseIntent(prompt, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey.trim() === '') {
    return parseIntentOffline(prompt, options);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const systemPrompt = `You are an AI assistant for a UAE CBSE school teacher at GEMS Our Own Indian School.
Analyze the teacher's command and output strict JSON with this schema:
{
  "scenario": "stayback_cancel" | "bus_delay" | "remedial" | "consent_chase" | "praise" | "custom",
  "targetFilter": {
    "stayBack": boolean,
    "busRoute": string,
    "remedial": boolean,
    "consentStatus": string,
    "minScore": number,
    "maxScore": number
  },
  "tone": "Warm" | "Firm" | "Institutional",
  "urgency": "immediate" | "today" | "planning",
  "keyFacts": string[]
}
Teacher prompt: "${prompt}"`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return parseIntentOffline(prompt, options);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      const parsed = JSON.parse(candidateText);
      return {
        scenario: parsed.scenario || 'custom',
        targetFilter: parsed.targetFilter || {},
        tone: options.tone || parsed.tone || 'Institutional',
        urgency: parsed.urgency || 'today',
        keyFacts: Array.isArray(parsed.keyFacts) ? parsed.keyFacts : [prompt],
        rawPrompt: prompt
      };
    }
  } catch (err) {
    // Graceful fallback to offline logic
  }

  return parseIntentOffline(prompt, options);
}

module.exports = {
  parseIntent,
  parseIntentOffline
};
