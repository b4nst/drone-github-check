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

export interface Report {
  created: number
  duration: number
  status: TestStatus
  environment?: { [key: string]: any }
  summary: {
    total: number
    passed?: number
    skipped?: number
    failed?: number
    error?: number
  }
  tests: SingleReport[]
}
