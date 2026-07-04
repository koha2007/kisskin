// 경량 기기 지문 (FREE_PIVOT_PLAN P1-5 결정 ④: FingerprintJS 선투자 금지).
// localStorage UUID(주) + 브라우저 속성 해시. 서버는 이 값 + IP 로 무료 1회를 판정.
// 완벽 방지용이 아니라 합리적 무료-남용 억제용(IP 가 서버측 백스톱).

const KEY = 'kisskin_fp_id'

function stableId(): string {
  try {
    let id = localStorage.getItem(KEY)
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID()) || `${Date.now()}-${Math.floor(Math.random() * 1e9)}`
      localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return 'no-storage'
  }
}

export async function deviceFingerprint(): Promise<string> {
  const parts = [
    stableId(),
    navigator.userAgent,
    navigator.language,
    `${screen.width}x${screen.height}x${window.devicePixelRatio || 1}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join('|')
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(parts))
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32)
  } catch {
    return stableId()
  }
}
