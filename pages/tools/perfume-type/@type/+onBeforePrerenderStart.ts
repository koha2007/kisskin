import { PERFUME_TYPE_ORDER, PERFUME_TYPES } from '../../../../src/lib/perfume-type/types'

export default async function onBeforePrerenderStart(): Promise<string[]> {
  return PERFUME_TYPE_ORDER.map(c => `/tools/perfume-type/${PERFUME_TYPES[c].slug}/`)
}
