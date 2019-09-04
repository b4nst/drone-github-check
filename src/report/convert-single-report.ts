import * as Octokit from '@octokit/rest'
import { DroneEnv, SingleReport } from '../types'

export const convertSingleReport = (
  report: SingleReport,
  drone: DroneEnv
): Octokit.ChecksCreateParamsOutputAnnotations[] =>
  report.crashReport.map(crashReport => ({
    path: crashReport.path.split(drone.DRONE_REPO_NAME + '/').pop() || '',
    start_line: crashReport.lstart,
    end_line: crashReport.lend,
    annotation_level: 'failure',
    message: crashReport.msg,
    title: report.name
  }))
