// 주간 자동 발행 공용 — "이번 주 몫이 이미 나갔나" 판정과 EN 누락분 찾기.
//
// 2026-10-13 재설계 배경: 화요일 1회 실행에 모든 걸 걸어 두니 Gemini 503 한 번에
// 뉴스 EN·클래스 편이 빠졌고, 다음 기회는 일주일 뒤였다. 지금은 화·수·목 3번 돌린다.
// 그래서 각 생성기는 **같은 주에 두 번 발행하지 않아야** 하고(WEEKLY_GUARD=1),
// 빠진 EN 번역은 다음 실행이 알아서 메운다(missingEn).
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

// 발행 날짜는 KST 기준. (예전 뉴스·제품은 UTC 날짜를 찍어서 월 21:00 UTC 실행이면 '월요일'자가 됐다)
export const todayKst = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10)

/** 이번 주 화요일(KST, 발행 요일) YYYY-MM-DD */
export function thisTuesdayKst() {
  const t = todayKst()
  const dow = new Date(`${t}T00:00:00Z`).getUTCDay() // 0=일 … 2=화
  return new Date(Date.parse(`${t}T00:00:00Z`) - ((dow - 2 + 7) % 7) * 86400000).toISOString().slice(0, 10)
}

/** WEEKLY_GUARD=1 일 때만 판정. 이번 주에 이미 나갔으면 그 날짜를, 아니면 null. */
export function alreadyThisWeek(dates) {
  if (process.env.WEEKLY_GUARD !== '1') return null
  // 화요일 이전(일·월)에 수동으로 나간 건 지난주 몫이다. 날짜가 UTC 로 하루 당겨 찍힌 옛 데이터도
  // 있으므로(월요일자) 화요일 하루 전까지는 이번 주 것으로 본다.
  const from = new Date(Date.parse(`${thisTuesdayKst()}T00:00:00Z`) - 86400000).toISOString().slice(0, 10)
  const last = dates.filter(Boolean).sort().pop()
  return last && last >= from ? last : null
}

/**
 * KO 는 있는데 EN 이 없는 항목(최근 days 일, 최신순 → 최대 max 건).
 * 번역이 한 번 실패하면 예전엔 영원히 KO 만 남았다(2026-10 기준 뉴스 35건·제품 4건).
 */
export async function missingEn(dir, exportName, { days = 60, max = 2 } = {}) {
  const mod = await import(pathToFileURL(resolve(`src/lib/${dir}/items.ts`)).href)
  const en = readFileSync(resolve(`src/lib/${dir}/enSlugs.ts`), 'utf8')
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
  return mod[exportName]
    .filter((it) => it.date >= since && !en.includes(`'${it.slug}'`))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, max)
}
