# 사이트 대개편 준비 — 글로벌 벤치마크 (2026-10-17 조사)

> 운영자 10/17: "조금 기다려서 자료를 수집해 보고, 그래도 차이가 안 나오면 사이트 디자인 레이아웃을
> 대개편으로 완전 다 바꿔보자. 그전에 먼저 성공한 글로벌 기업들 벤치마킹 및 서치."
>
> 착수 조건: **~11/1 재측정**(Supabase 실가입·makeup_look, GA4 참여 세션)에서 10/17 로그인 관문 수정 효과가
> 안 보이면 착수. 로드맵 위치 = **1단계(콘텐츠·도구로 사람 모으기)** 안의 전환 개선.
> 캡처 원본: `casting/benchmark-2026-10-17/` (git 밖, `pc-ai.jpg`·`pc-brand.jpg` = 한눈 비교).

## 0. 먼저 우리 숫자 — 대개편이 겨냥해야 할 곳

| 사실 (출처) | 뜻 |
|---|---|
| 진입 상위: 홈 196 · 얼굴형 195 · /analysis/ 158 · 퍼스널컬러 KO 106 + EN 99 (Clarity 30일, 10/17) | **홈은 입구 4~5개 중 하나일 뿐.** 도구 랜딩을 같이 안 바꾸면 방문자 대부분은 개편을 못 본다 |
| 홈 스크롤: 45% 지점 도달 PC 9%·모바일 10% (Clarity 열 지도, ~10/12) | 첫 화면에서 승부가 난다. 아래 섹션 10개는 거의 안 읽힌다 |
| 홈 길이 9,875px(PC 실측) ↔ Glossier 4,063 · Fenty 5,705 · Rhode 6,116 · Remini 10,028 | 우리는 AI 도구 쪽(Remini) 길이, 브랜드들은 절반 |
| 룩 고른 49 → 생성 9 (GA4 30일) · 실가입 11→7 (Supabase, 10/9 전후 9일) | 병목은 "보러 왔다 → 내 얼굴로 해 본다" 구간 |

## 1. 실제 사이트 분석 (10/17 Playwright 캡처 · 1440px/390px)

### ① Remini — AI 사진 도구, 우리와 구조가 가장 같다 ⭐
- **첫 화면 = 움직이는 데모.** H1 80px(모바일 40px) "The only photo and video enhancer you'll ever need" 바로 아래에
  큰 비포/애프터 위젯 + 오른쪽에 기능 토글(Face Enhance·Color 등) + 아래 샘플 사진 3장(인물·풍경·옛 사진) 선택.
  설명 대신 **눌러 보게** 한다.
- 다크 배경 + 보라 포인트 1색. 섹션마다 한 문장 큰 제목(56~80px) + 사진.
- **"Used by millions" 숫자 3개(100M·15M·5B) + 별점 후기 9칸** → 끝에 "Try Remini now!" 한 번 더.
- 버튼 문구는 처음부터 끝까지 하나: "Try Remini".
- → 우리: 히어로 비포/애프터 + 9룩 썸네일은 이미 같은 형태. 다른 점은 **크기와 집중** — Remini 는 데모가 첫 화면의
  60% 이상이고 버튼이 하나다. 우리 첫 화면엔 버튼이 5개(무료 진단·예시 보기·셀카 올리기·$4.99·첫 1회 무료)다.

### ② Photoroom — AI 도구, 밝은 버전
- H1 72px "Sell at first sight" + 버튼 2개(Start creating / Contact sales)만. 바로 아래 **고객 로고 띠**.
- 사용 사례를 탭으로 묶어 한 섹션에서 보여 준다(길게 늘이지 않음).
- → 우리: 4가지 진단·메이크업·클래스를 섹션 4개로 나열하지 말고 **탭 하나로 묶기** 후보.

### ③ Rhode — 브랜드, 극단적 타이포
- H1 **176px**(모바일 86px) "Edited, efficacious, intentional." 한 문장. 제품을 조각처럼 크게, 배경은 거의 흰색.
- 중간에 **"you + rhode"** — 실제 사용자 사진 슬라이드.
- → 우리: "메이크업도 아트다"를 이 크기로 쓸 수 있는 구조. 브랜드 비전과 맞는 쪽.

### ④ Fenty Beauty — 실제 고객 얼굴
- 상단 탭에 **"Ask AI"**. 제품 그리드 사이에 **"WE WANNA SEE YOUR FENTY FACE — 사진 올리고 #FENTYBEAUTY"**.
- 파운데이션 섹션은 "Find your shade" 진단으로 바로 연결.
- → 우리: 진단 → 결과 → 상품이 한 줄로 이어지는 모양 = 퍼스널컬러 → 룩 → 추천 제품.

### ⑤ Pat McGrath Labs — 아티스트 브랜드
- 검정 바탕 에디토리얼. 베스트셀러 사이에 **아티스트 본인 한 마디 인용**("I always sketch with pencil before I build the look…")
  + "Pat McGrath & Her Iconic Artistry" 섹션.
