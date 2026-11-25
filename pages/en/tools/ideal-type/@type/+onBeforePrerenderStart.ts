import { IDEAL_ORDER } from '../../../../../src/lib/ideal-type/types'

export default async function onBeforePrerenderStart(): Promise<string[]> {
  return IDEAL_ORDER.map((c) => `/en/tools/ideal-type/${c}/`)
}
