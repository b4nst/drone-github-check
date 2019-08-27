export enum TestStatus {
  Passed,
  Skipped,
  Failed
}

export interface SingleReport {
  name: string
  status: TestStatus
  crashReport?: {
    path: string
    start: number
    end: number
    msg: string
  }
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
