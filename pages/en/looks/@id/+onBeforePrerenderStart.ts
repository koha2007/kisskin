import { MAKEUP_STYLES } from '../../../../src/lib/makeup/styles'

export default async function onBeforePrerenderStart(): Promise<string[]> {
  return MAKEUP_STYLES.map((s) => `/en/looks/${s.id}/`)
}
