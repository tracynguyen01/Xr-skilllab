import { createContext } from 'react'
import type { AssessmentResult, Attempt, SubmitStatus } from '../domain/types'

export type SessionState = {
  attempt: Attempt | null
  result: AssessmentResult | null
  restoreError: boolean
}

export type SessionApi = SessionState & {
  startAttempt: () => void
  submitAnswer: (hazardId: string, choiceId: string) => SubmitStatus
  markDecoy: (decoyId: string) => void
  finishAttempt: () => AssessmentResult | null
  resetAttempt: () => void
}

export const SessionContext = createContext<SessionApi | null>(null)
