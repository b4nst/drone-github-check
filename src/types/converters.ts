import * as Octokit from '@octokit/rest'
import { Report } from './report'

export type Report2Check = (
  report: Report,
  info: { owner: string; repo: string; head: string }
) => Promise<Octokit.ChecksCreateParams>
