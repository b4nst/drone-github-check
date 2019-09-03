import { assignWith, sum } from 'lodash'
import { Report } from '../types'

export const reduceReports = (reports: Report[]): Report =>
  reports.reduce((report, acc) => ({
    created: Math.min(report.created, acc.created),
    duration: report.duration + acc.duration,
    status: Math.max(report.status, acc.status),
    environment:
      report.environment || acc.environment
        ? { ...report.environment, ...acc.environment }
        : undefined,
    summary: assignWith(report.summary, acc.summary, (v1, v2) => sum([v1, v2])),
    tests: [...acc.tests, ...report.tests]
  }))
