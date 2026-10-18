/**
 * Shared types for the warehouse scenario.
 * The 2D inspector and the A-Frame scene both use these shapes so scoring
 * does not depend on how the visitor found a hazard.
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
   * Position of the 3D ring, in metres. The 2D picture does not use this.
   * Keep x between -5 and 5, and z between -5 and 3, so it stays inside the room.
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
  /** Where the 3D ring sits. The 2D picture uses sceneObjects.ts instead. */
  hotspot: Hotspot3D
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
