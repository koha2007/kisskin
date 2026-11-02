import { ALL_MAKEUP_STYLES } from '../../../src/lib/makeup/styles'

export default async function onBeforePrerenderStart(): Promise<string[]> {
  return ALL_MAKEUP_STYLES.map((s) => `/looks/${s.id}/`)
}
