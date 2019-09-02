import chance from 'chance'
import mockFs from 'mock-fs'
import { pickSummary } from '../../src/parsers/pytest-json-parser'
import { Report } from '../../src/types'

describe('Pytest json parser', () => {
  const random = new chance()

  test('should extract summary', () => {
    const expected = {
      error: random.integer(),
      failed: random.integer(),
      passed: random.integer(),
      skipped: random.integer(),
      total: random.integer()
    }
    const summary = {
      ...expected,
      xfailed: random.integer(),
      xpassed: random.integer()
    }

    expect(pickSummary(summary)).toStrictEqual(expected)
  })
})
