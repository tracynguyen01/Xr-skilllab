import { describe, expect, it } from 'vitest'
import * as oil from './oil-gas/content.js'
import * as mining from './mining/content.js'
import * as chemical from './chemical-processing/content.js'
import * as warehouse from './xr-skilllab/content.js'

const lessons = [
  ['oil-gas', oil],
  ['mining', mining],
  ['chemical-processing', chemical],
  ['warehouse', warehouse],
]

// Warehouse before-extraction baselines (Task 8A): empty 0, all-correct 100,
// all-wrong 60, mixed (2 right + 2 wrong) 80. Shared cases below must match.

describe.each(lessons)('%s scoring', (name, lesson) => {
  it('has four hazards and does not score decoys', () => {
    expect(lesson.hazards).toHaveLength(4)
    const ids = new Set(lesson.hazards.map((hazard) => hazard.id))
    expect(ids.size).toBe(4)
    for (const id of Object.keys(lesson.decoys)) expect(ids.has(id)).toBe(false)
    for (const hazard of lesson.hazards) {
      expect(hazard.options.filter((option) => option.ok)).toHaveLength(1)
      expect(hazard.options.length).toBeGreaterThan(1)
    }
  })

  it('awards 15 for identifying and 10 for the preferred action, out of 100', () => {
    expect(lesson.score({})).toBe(0)
    const wrong = {}
    const right = {}
    for (const hazard of lesson.hazards) {
      wrong[hazard.id] = hazard.options.findIndex((option) => !option.ok)
      right[hazard.id] = hazard.options.findIndex((option) => option.ok)
    }
    expect(lesson.score(wrong)).toBe(60)
    expect(lesson.score(right)).toBe(100)
    const one = { [lesson.hazards[0].id]: right[lesson.hazards[0].id] }
    expect(lesson.score(one)).toBe(25)
    const decoyAnswers = { ...right, flare: 0, water: 1, sds: 2 }
    expect(lesson.score(decoyAnswers)).toBe(100)
  })

  it('ignores equipment ids so inspecting context never changes the score', () => {
    if (!lesson.equipment) return
    const right = {}
    for (const hazard of lesson.hazards) {
      right[hazard.id] = hazard.options.findIndex((option) => option.ok)
    }
    // Extra keys for every equipment id (including decoys). Do not overwrite real answers.
    const withEquipment = { ...right }
    for (const id of Object.keys(lesson.equipment)) {
      if (withEquipment[id] == null) withEquipment[id] = 0
    }
    expect(Object.keys(withEquipment).length).toBeGreaterThan(Object.keys(right).length)
    expect(lesson.score(withEquipment)).toBe(lesson.score(right))
    expect(lesson.score(withEquipment)).toBe(100)
  })
})

describe('warehouse scoring baselines (pre-extraction)', () => {
  it('matches the recorded answer-set scores', () => {
    const right = {}
    const wrong = {}
    for (const hazard of warehouse.hazards) {
      right[hazard.id] = hazard.options.findIndex((option) => option.ok)
      wrong[hazard.id] = hazard.options.findIndex((option) => !option.ok)
    }
    // Mixed: first two correct, last two wrong → 4×15 + 2×10 = 80
    const mixed = {
      exit: right.exit,
      spill: right.spill,
      rack: wrong.rack,
      forklift: wrong.forklift,
    }
    expect(warehouse.score({})).toBe(0)
    expect(warehouse.score(right)).toBe(100)
    expect(warehouse.score(wrong)).toBe(60)
    expect(warehouse.score(mixed)).toBe(80)
  })
})