- → 우리 비전("아티스트가 주인공")의 교본. 3단계(아티스트) 일이지만 **레이아웃 자리**는 지금 만들어 둘 수 있다.

### ⑥ Glossier — 짧은 홈
- 홈 4,063px. 할인 배너 → 베스트셀러 4개 → GET THE LOOK → 끝. 폰트 1종(Apercu), 굵기 400 만.

### ⑦ TIRTIR (K-뷰티 글로벌) — 장난감 같은 첫 화면
- 첫 방문에 "Mirror, mirror. Look away. — **Hold to sneak**" 팝업: 꾹 누르면 쿠션 뚜껑이 열리며 쿠폰.
  상단 메뉴에 **VIRTUAL SERVICES**(가상 체험)를 따로 둔다.

### ✖ 따라 하지 말 것
- **Olive Young Global**: 첫 화면 팝업(설문) + 딜 카운트다운 + 상품 그리드 6줄. 매장형 큐레이션은 4단계 일이고,
  지금 우리 규모에선 정보 과다.
- **YouCam(Perfect Corp)**: 15,169px 기능 나열(13개 기능을 하나씩). 직접 경쟁사지만 앱 다운로드 페이지라 우리 목적과 다르다.
- 9곳 중 7곳이 모바일 첫 화면을 쿠키 팝업이 덮었다 — 우리 하단 띠 방식이 더 낫다(유지).
- 캡처 실패: Aesop(봇 확인 화면), Sephora(접근 거부), Lensa(페이지 없음 — prisma-ai.com/lensa 404).

## 2. 숫자로 확인된 것 (출처 대부분 업체 자료 — 방향만 참고)

| 장치 | 결과 | 출처 |
|---|---|---|
| 가상 체험(립스틱 파인더 + VTO) | Maybelline 인도 전환율 +63%, 신규 고객 +40% (2024-25) | Amazon Ads 사례 |
| 가상 체험 | Avon 체험 사용자 전환 +320% · AOV +33% (업체 주장) | Perfect Corp |
| 진단(퀴즈) 퍼널 | 뷰티 퀴즈 → 구매 10~20%대 vs 카테고리 페이지 2~3% · Jones Road 퀴즈 20% · 플랫폼 뷰티 평균 6.1% | Octane AI · RevenueHunt |
| 실사용자 사진 갤러리 | 중앙값 +18%(뷰티 +26%, 500+ 브랜드) · Iconic London +126% | Idukki · Bazaarvoice |
| 홈페이지 인터랙티브 데모 | 웹사이트 전환 +20~25%(고객사 자체 귀속) · 짧은 데모일수록 완료·전환 ↑ | Navattic |
| 가입 미루기 | 가입을 나중에 해도 되는 앱 유지 +28%(2차 인용, 원문 미확인) | Rownd(Localytics 인용) |

## 3. kissinskin 에 매치한 개편 방향 (추천 순서)

1. **첫 화면 = Remini 식 "눌러 보는 데모" 하나 + 버튼 하나.** 지금 슬라이더+9룩을 화면의 60% 이상으로 키우고,
   버튼 5개 → 1개("내 얼굴로 해 보기"). $4.99·무료 진단은 두 번째 화면으로.
2. **도구 랜딩 4개를 같은 틀로.** 진입의 75%가 홈 밖이다. 얼굴형·퍼스널컬러 랜딩 첫 화면도 "진단 시작" 하나 +
   결과 예시 카드(오늘 만든 미술 포스터 카드)를 크게.
3. **진단 → 룩 → 제품 한 줄 (Fenty·퀴즈 퍼널).** 퀴즈 결과 페이지가 전환 페이지다 — 10/17 히어로 CTA 연결의 확장.
4. **실제 사람 섹션 자리 (Rhode "you + rhode", Fenty "your Fenty face").** 처음엔 운영자 본인 얼굴 + 무료 9룩 대가로
   허락받은 사람만. 18+·축소본·워터마크·검색 비노출(10/17 성장 점검의 안전 조건). = 2단계(커뮤니티)의 씨앗.
5. **브랜드 한 문장을 크게 (Rhode 176px · Pat McGrath 인용).** "메이크업도 아트다" — 비전 통과 장치.
6. **홈 길이 절반으로.** 9,875px → 5,000px 안쪽. 뉴스·제품·클래스는 탭 한 칸(Photoroom 방식)으로.

착수 시 원칙(운영자 7/21 "과감하게"): 부분 수정 말고 **홈 + 도구 랜딩 4 + /analysis/ 를 한 묶음**으로,
렌더 스크린샷(PC·모바일)으로 확인. 개편 전후 비교 지표 = 첫 화면 이탈(Clarity 빠른 뒤로), 룩 선택 → 생성, 실가입.

