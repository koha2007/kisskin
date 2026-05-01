import { BLOG_POSTS } from '../../../src/lib/blog/posts'

export default function onBeforePrerenderStart() {
  return BLOG_POSTS.map((p) => `/blog/${p.slug}/`)
}
