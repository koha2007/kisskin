import { REVIEW_POSTS } from '../../../src/lib/reviews/posts'

export default function onBeforePrerenderStart() {
  return REVIEW_POSTS.map((p) => `/reviews/${p.slug}/`)
}
