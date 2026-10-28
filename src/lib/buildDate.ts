// 빌드 시점 날짜 — vite.config.ts define(__BUILD_DATE__). 빌드마다 고정이라 SSR·클라이언트 값이 같다(hydration 안전).
declare global {
  const __BUILD_DATE__: string
}

const [y, m] = __BUILD_DATE__.split('-').map(Number)
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export const BUILD_DATE = __BUILD_DATE__
export const BUILD_MONTH_KO = `${y}년 ${m}월`
export const BUILD_MONTH_EN = `${MONTHS_EN[m - 1]} ${y}`
