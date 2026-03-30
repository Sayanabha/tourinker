import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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

export async function reframeWithGemini(rawNotes: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
  })

  const result = await model.generateContent(
    `Reframe this travel journal entry:\n\n${rawNotes}`
  )

  const text = result.response.text()
  if (!text) throw new Error('Gemini returned empty response')
  return text
}