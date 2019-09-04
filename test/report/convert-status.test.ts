import { TestStatus } from '../../src/types'
import { convertStatus } from '../../src/report/convert-status'

describe('Convert status', () => {
  test('should convert status', () => {
    expect(convertStatus(TestStatus.Failed)).toBe('failure')
    expect(convertStatus(TestStatus.Passed)).toBe('success')
    expect(convertStatus(TestStatus.Skipped)).toBe('neutral')
  })
})
