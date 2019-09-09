import { random } from '../test-helper'
import { mapValues } from 'lodash'
import { isArray } from 'util'
import { extractPluginConf } from '../../src/config/extract-plugin-conf'

describe('Extract drone env', () => {
  const env = Object.assign({}, process.env)

  afterEach(() => {
    process.env = env
  })

  it('should extract all drone values', () => {
    const conf = random.plugin_config()
    process.env = mapValues(conf, value =>
      isArray(value) ? value.join(',') : value.toString()
    )
    expect(extractPluginConf()).toStrictEqual(conf)
  })

  it('should set default host url to github.com', () => {
    const actual = extractPluginConf()
    expect(actual.PLUGIN_HOST_URL).toContain('github.com')
  })
})
