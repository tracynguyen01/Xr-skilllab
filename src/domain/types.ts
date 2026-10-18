/**
 * Shared types for the warehouse scenario.
 * The 2D inspector and the future A-Frame scene should both use these
 * shapes so scoring does not depend on how the visitor found a hazard.
 */

export type SceneMode = '2d' | '3d'

export type Hotspot3D = {
  x: number
  y: number
  z: number
}

export type HazardChoice = {
  id: string
  label: string
  feedback: string
}

export type Hazard = {
  id: string
  title: string
  shortDescription: string
  educationalExplanation: string
  /**
   * Reserved for the future 3D scene. Not used to place 2D markers.
   * Reposition these when the A-Frame warehouse is built and looked at.
   */
  hotspot: Hotspot3D
  choices: HazardChoice[]
  correctChoiceId: string
  rubricVersion: string
  /** Where the explanation came from, kept for later expert review. */
  sourceReference: string
}

export type Decoy = {
  id: string
  title: string
  shortDescription: string
  /** Always the required "No issue found here" line for P0 decoys. */
  inspectionMessage: string
  explanation: string
  sourceReference: string
}

export type HazardAnswer = {
  hazardId: string
  choiceId: string
  /** ISO timestamp. Local only, not sent anywhere. */
  selectedAt: string
}

export type Attempt = {
  attemptId: string
  scenarioId: 'warehouse-safety-v1'
  scenarioVersion: string
  startedAt: string
  endedAt?: string
  answers: Record<string, HazardAnswer>
  inspectedDecoyIds: string[]
  mode: SceneMode
}

export type AssessmentDetail = {
  hazardId: string
  identified: boolean
  selectedChoiceId?: string
  correct: boolean
  points: number
  explanation: string
}

export type AssessmentResult = {
  /** 0..100. 15 points for assessing a hazard, plus 10 for the preferred action. */
  score: number
  identifiedHazards: number
  correctActions: number
  totalHazards: number
  details: AssessmentDetail[]
}

export type SubmitStatus = 'recorded' | 'duplicate' | 'unknown-hazard' | 'invalid-choice' | 'closed'

export type CoachFeedback = {
  source: 'offline-rules'
  summary: string
  strength: string
  improvements: string[]
  nextStep: string
  disclaimer: string
}
