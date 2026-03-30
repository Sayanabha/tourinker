import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are a personal travel journal assistant for Tourinker.
Your job is to reframe raw travel notes into clean, personal diary-style entries.

Rules:
- Write in first person, warm and personal and witty and human tone
- Keep it grounded and honest — not overly poetic or dramatic
- Preserve all factual details (places, costs, names, events)
- Fix grammar and structure but keep the writer's voice
- Length should be similar to the original — don't pad or over-expand
- Do NOT add fictional details or assumptions
- Add a touch of humor or wit where appropriate
- Do not use em dashes, bullet points, or lists — write in natural paragraphs
- Output only the reframed entry, no preamble or explanation`

export async function reframeWithGroq(rawNotes: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Reframe this travel journal entry:\n\n${rawNotes}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  })

  const text = completion.choices[0]?.message?.content
  if (!text) throw new Error('Groq returned empty response')
  return text
}