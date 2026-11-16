// Polski Daily server.
// Serves the app, the curriculum, and a small proxy to the Claude API for the tutor.
// The API key stays on the server. The browser never sees it.

const express = require('express');
const path = require('path');
const fs = require('fs');
const pkg = require('./package.json');

const app = express();
app.use(express.json({ limit: '50kb' }));

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ACCESS_CODE = process.env.ACCESS_CODE || '';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';
const API_BASE = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';
const DAILY_CAP = parseInt(process.env.DAILY_TUTOR_CAP || '150', 10);

const curriculum = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'curriculum.json'), 'utf8')
);

const LANGUAGES = {
  el: 'Greek',
  it: 'Italian',
  es: 'Spanish',
  en: 'English'
};
const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2'];

// Daily cap on tutor messages, shared by everyone who uses the demo.
// Kept in memory, so it also resets when the free Render service restarts.
let capDay = '';
let capCount = 0;
function underCap() {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== capDay) {
    capDay = today;
    capCount = 0;
  }
  return capCount < DAILY_CAP;
}

function buildSystemPrompt(lang, level, lesson, explainIn) {
  const native = LANGUAGES[lang] || 'English';
  const explain = explainIn === 'en' ? 'English' : native;
  const topic = lesson
    ? `Today's lesson is "${lesson.title}". Conversation task: ${lesson.tutorTopic}`
    : 'There is no lesson topic today. Have a simple everyday conversation.';
  return [
    'You are a patient Polish tutor inside a study app called Polski Daily.',
    `The learner's first language is ${native}. Their Polish level is ${level}.`,
    topic,
    'Rules:',
    `1. Write your Polish at ${level} level. Short sentences. At A0 or A1 use only very common words.`,
    `2. After each Polish message, add a short translation in ${explain} in brackets.`,
    '3. If the learner makes a mistake, show the corrected sentence first, then explain the one most important mistake in one or two sentences ' +
      `in ${explain}. Do not list every small error.`,
    `4. When a comparison with ${native} grammar helps (cases, gender, verb aspect, missing articles, sounds), use it briefly.`,
    '5. End every message with one simple question in Polish so the conversation continues.',
    '6. Keep each reply under 90 words. No markdown, no lists, no emojis.',
    '7. Stay on learning Polish. If asked for anything else, say in one sentence that you only help with Polish.'
  ].join('\n');
}

app.get('/api/status', (req, res) => {
  res.json({
    version: pkg.version,
    tutorConfigured: Boolean(API_KEY),
    codeRequired: Boolean(ACCESS_CODE)
  });
});

app.get('/api/curriculum', (req, res) => {
  res.json(curriculum);
});

app.post('/api/tutor', async (req, res) => {
  if (!API_KEY) {
    return res.status(503).json({ error: 'not_configured', message: 'The tutor is not set up on this server yet.' });
  }
  if (ACCESS_CODE && req.get('x-access-code') !== ACCESS_CODE) {
    return res.status(401).json({ error: 'bad_code', message: 'That access code is not right.' });
  }
  if (!underCap()) {
    return res.status(429).json({ error: 'cap', message: 'The tutor has reached its daily message limit. Try again tomorrow.' });
  }

  const body = req.body || {};
  const lang = LANGUAGES[body.lang] ? body.lang : 'en';
  const level = LEVELS.includes(body.level) ? body.level : 'A0';
  const explainIn = body.explainIn === 'en' ? 'en' : 'native';
  const lesson = curriculum.lessons.find((l) => l.id === body.lessonId) || null;

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return res.status(400).json({ error: 'bad_request', message: 'No message to send.' });
  }
  // Only the last 12 turns are sent, and each one is trimmed. This keeps the cost per message small.
  const messages = body.messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 800) }));
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'bad_request', message: 'The last message must come from the learner.' });
  }

  try {
    capCount += 1;
    const r = await fetch(`${API_BASE}/v1/messages`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system: buildSystemPrompt(lang, level, lesson, explainIn),
        messages
      })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('Tutor API error', r.status, JSON.stringify(data).slice(0, 300));
      return res.status(502).json({ error: 'upstream', message: 'The tutor could not answer just now. Try again in a minute.' });
    }
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    res.json({ reply: text || '...' });
  } catch (err) {
    console.error('Tutor request failed', err.message);
    res.status(502).json({ error: 'upstream', message: 'The tutor could not answer just now. Try again in a minute.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: 'not_found' });
});

app.listen(PORT, () => {
  console.log(`Polski Daily v${pkg.version} listening on port ${PORT}`);
  console.log(`Tutor configured: ${Boolean(API_KEY)}. Access code required: ${Boolean(ACCESS_CODE)}.`);
});
