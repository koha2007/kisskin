// 메이크업 클래스 — 발행된 편(lessons.json) + 커리큘럼(curriculum.ts)을 합친 읽기 전용 뷰.
// lessons.json 은 scripts/gen-class.mjs 가 매주 한 편씩 덧붙인다(손으로 고쳐도 된다 — 순수 JSON).
// 단계(step) 모양은 9룩과 같은 HowToStep → 페이지·차트 크롭·제품 찾기 링크를 그대로 공유한다.
import type { HowToStep } from '../looks/howto'
import { CURRICULUM, type CurriculumItem } from './curriculum.ts'
import raw from './lessons.json' with { type: 'json' }

export interface ClassLessonBody {
  slug: string
  publishedAt: string
  introKo: string
  introEn: string
  minutes: number
  levelKo: '쉬움' | '보통' | '도전'
  levelEn: 'Easy' | 'Medium' | 'Bold'
  steps: HowToStep[]
  tipsKo: string[]
  tipsEn: string[]
  mistakeKo: string
  mistakeEn: string
  /** 페이스 차트 생성에 쓴 영문 묘사(재생성용 기록) */
  chartPrompt: string
  safetyKo?: string
  safetyEn?: string
}

export type ClassLesson = ClassLessonBody & CurriculumItem

const bodies = raw as unknown as ClassLessonBody[]

/** 발행된 편만, 커리큘럼 순서대로 */
export const CLASS_LESSONS: ClassLesson[] = CURRICULUM.flatMap((c) => {
  const b = bodies.find((x) => x.slug === c.slug)
  return b ? [{ ...c, ...b }] : []
})

export const lessonBySlug = (slug: string) => CLASS_LESSONS.find((l) => l.slug === slug)

export const isPublished = (slug: string) => CLASS_LESSONS.some((l) => l.slug === slug)

export const chartSrc = (slug: string) => `/class/charts/${slug}.webp`
