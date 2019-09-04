import { convertSingleReport } from '../../src/report/convert-single-report'
import { random } from '../test-helper'
import { SingleReport, TestStatus } from '../../src/types'
import * as Octokit from '@octokit/rest'

describe('Convert single report', () => {
  const droneEnv = random.drone_env()
  test('should be empty when crashReport is empty', () => {
    const r: SingleReport = {
      name: random.word(),
      status: TestStatus.Passed,
      duration: random.integer({ min: 0 }),
      line: random.integer({ min: 1, max: 500 }),
      crashReport: []
    }

    expect(convertSingleReport(r, droneEnv)).toEqual([])
  })

  test('should extract all crashReports', () => {
    const r: SingleReport = {
      name: 'Report title',
      status: TestStatus.Passed,
      duration: random.integer({ min: 0 }),
      line: random.integer({ min: 1, max: 500 }),
      crashReport: [
        {
          path: [random.word(), droneEnv.DRONE_REPO_NAME, 'path/to/1'].join(
            '/'
          ),
          lstart: 3,
          lend: 7,
          msg: 'Test 1 failed'
        },
        {
          path: [random.word(), droneEnv.DRONE_REPO_NAME, 'path/to/2'].join(
            '/'
          ),
          lstart: 10,
          lend: 12,
          msg: 'Test 2 failed'
        }
      ]
    }

    const expected: Octokit.ChecksCreateParamsOutputAnnotations[] = [
      {
        path: 'path/to/1',
        start_line: 3,
        end_line: 7,
        annotation_level: 'failure',
        message: 'Test 1 failed',
        title: 'Report title'
      },
      {
        path: 'path/to/2',
        start_line: 10,
        end_line: 12,
        annotation_level: 'failure',
        message: 'Test 2 failed',
        title: 'Report title'
      }
    ]

    expect(convertSingleReport(r, droneEnv)).toStrictEqual(expected)
  })

  test('should set an empty path if path parse fail', () => {
    const r: SingleReport = {
      name: 'Report',
      status: TestStatus.Passed,
      duration: random.integer({ min: 0 }),
      line: random.integer({ min: 1, max: 500 }),
      crashReport: [
        {
          path: '',
          lstart: 3,
          lend: 7,
          msg: 'Test 1 failed'
        }
      ]
    }

    expect(convertSingleReport(r, droneEnv)[0].path).toBe('')
  })

  test('should not change path if already relative', () => {
    const r: SingleReport = {
      name: 'Report',
      status: TestStatus.Passed,
      duration: random.integer({ min: 0 }),
      line: random.integer({ min: 1, max: 500 }),
      crashReport: [
        {
          path: 'path/to/file',
          lstart: 3,
          lend: 7,
          msg: 'Test 1 failed'
        }
      ]
    }

    expect(convertSingleReport(r, droneEnv)[0].path).toBe('path/to/file')
  })
})
