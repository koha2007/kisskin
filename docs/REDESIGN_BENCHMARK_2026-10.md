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
