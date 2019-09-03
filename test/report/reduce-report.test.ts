import { Report, TestStatus, SingleReport } from '../../src/types'
import { reduceReports } from '../../src/report/reduce-reports'
import chance from 'chance'
import { chunk } from 'lodash'

const random = new chance()

const createReport = (opt?: Partial<Report>): Report =>
  Object.assign(
    {
      duration: 1,
      status: TestStatus.Passed,
      created: 1,
      summary: {
        total: 1,
        passed: 1
      },
      tests: [
        {
          name: 'test1',
          status: TestStatus.Passed,
          duration: 1,
          line: 3,
          crashReport: []
        }
      ]
    },
    opt
  )

describe('Reduce reports', () => {
  test('should set created at earliest date', () => {
    const reports = [10, 3, 6].map(created => createReport({ created }))

    expect(reduceReports(reports)).toHaveProperty('created', 3)
  })
  test('should add durations', () => {
    const reports = [1, 2, 12].map(duration => createReport({ duration }))

    expect(reduceReports(reports)).toHaveProperty('duration', 15)
  })

  test('status failed should prevailed over all others', () => {
    const reports = [
      TestStatus.Passed,
      TestStatus.Failed,
      TestStatus.Skipped
    ].map(status => createReport({ status }))

    expect(reduceReports(reports)).toHaveProperty('status', TestStatus.Failed)
  })

  test('status skipped should prevailed over passed', () => {
    const reports = [
      TestStatus.Passed,
      TestStatus.Skipped,
      TestStatus.Passed
    ].map(status => createReport({ status }))

    expect(reduceReports(reports)).toHaveProperty('status', TestStatus.Skipped)
  })

  test('status should be passed if all report are passed', () => {
    const reports = [
      TestStatus.Passed,
      TestStatus.Passed,
      TestStatus.Passed
    ].map(status => createReport({ status }))

    expect(reduceReports(reports)).toHaveProperty('status', TestStatus.Passed)
  })

  test('should merge environment', () => {
    const reports = [
      { foo: 'nope' },
      { bar: 'bar' },
      { foo: 'foo', baz: 'baz' }
    ].map(environment => createReport({ environment }))

    expect(reduceReports(reports)).toHaveProperty('environment', {
      foo: 'foo',
      bar: 'bar',
      baz: 'baz'
    })
  })

  test('should not have environment if not present in any record', () => {
    const reports = Array(3)
      .fill(undefined)
      .map(createReport)

    expect(reduceReports(reports).environment).toBeUndefined()
  })

  test('should merge summaries', () => {
    const reports = [
      { total: 3, passed: 3 },
      { total: 2, failed: 2 },
      { total: 3, failed: 1, skipped: 1, passed: 1 }
    ].map(summary => createReport({ summary }))

    expect(reduceReports(reports).summary).toStrictEqual({
      total: 8,
      passed: 4,
      failed: 3,
      skipped: 1
    })
  })

  test('should concat tests', () => {
    const tests: SingleReport[] = random
      .n(
        () => ({
          name: random.word(),
          status: random.pickone([
            TestStatus.Failed,
            TestStatus.Passed,
            TestStatus.Skipped
          ]),
          duration: random.floating({ min: 0 }),
          line: random.integer({ min: 0, max: 500 }),
          crashReport: []
        }),
        8
      )
      .sort((a, b) => a.name.localeCompare(b.name) || a.duration - b.duration)

    const reports = chunk(tests, 3).map(tests => createReport({ tests }))
    const received = reduceReports(reports).tests.sort(
      (a, b) => a.name.localeCompare(b.name) || a.duration - b.duration
    )
    expect(received).toStrictEqual(tests)
  })
})
