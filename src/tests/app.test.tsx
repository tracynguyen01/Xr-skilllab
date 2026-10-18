import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../app/App'
import { INDEPENDENCE_DISCLAIMER, TRAINING_DISCLAIMER } from '../app/copy'

describe('app routes', () => {
  it('shows the homepage and the required disclaimers', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Learn by doing, not just watching.' })).toBeTruthy()
    expect(INDEPENDENCE_DISCLAIMER).toBe(
      'XR SkillLab is an independent educational demonstration. It is not affiliated with or endorsed by Next XR Group or any safety regulator.',
    )
    expect(TRAINING_DISCLAIMER).toBe(
      'Training scenarios are illustrative and do not replace workplace induction, accredited training, emergency procedures or professional safety advice.',
    )
    expect(screen.getAllByText(INDEPENDENCE_DISCLAIMER).length).toBeGreaterThan(0)
    expect(screen.getAllByText(TRAINING_DISCLAIMER).length).toBeGreaterThan(0)
  })

  it('opens each primary route and a 404', async () => {
    const user = userEvent.setup()
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Primary' })

    await user.click(within(nav).getByRole('link', { name: 'How It Works' }))
    expect(screen.getByRole('heading', { level: 1, name: /hard line around the score/i })).toBeTruthy()

    await user.click(within(screen.getByRole('navigation', { name: 'Primary' })).getByRole('link', { name: 'Project Story' }))
    expect(screen.getByRole('heading', { level: 1, name: /practise the decision/i })).toBeTruthy()

    await user.click(within(screen.getByRole('navigation', { name: 'Primary' })).getByRole('link', { name: 'About' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Tracy Nguyen' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /github profile/i })).toHaveAttribute('href', 'https://github.com/tracynguyen01')

    window.location.hash = '#/not-a-real-page'
    expect(await screen.findByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy()
  })

  it('runs the 2D challenge through score, coach, and a full reset', async () => {
    const user = userEvent.setup()
    render(<App />)

    const startLinks = screen.getAllByRole('link', { name: 'Start the Simulation' })
    const startLink = startLinks[0]
    if (!startLink) throw new Error('Missing start link')
    await user.click(startLink)
    await user.click(screen.getByRole('button', { name: 'Use 2D Inspector' }))

    const list = screen.getByRole('list', { name: 'Inspection list' })
    await user.click(within(list).getByRole('button', { name: /blocked emergency exit/i }))

    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('radio', { name: /flag the obstruction/i }))
    await user.click(within(dialog).getByRole('button', { name: 'Submit answer' }))
    expect(within(dialog).getByText('Matches the scenario guidance')).toBeTruthy()
    await user.click(within(dialog).getByRole('button', { name: 'Back to warehouse' }))

    await user.click(screen.getByRole('button', { name: 'Finish Assessment' }))
    await user.click(screen.getByRole('button', { name: 'Finish anyway' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Score: 25 / 100' })).toBeTruthy()
    expect(
      screen.getByText('You identified 1 of 4 hazards and chose the preferred action for 1.'),
    ).toBeTruthy()
    expect(screen.getByText(/not assessed: unstable pallet stack/i)).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Try Again' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Warehouse Safety Challenge' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Use 2D Inspector' })).toBeTruthy()
    expect(screen.queryByText('Score: 25 / 100')).toBeNull()
  })
})
