import fs from 'fs'
import util from 'util'
import { TestStatus } from './types'

export const readFileP = util.promisify(fs.readFile)
export const readdirP = util.promisify(fs.readdir)

export const convertStatus = (status: string): TestStatus => {
  switch (status) {
    case 'passed':
    case 'pass':
    case 'green':
    case 'ok':
      return TestStatus.Passed
    case 'failed':
    case 'fail':
    case 'red':
    case 'nok':
    case 'ko':
      return TestStatus.Failed
    case 'skipped':
    case 'skip':
    case 'gray':
      return TestStatus.Skipped
    default:
      throw new Error(`Invalid status '${status}'`)
  }
}
