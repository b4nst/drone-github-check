export enum TestStatus {
  Passed,
  Skipped,
  Failed
}

export interface SingleReport {
  name: string
  status: TestStatus
  duration: number
  line: number
  crashReport: {
    path: string
    lstart: number
    lend: number
    msg: string
  }[]
}

export interface ReportSummary {
  total: number
  passed?: number
  skipped?: number
  failed?: number
  error?: number
}

export interface Report {
  created: number
  duration: number
  status: TestStatus
  environment?: { [key: string]: any }
  summary: ReportSummary
  tests: SingleReport[]
}
