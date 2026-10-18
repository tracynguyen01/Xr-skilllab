import { useEffect, useId, useRef, useState } from 'react'
import type { Decoy, Hazard, HazardAnswer } from '../domain/types'
import { useDialogFocus } from './useDialogFocus'

type HazardDialogProps = {
  hazard: Hazard
  answer?: HazardAnswer
  onSubmit: (choiceId: string) => void
  onClose: () => void
}

type DecoyDialogProps = {
  decoy: Decoy
  onClose: () => void
}

export function HazardDialog({ hazard, answer, onSubmit, onClose }: HazardDialogProps) {
  const dialogRef = useDialogFocus(onClose)
  const titleId = useId()
  const descriptionId = useId()
  const [selected, setSelected] = useState<string | null>(answer?.choiceId ?? null)
  const [error, setError] = useState('')
  const chosen = answer ? hazard.choices.find((choice) => choice.id === answer.choiceId) : undefined
  const correct = answer?.choiceId === hazard.correctChoiceId
  const backRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (answer) backRef.current?.focus()
  }, [answer])

  function submit() {
    if (!selected) {
      setError('Choose one response before submitting.')
      return
    }
    onSubmit(selected)
  }

  return (
    <div className="backdrop" onMouseDown={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        ref={dialogRef}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <p className="eyebrow">Hazard</p>
        <h2 id={titleId}>{hazard.title}</h2>
        <p id={descriptionId}>{hazard.shortDescription}</p>

        {answer && chosen ? (
          <div className="feedback-block">
            <p className={correct ? 'status-pill is-good' : 'status-pill is-review'}>
              {correct ? 'Matches the scenario guidance' : 'Review this response'}
            </p>
            <p className="selected-line">
              <span className="muted">You selected:</span> {chosen.label}
            </p>
            <p>{chosen.feedback}</p>
            <p className="muted">{hazard.educationalExplanation}</p>
            <details className="source-note">
              <summary>Source note</summary>
              <p>{hazard.sourceReference}</p>
            </details>
            <div className="dialog-actions">
              <button type="button" className="btn btn-primary" onClick={onClose} ref={backRef}>
                Back to warehouse
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              submit()
            }}
          >
            <fieldset className="choices">
              <legend>What is the best response in this illustrative scenario?</legend>
              {hazard.choices.map((choice) => (
                <label key={choice.id} className="choice">
                  <input
                    type="radio"
                    name={`choice-${hazard.id}`}
                    value={choice.id}
                    checked={selected === choice.id}
                    onChange={() => {
                      setSelected(choice.id)
                      setError('')
                    }}
                  />
                  <span>{choice.label}</span>
                </label>
              ))}
            </fieldset>
            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="dialog-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
              <button type="submit" className="btn btn-primary">
                Submit answer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export function DecoyDialog({ decoy, onClose }: DecoyDialogProps) {
  const dialogRef = useDialogFocus(onClose)
  const titleId = useId()

  return (
    <div className="backdrop" onMouseDown={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={dialogRef}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <p className="eyebrow">Inspection point</p>
        <h2 id={titleId}>{decoy.title}</h2>
        <p className="status-pill is-neutral">{decoy.inspectionMessage}</p>
        <p>{decoy.explanation}</p>
        <details className="source-note">
          <summary>Source note</summary>
          <p>{decoy.sourceReference}</p>
        </details>
        <div className="dialog-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Back to warehouse
          </button>
        </div>
      </div>
    </div>
  )
}
