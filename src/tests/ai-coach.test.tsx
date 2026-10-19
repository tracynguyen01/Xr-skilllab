import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ResultsSummary } from '../components/ResultsSummary'
import { buildCoachRequest, coachEndpoint } from '../domain/aiCoach'
import { WAREHOUSE_HAZARDS } from '../domain/hazards'
import { scoreAttempt } from '../domain/scoring'
import { createAttempt, submitHazardAnswer } from '../domain/session'

const NOW = '2026-10-19T00:00:00.000Z'

function finished() {
  const hazard = WAREHOUSE_HAZARDS[0]
  if (!hazard) throw new Error('hazard')
  const submitted = submitHazardAnswer(createAttempt('2d', NOW), hazard.id, hazard.correctChoiceId, NOW).attempt
  const attempt = { ...submitted, endedAt: NOW }
  return { attempt, result: scoreAttempt(attempt) }
}

const coaching = {
  source: 'llm',
  whatWentWell: 'You chose the preferred action for the blocked exit.',
  whatToPractise: 'Look again at the spill, the pallet, and the forklift crossing.',
  nextStep: 'On the next attempt, check the walkway before you finish.',
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('AI coach switch', () => {
  it('stays off when the build has no coach URL, and does not call the network', () => {
    expect(coachEndpoint(undefined)).toBeNull()
    expect(coachEndpoint('')).toBeNull()
    expect(coachEndpoint('http://coach.example/coach')).toBeNull()
    const fetchImpl = vi.fn()
    vi.stubGlobal('fetch', fetchImpl)
    const { attempt, result } = finished()
    render(<ResultsSummary result={result} attempt={attempt} />)
    expect(screen.getByText('Scenario Coach · offline rules')).toBeTruthy()
    expect(screen.queryByText('AI coaching (beta)')).toBeNull()
    expect(screen.getByRole('heading', { level: 1, name: 'Score: 25 / 100' })).toBeTruthy()
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('requests structured coaching and keeps the deterministic score', async () => {
    const user = userEvent.setup()
    const fetchImpl = vi.fn(async (_url: string, _init?: RequestInit) => new Response(JSON.stringify(coaching), { status: 200 }))
    vi.stubGlobal('fetch', fetchImpl)
    const { attempt, result } = finished()
    render(<ResultsSummary result={result} attempt={attempt} aiEndpoint="https://coach.example/coach" />)

    expect(screen.getByText('AI coaching (beta)')).toBeTruthy()
    expect(screen.queryByText(/AI-generated feedback/i)).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Request AI coaching' }))

    expect(await screen.findByText(coaching.whatWentWell)).toBeTruthy()
    expect(screen.getByText(coaching.whatToPractise)).toBeTruthy()
    expect(screen.getByText(coaching.nextStep)).toBeTruthy()
    expect(screen.getByText('AI-generated feedback. It may be imperfect.')).toBeTruthy()
    expect(screen.getByText('This coaching does not change the score. The score comes from the scenario rules.')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: 'Score: 25 / 100' })).toBeTruthy()
    expect(screen.getByText('Scenario Coach · offline rules')).toBeTruthy()

    const body = JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body)) as ReturnType<typeof buildCoachRequest>
    expect(body).toEqual(buildCoachRequest(attempt, result))
    expect(JSON.stringify(body)).not.toContain('Flag the obstruction')
  })

  it('falls back to the offline coach when the request fails or the reply is unusable', async () => {
    const user = userEvent.setup()
    const { attempt, result } = finished()

    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('down'))))
    const { rerender } = render(<ResultsSummary result={result} attempt={attempt} aiEndpoint="https://coach.example/coach" />)
    await user.click(screen.getByRole('button', { name: 'Request AI coaching' }))
    expect(await screen.findByRole('button', { name: 'Request AI coaching' })).toBeTruthy()
    expect(screen.queryByText(/unavailable|error|failed|offline feedback/i)).toBeNull()
    expect(screen.getByText('You identified 1 of 4 hazards and chose the preferred action for 1.')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: 'Score: 25 / 100' })).toBeTruthy()

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ source: 'llm', whatWentWell: '<b>Hi</b>' }), { status: 200 })),
    )
    rerender(<ResultsSummary result={result} attempt={attempt} aiEndpoint="https://coach.example/coach" />)
    await user.click(screen.getByRole('button', { name: 'Request AI coaching' }))
    expect(await screen.findByRole('button', { name: 'Request AI coaching' })).toBeTruthy()
    expect(screen.queryByText('<b>Hi</b>')).toBeNull()
    expect(screen.getByText('Scenario Coach · offline rules')).toBeTruthy()
  })
})
