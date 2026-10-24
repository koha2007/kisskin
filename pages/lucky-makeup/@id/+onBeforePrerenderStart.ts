import { FORTUNE_LOOKS } from '../../../src/lib/fortune/looks'

export default async function onBeforePrerenderStart(): Promise<string[]> {
  return FORTUNE_LOOKS.map((l) => `/lucky-makeup/${l.id}/`)
}
