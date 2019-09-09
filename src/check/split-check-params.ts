import * as Octokit from '@octokit/rest'
import { chunk, cloneDeepWith } from 'lodash'

export const MAX_ANNOTATIONS = 50

export const splitCheckParams = (
  check: Octokit.ChecksCreateParams
): Octokit.ChecksCreateParams[] => {
  if (check.output === undefined) return [check]
  if (
    check.output.annotations === undefined ||
    check.output.annotations.length < MAX_ANNOTATIONS
  ) {
    return [check]
  }

  return chunk(check.output.annotations, MAX_ANNOTATIONS).map(a =>
    cloneDeepWith(check, (_v, k) => (k === 'annotations' ? a : undefined))
  )
}
