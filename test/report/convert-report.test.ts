import { random } from '../test-helper'
import { Report, TestStatus } from '../../src/types'
import { convertReport } from '../../src/report/convert-report'

describe('Convert report', () => {
  const droneEnv = random.drone_env()

  test('should convert a report that passed', () => {
    const r: Report = random.report()

    expect(convertReport(r, droneEnv)).toStrictEqual({
      owner: droneEnv.DRONE_REPO_OWNER,
      repo: droneEnv.DRONE_REPO_NAME,
      head_sha: droneEnv.DRONE_COMMIT_SHA,
      name: droneEnv.DRONE_SYSTEM_HOST,
      details_url: `${droneEnv.DRONE_SYSTEM_PROTO}://${droneEnv.DRONE_SYSTEM_HOSTNAME}`,
      status: 'completed',
      conclusion: 'success',
      started_at: new Date(droneEnv.DRONE_BUILD_STARTED).toISOString(),
      output: {
        title: `${droneEnv.DRONE_SYSTEM_HOST} report`,
        summary: `# Report of [build #${droneEnv.DRONE_BUILD_NUMBER}](${droneEnv.DRONE_SYSTEM_PROTO}://${droneEnv.DRONE_SYSTEM_HOST}/${droneEnv.DRONE_REPO}/${droneEnv.DRONE_BUILD_NUMBER})`,
        annotations: [],
        text: expect.stringContaining('Build done with success')
      }
    })
  })

  test('should convert a report that failed', () => {
    const r: Report = random.report({
      status: TestStatus.Failed,
      summary: {
        total: 2,
        passed: 1,
        failed: 1
      },
      tests: [
        {
          name: 'test 1',
          status: TestStatus.Passed,
          duration: 1,
          line: 1,
          crashReport: []
        },
        {
          name: 'test 2',
          status: TestStatus.Passed,
          duration: 1,
          line: 2,
          crashReport: [
            {
              path: 'path/to/file',
              lstart: 3,
              lend: 7,
              msg: 'Test 1 failed'
            }
          ]
        }
      ]
    })

    expect(convertReport(r, droneEnv)).toStrictEqual({
      owner: droneEnv.DRONE_REPO_OWNER,
      repo: droneEnv.DRONE_REPO_NAME,
      head_sha: droneEnv.DRONE_COMMIT_SHA,
      name: droneEnv.DRONE_SYSTEM_HOST,
      details_url: `${droneEnv.DRONE_SYSTEM_PROTO}://${droneEnv.DRONE_SYSTEM_HOSTNAME}`,
      status: 'completed',
      conclusion: 'failure',
      started_at: new Date(droneEnv.DRONE_BUILD_STARTED).toISOString(),
      output: {
        title: `${droneEnv.DRONE_SYSTEM_HOST} report`,
        summary: `# Report of [build #${droneEnv.DRONE_BUILD_NUMBER}](${droneEnv.DRONE_SYSTEM_PROTO}://${droneEnv.DRONE_SYSTEM_HOST}/${droneEnv.DRONE_REPO}/${droneEnv.DRONE_BUILD_NUMBER})`,
        annotations: [
          {
            path: 'path/to/file',
            start_line: 3,
            end_line: 7,
            annotation_level: 'failure',
            message: 'Test 1 failed',
            title: 'test 2'
          }
        ],
        text: expect.stringContaining('Build done with failure')
      }
    })
  })

  test('should add test env to details', () => {
    const environment = { foo: 'foo', bar: { baz: 'baz' } }
    const r: Report = random.report({ environment })

    const actual = convertReport(r, droneEnv)

    expect(actual.output).toStrictEqual(
      expect.objectContaining({
        text: expect.stringContaining(JSON.stringify(environment, null, 2))
      })
    )
  })
})
