// P1 "모델 얼굴 생성" 킬스위치.
//
// false 인 동안: /tools/beauty-dna/ 완성 화면은 P0 그대로(텍스트 결과 + 제품 + 루틴),
//   "내 메이크업 모델 만들기" CTA 는 안 뜬다. 코드/엔드포인트는 이미 배포돼 있지만 과금 0.
//
// true 로 켜기 전 체크리스트:
//   1. `node scripts/gen-dna-portraits.mjs` 실행 → public/dna/base-*.webp 5장 커밋
//   2. Cloudflare 환경변수 확인: OPENAI_API_KEY(또는 CF_AIG_TOKEN+OPENAI_BASE_URL),
//      MAKEUP_USAGE(KV 바인딩), SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_URL
//      — makeup-edit.ts 와 동일한 값. dna-portrait 는 무료 카운터 키만 분리(mu:dna:).
//   3. 로그인 계정으로 무료 1회 → 크레딧 차감 경로(잔액 0 → 402) 실제 확인
//   4. 여기 true → 배포
export const DNA_PORTRAIT_ENABLED = false

/** 계정당 무료 생성 횟수 (셀카 메이크업과 별도 풀). 서버(dna-portrait.ts)와 동일해야 함. */
export const DNA_FREE_LIMIT = 1
