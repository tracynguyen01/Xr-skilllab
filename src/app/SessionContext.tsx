import { useEffect, useRef, useState, type ReactNode } from 'react'
import { scoreAttempt } from '../domain/scoring'
import { closeAttempt, createAttempt, inspectDecoy, setAttemptMode, submitHazardAnswer } from '../domain/session'
import { readStoredSession, writeStoredSession } from '../domain/storage'
import { SessionContext, type SessionApi, type SessionState } from './session-context'

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(() => {
    const loaded = readStoredSession()
    return {
      attempt: loaded.session?.attempt ?? null,
      result: loaded.session?.result ?? null,
      restoreError: loaded.error,
    }
  })

  // Click handlers read this after commit so they see the latest attempt.
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
    writeStoredSession({ attempt: state.attempt, result: state.result })
  }, [state])

  function replace(next: SessionState) {
    stateRef.current = next
    setState(next)
  }

  const api: SessionApi = {
    ...state,
    startAttempt(mode) {
      replace({ attempt: createAttempt(mode), result: null, restoreError: false })
    },
    setMode(mode) {
      const current = stateRef.current
      if (!current.attempt) return
      const attempt = setAttemptMode(current.attempt, mode)
      if (attempt !== current.attempt) replace({ ...current, attempt })
    },
    submitAnswer(hazardId, choiceId) {
      const current = stateRef.current
      if (!current.attempt) return 'closed'
      const outcome = submitHazardAnswer(current.attempt, hazardId, choiceId, new Date().toISOString())
      if (outcome.attempt !== current.attempt) {
        replace({ attempt: outcome.attempt, result: null, restoreError: false })
      }
      return outcome.status
    },
    markDecoy(decoyId) {
      const current = stateRef.current
      if (!current.attempt) return
      const outcome = inspectDecoy(current.attempt, decoyId)
      if (outcome.attempt !== current.attempt) {
        replace({ ...current, attempt: outcome.attempt })
      }
    },
    finishAttempt() {
      const current = stateRef.current
      if (!current.attempt) return null
      if (current.attempt.endedAt && current.result) return current.result
      const attempt = closeAttempt(current.attempt, new Date().toISOString())
      const result = scoreAttempt(attempt)
      replace({ attempt, result, restoreError: false })
      return result
    },
    resetAttempt() {
      replace({ attempt: null, result: null, restoreError: false })
    },
  }

  return <SessionContext.Provider value={api}>{children}</SessionContext.Provider>
}
