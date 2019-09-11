import envConfigMap from 'env-config-map'
import { compact, mapValues } from 'lodash'
import { isArray } from 'util'
import { PluginConfig } from '../types'

const GITHUB_API_URL = 'https://api.github.com'

export const extractPluginConf = (): PluginConfig =>
  mapValues(
    envConfigMap({
      PLUGIN_APP_ID: { type: 'number' },
      PLUGIN_PRIVATE_KEY: { type: 'string' },
      PLUGIN_REPORT_GLOB: { type: 'string', default: 'reports/**' },
      PLUGIN_HOST_URL: { type: 'string', default: GITHUB_API_URL },
      PLUGIN_PARSER: { type: 'string', default: 'pytestJson' }
    }).getRedacted(),
    e => (isArray(e) ? compact(e) : e)
  )
