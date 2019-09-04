import { TestStatus } from '../types'

export const convertStatus = (
  status: TestStatus
):
  | 'success'
  | 'failure'
  | 'neutral'
  | 'cancelled'
  | 'timed_out'
  | 'action_required' => {
  switch (status) {
    case TestStatus.Failed:
      return 'failure'
    case TestStatus.Passed:
      return 'success'
    case TestStatus.Skipped:
      return 'neutral'
    default:
      return 'cancelled'
  }
}
