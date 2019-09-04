import * as Octokit from '@octokit/rest'
import { flatMap, sum } from 'lodash'
import { DroneEnv, Report } from '../types'
import { convertSingleReport } from './convert-single-report'
import { convertStatus } from './convert-status'

const buildSummary = (report: Report): string => {
  const errors = sum([report.summary.error, report.summary.failed])
  if (errors) return `Build failed with ${errors} errors 😟`
  return `🤗 Build passed with a total of ${report.summary.total} tests.`
}

const createOutput = (
  report: Report,
  drone: DroneEnv
): Octokit.ChecksCreateParamsOutput => ({
  title: `${drone.DRONE_SYSTEM_HOST} report`,
  summary: buildSummary(report),
  text: `Build ended with ${report.summary.passed || 0}✔️/${report.summary
    .skipped || 0}⏳/${report.summary.failed || 0}❌/${report.summary.error ||
    0}🚨/${report.summary.total} (passed/skipped/failed/error/total)`,
  annotations: flatMap(report.tests, t => convertSingleReport(t, drone))
})

export const convertReport = (
  report: Report,
  drone: DroneEnv
): Octokit.ChecksCreateParams => ({
  owner: drone.DRONE_REPO_OWNER,
  repo: drone.DRONE_REPO_NAME,
  head_sha: drone.DRONE_COMMIT_SHA,
  name: drone.DRONE_SYSTEM_HOST,
  details_url: `${drone.DRONE_SYSTEM_PROTO}://${drone.DRONE_SYSTEM_HOSTNAME}`,
  status: 'completed',
  conclusion: convertStatus(report.status),
  started_at: new Date(drone.DRONE_BUILD_STARTED).toISOString(),
  output: createOutput(report, drone)
})
