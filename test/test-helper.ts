import { Report, TestStatus, DroneEnv, PluginConfig } from '../src/types'
import * as Octokit from '@octokit/rest'
import chance from 'chance'

class Random extends chance.Chance {
  public report(opt?: Partial<Report>): Report {
    return Object.assign(
      {
        duration: this.floating({ min: 0, max: 10000 }),
        status: TestStatus.Passed,
        created: this.integer({ min: 1, max: Date.now() }),
        summary: {
          total: 1,
          passed: 1
        },
        tests: [
          {
            name: this.word(),
            status: TestStatus.Passed,
            duration: this.floating({ min: 0, max: 10000 }),
            line: this.integer({ min: 1, max: 500 }),
            crashReport: []
          }
        ]
      },
      opt
    )
  }

  public drone_env(opt?: Partial<DroneEnv>): DroneEnv {
    const branch = this.word()
    const commitSha = this.hash()
    const owner = this.first()
    const repo = this.word()
    const created = this.integer({ min: 1, max: Date.now() - 10 })
    const finished = this.integer({ min: created + 5, max: Date.now() })
    const status = this.pickone(['success', 'failure'])
    const repoUrl = `https://github.com/${owner}/${repo}`
    const isPrivate = this.bool()
    const major = this.integer({ min: 0, max: 10 })
    const minor = this.integer({ min: 0, max: 50 })
    const patch = this.integer({ min: 0, max: 100 })
    const prerelease = `${this.pickone(['alpha', 'beta'])}.${this.integer({
      min: 0,
      max: 20
    })}`
    const domain = this.domain()

    return Object.assign(
      {
        CI: true,
        DRONE: true,
        DRONE_BRANCH: branch,
        DRONE_BUILD_ACTION: this.pickone(['sync', 'open']),
        DRONE_BUILD_CREATED: created,
        DRONE_BUILD_EVENT: this.pickone([
          'push',
          'pull_request',
          'promote',
          'rollback',
          'tag'
        ]),
        DRONE_BUILD_FINISHED: finished,
        DRONE_BUILD_NUMBER: this.integer({ min: 0, max: 500 }),
        DRONE_BUILD_PARENT: this.integer({ min: 0, max: 500 }),
        DRONE_BUILD_STARTED: created + 1,
        DRONE_BUILD_STATUS: status,
        DRONE_COMMIT: commitSha,
        DRONE_COMMIT_AFTER: this.hash(),
        DRONE_COMMIT_AUTHOR: owner,
        DRONE_COMMIT_AUTHOR_AVATAR: this.url({
          domain: 'github.com',
          extensions: ['gif', 'jpg', 'png']
        }),
        DRONE_COMMIT_AUTHOR_EMAIL: this.email(),
        DRONE_COMMIT_AUTHOR_NAME: `${owner} ${this.last()}`,
        DRONE_COMMIT_BEFORE: this.hash(),
        DRONE_COMMIT_BRANCH: branch,
        DRONE_COMMIT_LINK: `${repoUrl}/commit/${commitSha}`,
        DRONE_COMMIT_MESSAGE: this.sentence({ words: 5 }),
        DRONE_COMMIT_REF: `refs/heads/${branch}`,
        DRONE_COMMIT_SHA: commitSha,
        DRONE_DEPLOY_TO: this.pickone(['production', 'staging', 'val']),
        DRONE_FAILED_STAGES: status === 'failed' ? this.n(this.word, 3) : [],
        DRONE_FAILED_STEPS: status === 'failed' ? this.n(this.word, 3) : [],
        DRONE_GIT_HTTP_URL: `${repoUrl}.git`,
        DRONE_GIT_SSH_URL: `git@github.com/${owner}/${repo}`,
        DRONE_PULL_REQUEST: this.integer({ min: 1, max: 500 }),
        DRONE_REPO: `${owner}/${repo}`,
        DRONE_REPO_BRANCH: branch,
        DRONE_REPO_LINK: repoUrl,
        DRONE_REPO_NAME: repo,
        DRONE_REPO_NAMESPACE: owner,
        DRONE_REPO_OWNER: owner,
        DRONE_REPO_PRIVATE: isPrivate,
        DRONE_REPO_SCM: 'git',
        DRONE_REPO_VISIBILITY: isPrivate
          ? this.pickone(['private', 'internal'])
          : 'public',
        DRONE_SEMVER: `${major}.${minor}.${patch}-${prerelease}`,
        DRONE_SEMVER_BUILD: prerelease,
        DRONE_SEMVER_ERROR: '',
        DRONE_SEMVER_MAJOR: major,
        DRONE_SEMVER_MINOR: minor,
        DRONE_SEMVER_PATCH: patch,
        DRONE_SEMVER_PRERELEASE: prerelease,
        DRONE_SEMVER_SHORT: `${major}.${minor}.${patch}`,
        DRONE_SOURCE_BRANCH: branch,
        DRONE_STAGE_ARCH: this.pickone(['386', 'amd64', 'arm64', 'arm']),
        DRONE_STAGE_DEPENDS_ON: this.n(
          this.word,
          this.integer({ min: 0, max: 3 })
        ),
        DRONE_STAGE_FINISHED: finished,
        DRONE_STAGE_KIND: 'pipeline',
        DRONE_STAGE_MACHINE: this.string({ length: 10 }),
        DRONE_STAGE_NAME: this.word(),
        DRONE_STAGE_NUMBER: this.integer({ min: 0, max: 12 }),
        DRONE_STAGE_OS: this.pickone([
          'darwin',
          'dragonfly',
          'freebsd',
          'linux',
          'netbsd',
          'openbsd',
          'solaris',
          'windows'
        ]),
        DRONE_STAGE_STARTED: created + 2,
        DRONE_STAGE_STATUS: status,
        DRONE_STAGE_TYPE: 'docker',
        DRONE_STAGE_VARIANT: '',
        DRONE_STEP_NAME: this.word(),
        DRONE_STEP_NUMBER: this.integer({ min: 1, max: 10 }),
        DRONE_SYSTEM_HOST: domain,
        DRONE_SYSTEM_HOSTNAME: domain,
        DRONE_SYSTEM_PROTO: 'https',
        DRONE_SYSTEM_VERSION: `${major}.${minor}.${patch}`,
        DRONE_TAG: 'v1.0.0',
        DRONE_TARGET_BRANCH: branch
      },
      opt
    )
  }

  public checks_create_params(
    opt = { annotations: 0 }
  ): Octokit.ChecksCreateParams {
    return {
      owner: this.first(),
      repo: this.word(),
      head_sha: this.hash(),
      name: this.word(),
      output: {
        title: this.sentence({ words: 3 }),
        summary: this.sentence(),
        annotations: this.n(
          () => ({
            path: this.n(this.word, 3).join('/'),
            start_line: this.integer({ min: 0, max: 5 }),
            end_line: this.integer({ min: 5, max: 10 }),
            annotation_level: this.pickone(['notice', 'warning', 'failure']),
            message: this.sentence()
          }),
          opt.annotations
        )
      }
    }
  }

  public plugin_config(opt?: Partial<PluginConfig>): PluginConfig {
    return Object.assign(
      {
        PLUGIN_APP_ID: random.integer(),
        PLUGIN_PRIVATE_KEY: random.hash(),
        PLUGIN_HOST_URL: random.url()
      },
      opt
    )
  }
}

export const random = new Random('JaMJgHpuEqPURYrh/q5ZaA==') // Use a seed for repeatable tests
