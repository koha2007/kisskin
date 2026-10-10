import { CLASS_LESSONS } from '../../../src/lib/class/lessons'

export default async function onBeforePrerenderStart(): Promise<string[]> {
  return CLASS_LESSONS.map((l) => `/class/${l.slug}/`)
}
