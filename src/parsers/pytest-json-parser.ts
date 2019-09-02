import * as _ from 'lodash'
import { convertStatus, readFileP } from '../helpers'
import { Parser, Report, SingleReport, TestStatus } from '../types'

export interface PytestReport {
  created: number
  duration: number
  exitcode: number
  root: string
  environment: { [key: string]: any }
  summary: Summary
  collectors?: Collector[]
  tests?: Test[]
  warnings?: Warning[]
}

interface Summary {
  total: number
  passed?: number
  failed?: number
  xfailed?: number
  xpassed?: number
  error?: number
  skipped?: number
}

interface Collector {
  nodeid: string
  outcome: string
  result: { nodeid: string; type: string; lineo?: number }[]
  longrepr?: string
}

interface Test {
  nodeid: string
  lineno: number
  keywords: string[]
  outcome: string
  setup?: TestStage
  call?: TestStage
  teardown?: TestStage
  metadata?: { [key: string]: any }
}

export interface TestStage {
  duration: number
  outcome: string
  crash?: { path: string; lineno: number; message: string }
  traceback?: { path: string; lineno: number; message: string }[]
  stdout?: string
  stderr?: string
  log?: { [key: string]: any }[]
  longrepr?: string
}

interface Warning {
  filename: string
  lineo: number
  message: string
  when: 'config' | 'collect' | 'runtest'
}

export const readReport = (path: string): Promise<PytestReport> =>
  readFileP(path, 'utf8').then(JSON.parse)

export const pickSummary = (
  summary: Summary
): {
  total: number
  passed?: number
  skipped?: number
  failed?: number
  error?: number
} => _.pick(summary, ['total', 'passed', 'failed', 'error', 'skipped'])

export const toSingleReport = (test: Test): SingleReport => ({
  duration: _.chain(test)
    .pick(['setup', 'call', 'teardown'])
    .reduce((acc, stage) => acc + (stage !== undefined ? stage.duration : 0), 0)
    .value(),
  line: test.lineno,
  name: test.nodeid.split('::').pop() || '',
  status: convertStatus(test.outcome),
  crashReport: (_.chain(test)
    .map(_.property('crash'))
    .compact() as _.CollectionChain<NonNullable<TestStage['crash']>>)
    .map(c => ({
      lend: c.lineno,
      lstart: c.lineno,
      msg: c.message,
      path: c.path
    }))
    .value()
})

export const toReport = async (report: PytestReport): Promise<Report> => ({
  created: Math.round(report.created),
  duration: report.duration,
  environment: report.environment,
  status: report.exitcode === 0 ? TestStatus.Passed : TestStatus.Failed,
  summary: pickSummary(report.summary),
  tests: report.tests === undefined ? [] : report.tests.map(toSingleReport)
})

const pytestJsonParser: Parser = (path, _info) =>
  readReport(path).then(toReport)
export default pytestJsonParser
