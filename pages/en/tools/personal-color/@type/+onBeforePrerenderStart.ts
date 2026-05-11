import { SEASON_ORDER, PERSONAL_COLOR_TYPES } from '../../../../../src/lib/personal-color/types'

export default async function onBeforePrerenderStart(): Promise<string[]> {
  return SEASON_ORDER.map(c => `/en/tools/personal-color/${PERSONAL_COLOR_TYPES[c].slug}/`)
}
