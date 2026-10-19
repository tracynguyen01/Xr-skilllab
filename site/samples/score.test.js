import { describe, expect, it } from 'vitest'
import * as oil from './oil-gas/content.js'
import * as mining from './mining/content.js'
import * as chemical from './chemical-processing/content.js'

const lessons = [
  ['oil-gas', oil],
  ['mining', mining],
  ['chemical-processing', chemical],
]

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
})
