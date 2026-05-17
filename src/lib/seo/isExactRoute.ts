export function isExactRoute(urlPathname: string | undefined, target: string): boolean {
  if (!urlPathname) return false
  const norm = (s: string) => (s.endsWith('/') ? s : s + '/')
  return norm(urlPathname) === norm(target)
}
