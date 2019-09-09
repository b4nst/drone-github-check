import { App } from '@octokit/app'
import rest from '@octokit/rest'

import { DroneEnv, PluginConfig } from '../types'

const getInstalladtionId = async (
  app: App,
  baseUrl: string,
  owner: string,
  repo: string
) => {
  const octo = await new Octokit({
    auth: app.getSignedJsonWebToken(),
    baseUrl
  })

  const { data } = await octo.apps.getRepoInstallation({ owner, repo })
  return data.id
}

const createAuthClient = async (config: PluginConfig, drone: DroneEnv) => {
  const app = new App({
    id: config.PLUGIN_APP_ID,
    privateKey: config.PLUGIN_PRIVATE_KEY,
    baseUrl: config.PLUGIN_HOST_URL
  })

  const installationId = await getInstalladtionId(
    app,
    config.PLUGIN_HOST_URL,
    drone.DRONE_REPO_OWNER,
    drone.DRONE_REPO_NAME
  )

  return new Octokit({
    auth: await app.getInstallationAccessToken({ installationId }),
    baseUrl: config.PLUGIN_HOST_URL
  })
}

export const uploadChecks = async (
  checks: Octokit.ChecksCreateParams[],
  config: PluginConfig,
  drone: DroneEnv
) => {
  const octo = await createAuthClient(config, drone)

  const first = await octo.checks.create(checks.pop())
  return Promise.all(
    checks.map(async check =>
      octo.checks.update({ ...check, check_run_id: first.data.id })
    )
  )
}
