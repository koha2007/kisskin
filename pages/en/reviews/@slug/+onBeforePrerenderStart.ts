import { REVIEW_POSTS_EN } from '../../../../src/lib/reviews/posts.en'

export default function onBeforePrerenderStart() {
  return REVIEW_POSTS_EN.map((p) => `/en/reviews/${p.slug}/`)
}
