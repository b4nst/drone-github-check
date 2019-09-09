import { random } from '../test-helper'
import { mapValues } from 'lodash'
import { isArray } from 'util'
import { extractDroneEnv } from '../../src/config/extract-drone-env'

describe('Extract drone env', () => {
  const env = Object.assign({}, process.env)

  afterEach(() => {
    process.env = env
  })

  it('should extract all drone values', () => {
    const drone = random.drone_env()
    process.env = mapValues(drone, value =>
      isArray(value) ? value.join(',') : value.toString()
    )
    expect(extractDroneEnv()).toStrictEqual(drone)
  })
})
