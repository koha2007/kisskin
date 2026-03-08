export async function onRequest(context: { request: Request; next: () => Promise<Response> }) {
  const url = new URL(context.request.url)

  // kisskin.pages.dev → kissinskin.net 리다이렉트
  if (url.hostname === 'kisskin.pages.dev') {
    url.hostname = 'kissinskin.net'
    return Response.redirect(url.toString(), 301)
  }

  return context.next()
}
