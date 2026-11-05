// Generates multiple-choice questions with an AI provider, straight from the browser.
//
// The key you paste is held in component state only. It is never saved.
// For production, move this call to your backend so the key never reaches the browser.

export const AI_PROVIDERS = [
  { id: 'anthropic', label: 'Anthropic (Claude)', model: 'claude-sonnet-5-5' },
  { id: 'openai', label: 'OpenAI', model: 'gpt-4o-mini' },
]

function buildPrompt({ topic, count, difficulty }) {
  return `Write ${count} multiple-choice questions for screening job candidates on: ${topic}.
Difficulty: ${difficulty}.

Rules:
- Each question has exactly 4 options and exactly one correct option.
- Vary which position holds the correct option.
- Keep questions practical and unambiguous.

Reply with only a JSON array and no other text. Each item must look like this:
{"text": "question text", "options": ["option a", "option b", "option c", "option d"], "correctIndex": 0}`
}

async function readJson(res) {
  let data = null
  try {
    data = await res.json()
  } catch {
    // The body was not JSON.
  }
  if (!res.ok) {
    const message = data?.error?.message
    throw new Error(
      message ? `AI service error: ${message}` : `AI service error (${res.status}). Check your API key.`,
    )
  }
  return data ?? {}
}

async function callAnthropic(apiKey, model, prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      // Required by Anthropic for calls made directly from a browser.
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await readJson(res)
  const block = data.content?.find((item) => item.type === 'text')
  if (!block) throw new Error('The AI service returned an empty reply. Try again.')
  return block.text
}

async function callOpenAI(apiKey, model, prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await readJson(res)
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('The AI service returned an empty reply. Try again.')
  return text
}

const isValidQuestion = (q) =>
  q &&
  typeof q.text === 'string' &&
  q.text.trim() &&
  Array.isArray(q.options) &&
  q.options.length >= 2 &&
  q.options.every((o) => typeof o === 'string' && o.trim()) &&
  Number.isInteger(q.correctIndex) &&
  q.correctIndex >= 0 &&
  q.correctIndex < q.options.length

export function parseQuestions(raw) {
  const start = raw.indexOf('[')
  const end = raw.lastIndexOf(']')
  if (start === -1 || end <= start) {
    throw new Error('The AI reply did not contain a list of questions. Try again.')
  }

  let data
  try {
    data = JSON.parse(raw.slice(start, end + 1))
  } catch {
    throw new Error('The AI reply could not be read. Try again.')
  }

  const questions = (Array.isArray(data) ? data : []).filter(isValidQuestion).map((q) => ({
    text: q.text.trim(),
    options: q.options.map((o) => o.trim()),
    correctIndex: q.correctIndex,
  }))

  if (!questions.length) throw new Error('The AI reply had no usable questions. Try again.')
  return questions
}

export async function generateQuestions({ provider, apiKey, topic, count, difficulty }) {
  if (!apiKey.trim()) throw new Error('Paste your API key first.')
  if (!topic.trim()) throw new Error('Describe what the questions should cover.')

  const meta = AI_PROVIDERS.find((p) => p.id === provider) ?? AI_PROVIDERS[0]
  const prompt = buildPrompt({ topic: topic.trim(), count, difficulty })
  const call = meta.id === 'openai' ? callOpenAI : callAnthropic

  let raw
  try {
    raw = await call(apiKey.trim(), meta.model, prompt)
  } catch (err) {
    // fetch() throws a TypeError when the network or CORS blocks the request.
    if (err instanceof TypeError) throw new Error('Could not reach the AI service. Check your connection.')
    throw err
  }
  return parseQuestions(raw)
}
