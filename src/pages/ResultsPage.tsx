import { useNavigate } from 'react-router-dom'
import { EMPTY_RESULTS, RESTORE_ERROR } from '../app/copy'
import { useSession } from '../app/useSession'
import { usePageTitle } from '../app/usePageTitle'
import { Button } from '../components/Button'
import { ResultsSummary } from '../components/ResultsSummary'

export function ResultsPage() {
  usePageTitle('Results')
  const navigate = useNavigate()
  const { attempt, result, restoreError, resetAttempt } = useSession()

  function tryAgain() {
    resetAttempt()
    navigate('/simulate')
  }

  return (
    <section className="wrap results-page">
      {restoreError ? (
        <p className="form-error" role="status">
          {RESTORE_ERROR}
        </p>
      ) : null}
      {result && attempt?.endedAt ? (
        <>
          <ResultsSummary result={result} attempt={attempt} />
          <div className="results-actions">
            <button type="button" className="btn btn-primary" onClick={tryAgain}>
              Try Again
            </button>
            <Button to="/how-it-works" variant="secondary">
              Learn How This Works
            </Button>
          </div>
        </>
      ) : (
        <div className="card empty-results">
          <h1>Your Training Snapshot</h1>
          <p>{EMPTY_RESULTS}</p>
          <Button to="/simulate">Go to the simulation</Button>
        </div>
      )}
    </section>
  )
}
