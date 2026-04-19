import { MBTI_ORDER, MAKEUP_MBTI_TYPES } from '../../../../src/lib/makeup-mbti/types'

export default async function onBeforePrerenderStart(): Promise<string[]> {
  return MBTI_ORDER.map(code => `/tools/makeup-mbti/${MAKEUP_MBTI_TYPES[code].slug}/`)
}
