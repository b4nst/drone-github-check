import {
  MAX_ANNOTATIONS,
  splitCheckParams
} from '../../src/check/split-check-params'
import { random } from '../test-helper'

describe('Split check params', () => {
  it('should split following MAX_ANNOTATIONS', () => {
    const check = random.checks_create_params({
      annotations: MAX_ANNOTATIONS + 1
    })
    const split = splitCheckParams(check)
    expect(split.length).toBe(2)
    expect((split[0] as any).output.annotations.length).toBe(MAX_ANNOTATIONS)
    expect((split[1] as any).output.annotations.length).toBe(1)
  })
})