## 출처
- https://advertising.amazon.com/library/case-studies/maybelline-lipstick-finder-virtual-try-on
- https://www.perfectcorp.com/business/successstory/Avon-Sees-Boost-in-Conversion-Perfect-Corp-Virtual-Try-On
- https://www.octaneai.com/blog/jones-road-beauty-quiz-strategy · https://revenuehunt.com/anti-aging-beauty-brand-quiz-funnel-case-study/
- https://idukki.io/blog/ugc-conversion-rate-boost · https://www.bazaarvoice.com/success-stories/iconic-london/
- https://www.navattic.com/customer/highlights · https://www.navattic.com/blog/increase-conversions-for-interactive-demos
- https://rownd.io/blog/why-you-should-delay-authentication-onboarding-in-your-app
- 사이트 캡처: remini.ai · photoroom.com · rhodeskin.com · fentybeauty.com · patmcgrath.com · glossier.com · tirtir.global · global.oliveyoung.com · perfectcorp.com

## 4. 1차 착수 기록 (2026-10-18, 운영자 "지금 바로 시작")

**데이터 재점검:** GA4 직접 접근 불가(API 키 없음·크롬 확장 미연결) → 10/17 GA4·Clarity 30일 스냅샷 + Supabase 직접 조회.
Supabase: Auth 57, 10/17 이후 신규 가입 0 → "룩 고름 49 → 생성 9" 누수 결론 그대로.
**추가 벤치마크(10/18 캡처):** Lensa(첫 화면 = 가운데 큰 제목 → START NOW 하나 → 별점·다운로드 한 줄 → 결과 사진 띠),
Remini 재확인(H1 80px·버튼 "Try Remini" 하나), Rhode(H1 176px). 화해·Sephora 는 팝업·접근 거부로 비교 제외.

| 바꾼 것 | 근거 |
|---|---|
| 히어로 버튼 5개 → 주 버튼 1개("내 얼굴로 무료 체험") + 글자 링크 1줄(무료 진단) | Clarity 45% 지점 도달 9~10%, Remini·Lensa |
| 슬라이더 크게 + 룩 고르기 = 동그라미 9개(고르면 버튼이 그 룩으로 이동) | 룩 고름→생성 누수, 데모 직접 만지기(Navattic) |
| 히어로 이미지 경량본(600px·192px) — 9룩 썸네일만 1MB → ~100KB | 모바일 75% |
| 페이스 차트 3×3 → "메이크업도 아트다" 초대형 제목 + 가로 띠 | 브랜드 비전, Rhode |
| 무료 진단: 혜택 띠+대형 카드+하위 제목+4카드+슬림 카드 → 제목 1 + 4카드(퍼스널컬러·얼굴형 먼저, 모바일 2열) + 맞춤 결과 띠 1줄 | 진입 2·3위가 얼굴형·퍼스널컬러 |
| 클래스·신제품·뉴스 섹션 3개 → 탭 하나(세 패널 모두 DOM 유지) | Photoroom, 홈 하단 거의 안 읽힘 |
| 홈 길이 PC 9,875 → 6,798px · 모바일 12,636 → 7,932px | |

**일부러 안 바꾼 것:** /analysis/ "로그인 필수" 안내(7/13 의도적 결정 + 10/17 관문 수정 측정 중) · 도구 랜딩 4종
(첫 화면에 1번 문항이 바로 보이는 퀴즈형 = 이미 벤치마크 방향, tool_complete 147 로 가장 잘 도는 구간).

**측정(2~3주 뒤):** GA4 `select_promotion` creative_slot = `home_hero_primary` / `home_hero_quiz` / `home_hero_look`,
`home_explore_tab`, 그리고 style_selected → free_trial_used. 9/13 에 주 버튼을 무료 진단으로 바꿨던 이유(업로드 89% 이탈)가
되살아나는지 확인 — 나쁘면 주 버튼을 무료 진단으로 되돌린다.

## 5. 2차 (2026-10-18)
- **실제 사람 섹션**(히어로 바로 아래, 네이비 띠): 운영자 koha 본인 셀카(홈의 모자 쓴 남성 = 운영자, 10/18 확인) 비포/애프터 +
  "만든 사람이 먼저 자기 얼굴로 해 봤어요". Rhode "you + rhode"·Fenty 자리. GA4 `select_promotion` creative_slot=`home_real_person`.
  다른 사람 사진은 본인 동의·18+·축소본 조건(10/17 성장 점검)으로만 추가.
- **/analysis/ 업로드 화면**: "이런 셀카면 → 이렇게" 예시 한 줄(9룩 모델 비포→볼드 립). 검색으로 곧장 오는 사람이 결과를 한 장도
  못 본 채 업로드를 요구받던 문제. 셀카 가이드("모자 없이")와 맞추려고 여기엔 모자 쓴 운영자 사진 대신 정면 모델을 썼다.
- 도구 랜딩 4종은 이미 1번 문항 즉시 노출 + 유형 미리보기 카드 구조라 손대지 않음.
- (같은 날 추가) 실제 사람 섹션 아래 **"같은 사람, 셀카 한 장으로 — 9룩 중 8장"** 띠: 운영자가 준 9룩 컬렉션 낱장 9장
  (`casting/originals/1-002~010.jpg` → `scripts/crop-real-person.mjs` → `public/real/koha-*.webp`, 라벨 띠는 넘기던 중 캡처돼
  다음 카드 글자가 비쳐서 잘라 냄). 룩을 누르면 `/analysis/?style=` (슬롯 `home_real_look`).
