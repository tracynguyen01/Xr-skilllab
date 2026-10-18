import { usePageTitle } from '../app/usePageTitle'
import { Button } from '../components/Button'

export function NotFoundPage() {
  usePageTitle('Page not found')

  return (
    <section className="wrap not-found">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p className="lede">That address is not one of the pages in this prototype.</p>
      <div className="hero-actions">
        <Button to="/">Back to home</Button>
        <Button to="/simulate" variant="secondary">
          Try Demo
        </Button>
      </div>
    </section>
  )
}
