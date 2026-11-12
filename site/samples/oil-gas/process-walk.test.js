import { describe, expect, it } from 'vitest'
import * as oil from './content.js'
import {
  STAGES,
  STAGE_DISCLAIMER,
  boardPose,
  immersiveVrSupported,
  stageById,
  stepStage,
  xrOffsetPose,
} from './process-walk.js'

describe('oil-gas process walk', () => {
  it('lists the six stations drawn on the pad, in walk order', () => {
    expect(STAGES.map((stage) => stage.name)).toEqual([
      'Inlet / wellhead',
      'Separator',
      'Pipe rack',
      'Transfer pumps',
      'Flare',
      'Export',
    ])
    expect(STAGES.map((stage) => stage.n)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('keeps station ids off the hazard and decoy sets', () => {
    const hazardIds = new Set(oil.hazards.map((hazard) => hazard.id))
    const decoyIds = new Set(Object.keys(oil.decoys))
    for (const stage of STAGES) {
      expect(hazardIds.has(stage.id)).toBe(false)
      expect(decoyIds.has(stage.id)).toBe(false)
      expect(stage.disclaimer).toBe(STAGE_DISCLAIMER)
      expect(stage.disclaimer).toMatch(/not a real facility/i)
      expect(stage.disclaimer).toMatch(/live digital twin/i)
      expect(stage.purpose.toLowerCase()).not.toMatch(/hazard|weep|permit|lock-out/)
    }
  })

  it('does not change the lesson score when station ids are present', () => {
    const right = {}
    for (const hazard of oil.hazards) {
      right[hazard.id] = hazard.options.findIndex((option) => option.ok)
    }
    const withStages = { ...right }
    for (const stage of STAGES) withStages[stage.id] = 0
    expect(oil.score(withStages)).toBe(oil.score(right))
    expect(oil.score(withStages)).toBe(100)
    expect(oil.score({ 'stage-separator': 1 })).toBe(0)
  })

  it('steps inlet → export and stops at the ends', () => {
    expect(stepStage(STAGES, null, 1).id).toBe('stage-inlet')
    expect(stepStage(STAGES, 'stage-inlet', 1).id).toBe('stage-separator')
    expect(stepStage(STAGES, 'stage-separator', -1).id).toBe('stage-inlet')
    expect(stepStage(STAGES, 'stage-inlet', -1).id).toBe('stage-inlet')
    expect(stepStage(STAGES, 'stage-pumps', 1).id).toBe('stage-flare')
    expect(stepStage(STAGES, 'stage-flare', 1).id).toBe('stage-export')
    expect(stepStage(STAGES, 'stage-export', 1).id).toBe('stage-export')
    expect(stageById('stage-rack')?.short).toBe('Pipe rack')
    expect(stageById('missing')).toBe(null)
  })

  it('checks immersive-vr support without requesting a session', async () => {
    expect(await immersiveVrSupported(undefined)).toBe(false)
    expect(await immersiveVrSupported(null)).toBe(false)
    expect(await immersiveVrSupported({})).toBe(false)

    let requested = false
    const xr = {
      isSessionSupported: async (mode) => mode === 'immersive-vr',
      requestSession: async () => {
        requested = true
        return {}
      },
    }
    expect(await immersiveVrSupported(xr)).toBe(true)
    expect(requested).toBe(false)

    const failing = {
      isSessionSupported: async () => {
        throw new Error('no device')
      },
    }
    expect(await immersiveVrSupported(failing)).toBe(false)
  })

  it('builds a finite headset offset and a card between the visitor and the station', () => {
    for (const stage of STAGES) {
      const pose = xrOffsetPose(stage.stand)
      expect(pose.position).toEqual({ x: -stage.stand.x, y: 0, z: -stage.stand.z })
      const q = pose.orientation
      const len = Math.hypot(q.x, q.y, q.z, q.w)
      expect(len).toBeGreaterThan(0.999)
      expect(len).toBeLessThan(1.001)
      expect(Number.isFinite(pose.yaw)).toBe(true)

      const board = boardPose(stage.stand)
      const fromStand = Math.hypot(board.x - stage.stand.x, board.z - stage.stand.z)
      const fromLook = Math.hypot(board.x - stage.stand.look[0], board.z - stage.stand.look[2])
      expect(fromStand).toBeGreaterThan(1)
      expect(fromStand).toBeLessThan(1.5)
      expect(fromStand).toBeLessThan(fromLook)
      expect(board.y).toBeGreaterThan(1)
      expect(Number.isFinite(board.yaw)).toBe(true)
    }
  })
})
