import { reframeWithGemini } from './gemini'
import { reframeWithGroq } from './groq'
import { ReframeResult } from '@/types'

const GEMINI_TIMEOUT_MS = 15000

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), ms)
  )
  return Promise.race([promise, timeout])
}

export async function reframeEntry(rawNotes: string): Promise<ReframeResult> {
  // Validate input
  if (!rawNotes || rawNotes.trim().length < 10) {
    throw new Error('Entry too short to reframe')
  }

  // Try Gemini first
  try {
    const reframed = await withTimeout(
      reframeWithGemini(rawNotes),
      GEMINI_TIMEOUT_MS
    )
    return { reframed, model_used: 'gemini', success: true }
  } catch (geminiError) {
    console.warn(
      '[Tourinker] Gemini failed, falling back to Groq:',
      geminiError instanceof Error ? geminiError.message : geminiError
    )
  }

  // Fallback to Groq
  try {
    const reframed = await reframeWithGroq(rawNotes)
    return { reframed, model_used: 'groq', success: true }
  } catch (groqError) {
    console.error(
      '[Tourinker] Groq also failed:',
      groqError instanceof Error ? groqError.message : groqError
    )
    throw new Error('Both AI models failed. Please try again.')
  }
}