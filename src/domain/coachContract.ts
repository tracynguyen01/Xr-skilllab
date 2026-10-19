/**
 * Shared shape for optional AI coaching.
 * The browser and the Worker both use this parser. The model cannot add fields,
 * and the score is not one of them.
 */

export const AI_COACH_SOURCE = 'llm' as const

const TEXT_FIELDS = ['whatWentWell', 'whatToPractise', 'nextStep'] as const

const LIMITS = {
  whatWentWell: 280,
  whatToPractise: 280,
  nextStep: 180,
} as const

export type AiCoachText = {
  whatWentWell: string
  whatToPractise: string
  nextStep: string
}

export type AiCoachResponse = AiCoachText & {
  source: typeof AI_COACH_SOURCE
}

function isPlain(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function sameKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const own = Object.keys(value)
  return own.length === keys.length && keys.every((key) => own.includes(key))
}

function cleanLine(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  if (!text || text.length > max) return null
  if (text.includes('<') || text.includes('>')) return null
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index)
    if (code <= 8 || code === 11 || code === 12 || (code >= 14 && code <= 31)) return null
  }
  return text
}

/** Model output: exactly the three coaching lines. No score, no extra keys. */
export function parseAiCoachText(input: unknown): AiCoachText | null {
  if (!isPlain(input) || !sameKeys(input, TEXT_FIELDS)) return null
  const whatWentWell = cleanLine(input.whatWentWell, LIMITS.whatWentWell)
  const whatToPractise = cleanLine(input.whatToPractise, LIMITS.whatToPractise)
  const nextStep = cleanLine(input.nextStep, LIMITS.nextStep)
  if (!whatWentWell || !whatToPractise || !nextStep) return null
  return { whatWentWell, whatToPractise, nextStep }
}

/** What the browser accepts from the Worker. `source` is added by the Worker, not the model. */
export function parseAiCoachResponse(input: unknown): AiCoachResponse | null {
  if (!isPlain(input) || !sameKeys(input, ['source', ...TEXT_FIELDS])) return null
  if (input.source !== AI_COACH_SOURCE) return null
  const text = parseAiCoachText({
    whatWentWell: input.whatWentWell,
    whatToPractise: input.whatToPractise,
    nextStep: input.nextStep,
  })
  if (!text) return null
  return { source: AI_COACH_SOURCE, ...text }
}
