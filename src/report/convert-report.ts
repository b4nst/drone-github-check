import * as Octokit from '@octokit/rest'
import { flatMap } from 'lodash'

import { DroneEnv, Report } from '../types'

import { convertSingleReport } from './convert-single-report'
import { convertStatus } from './convert-status'

const createOutput = (
  report: Report,
  drone: DroneEnv
): Octokit.ChecksCreateParamsOutput => ({
  title: `${drone.DRONE_SYSTEM_HOST} report`,
  summary: `# Report of [build #${drone.DRONE_BUILD_NUMBER}](${drone.DRONE_SYSTEM_PROTO}//${drone.DRONE_SYSTEM_HOST}/${drone.DRONE_REPO}/${drone.DRONE_BUILD_NUMBER})`,
  text: `Build done with ${convertStatus(report.status)} (${
    report.summary.total
  } tests executed, ${report.summary.failed || 0} failed)

<details><summary>test environment</summary><pre><code>${JSON.stringify(
    report.environment,
    null,
    2
  )}</code></pre></details>`,
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
  details_url: `${drone.DRONE_SYSTEM_PROTO}://${drone.DRONE_SYSTEM_HOST}`,
  status: 'completed',
  conclusion: convertStatus(report.status),
  started_at: new Date(drone.DRONE_BUILD_STARTED).toISOString(),
  output: createOutput(report, drone)
})
