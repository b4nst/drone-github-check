import globPromise from 'glob-promise'

import { splitCheckParams } from './check/split-check-params'
import { uploadChecks } from './check/upload-checks'
import { extractDroneEnv, extractPluginConf } from './config'
import * as parsers from './parsers'
import { convertReport, reduceReports } from './report'
import { Parser } from './types'

async function main() {
  const config = extractPluginConf()
  const drone = extractDroneEnv()
  const parse: Parser | undefined = parsers[config.PLUGIN_PARSER + 'Parser']
  if (parse === undefined) {
    throw new Error(`${config.PLUGIN_PARSER} is not currently implemented`)
  }

  const files = await glob(config.PLUGIN_REPORT_GLOB)
  const reports = await Promise.all(files.map(async r => parse(r, {})))
  const check = convertReport(reduceReports(reports), drone)
  return uploadChecks(splitCheckParams(check), config, drone)
}

main()
  // tslint:disable-next-line: no-console
  .then(() => console.log('Done'))
  // tslint:disable-next-line: no-console
  .catch(console.error)
