import * as parsers from '../../src/parsers'
import path from 'path'
import fs from 'fs'
import util from 'util'
import _ from 'lodash'
import { Parser } from '../../src/types'

const readFileP = util.promisify(fs.readFile)

type Case = {
  expect: string
  input: string
}

const getFolder = (parser: keyof typeof parsers) =>
  path.join(__dirname, parser.replace('Parser', ''))

const getTestCase = (parser: keyof typeof parsers): Array<Case> => {
  const folder = getFolder(parser)
  if (!fs.existsSync(folder)) return []

  return _.chain(fs.readdirSync(folder, 'utf8'))
    .filter(f => f.match(/case_\d+\.((expect\.json)|(input\.\w+))/g) !== null)
    .groupBy(f => parseInt(f.replace(/^case_(\d+).*$/, '$1')))
    .values()
    .map(c => _.zipObject(['expect', 'input'], c))
    .value() as Array<Case>
}

const createTestCase = (parserName: keyof typeof parsers) => (
  tc: Case,
  index: number
) =>
  describe(`Case ${index}`, () => {
    test('should have an input and expect file', () => {
      expect(tc.expect).toEqual(expect.anything())
      expect(tc.input).toEqual(expect.anything())
    })

    test('should parse case', async () => {
      const iPath = path.join(getFolder(parserName), tc.input)
      const ePath = path.join(getFolder(parserName), tc.expect)
      const [expected, actual] = await Promise.all([
        readFileP(ePath, 'utf-8').then(JSON.parse),
        _.get(parsers, parserName)(iPath, {})
      ])
      expect(actual).toStrictEqual(expected)
    })
  })

describe('Test parsers', () => {
  Object.keys(parsers).map(parser =>
    describe(parser, () => {
      const testCases = getTestCase(parser as keyof typeof parsers)

      test('should have at least one test case', () => {
        expect(testCases.length).toBeGreaterThan(0)
      })

      testCases.map(createTestCase(parser as keyof typeof parsers))
    })
  )
})
