import { FACE_SHAPE_ORDER, FACE_SHAPE_TYPES } from '../../../../../src/lib/face-shape/types'

export default async function onBeforePrerenderStart(): Promise<string[]> {
  return FACE_SHAPE_ORDER.map(c => `/en/tools/face-shape/${FACE_SHAPE_TYPES[c].slug}/`)
}
