# AI 이상형 테스트 기획안 (2026-11-24 초안)

> 상태: **11/25 결정 1~4 확정(0절) — 다음은 샘플 1~2장, 아직 개발·이미지 생성 0** · 11/25 문서 정리(본문을 0절 기준으로 맞춤, 바뀐 곳은 맨 아래 "정리 기록")
> 로드맵 위치: 매장 5계단 중 **1단계(방문 늘리기)** 용 콘텐츠. 결제 상품은 2차.
> 브랜드 기준: "미술 × 메이크업" — 결과 카드는 사진이 아니라 **미술 포스터·패션 일러스트**로.

---

## 0. 11/24 대화로 정리된 구조 (최신 — 아래 본문과 다르면 이것이 우선)
- 이름 통일: "커플 포스터" = **"이상형 옆에 선 나"** (같은 기능)
- 무료 / 맛보기 / 유료 기준: **내 셀카가 들어가고 AI가 새로 그리면 유료(첫 1장은 맛보기 무료), 나머지는 무료.** 테스트 결과는 잠그지 않음.

| | 무료 이상형 카드 | 맛보기 1장 | 유료 |
|---|---|---|---|
| 이상형 얼굴·패션·배경 | ✅ 들어감 — **미리 만든 그림 64장 중** 유형×성별×데이트 장소(Q1)로 1장 | ✅ AI가 새로 생성 | ✅ AI가 새로 생성 (4장 세트 = 카페·바다·눈길·전시장) |
| 내 얼굴(셀카) | ❌ | ✅ 이상형 옆에 나, 데이트 메이크업 | ✅ |
| AI 한 줄 문장 | ✅ (작은 텍스트 모델, 1명당 약 0.1원) | ✅ | ✅ |
| 화질 | 고화질 | 저화질 + 워터마크 | 고화질·큰 워터마크 없음 — **작은 "AI 생성" 표시는 유지**(AI 기본법, 11/25 서치) |
| 가입 / 가격 | 불필요 / 0 | 불필요 / 0 (하루 1장) | 필요 / 1장 1크레딧, 4장 4크레딧 (기존 5·9·15개 팩) |

- 무료 카드 구성(위→아래): ① 이상형 전신 그림(인물+배경을 한 장으로 생성, 합성 X) ② 유형 이름 ③ AI 한 줄 ④ 키워드(얼굴·패션, Co-Star식 문장 조각) ⑤ 내 답 배지 ⑥ 로고·주소·AI 표시 → 브라우저에서 9:16·4:5 한 장으로 그림(기존 카드 저장 재사용)
- 그림 묶음: 1차 **64장**(8유형 × 남·여 × 장소 4, 약 $3~11) / 확장 256장(+옷장 색 4)
- "상관없음" 선택 시 남·여 두 장 나란히 → 마음에 드는 쪽 저장
- 새 무료권·새 상품은 만들지 않음. 결과의 "이 사람 만나는 날 내 메이크업"은 기존 메이크업 무료권으로 연결
- 셀카 없이 "이상형만 AI로 새로 그리기"(유료) = 추천은 1차에서 뺌 — **미정**

### ✅ 11/25 결정 — "글로벌 성공 사례와 비슷하게" (운영자 지시)
| # | 결정 | 근거가 된 사례 |
|---|---|---|
| 1 | **방향 확정**: 무료 = 미리 만든 그림 + AI 한 줄 / 내 셀카 AI = 맛보기 1장 무료 → 크레딧. **구독은 만들지 않고 기존 크레딧 팩**만 | Snapchat Dreams(첫 8장 무료 → 팩 $0.99) · Epik(팩 유료) · 16P(테스트 무료). 커플 사진 앱들은 주간 구독 $1~10이 많지만 Remini식 자동결제 불만이 있어 우리는 팩만 |
| 1-1 | 1차 범위 = 무료 퀴즈·카드 + 맛보기 1장 + 1장 1크레딧. **4장 세트·AI 월드컵은 2차** | 16P·Wrapped 모두 무료 핵심부터 키우고 상품은 나중에 붙임 |
| 2 | 유형 = **동물상 8종**, 화풍 = **우리 미술 포스터풍으로 통일한 고정 캐릭터 세트**, 성별 = **남·여·상관없음** | 16P(16유형 고정 캐릭터 + 4그룹 색) · Spotify Me in 2023(12 캐릭터 세트) · 틱톡 골든 리트리버/블랙 캣 · Tinder(Men·Women·Everyone) |
| 3 | 그림 **64장**(유형 × 성별 × Q1 장소) — 샘플 먼저 | Spotify Audio Aura: "내 답이 그림에 보이는" 조합이 공유를 만듦. 비용 $3~11로 작음 |
| 4 | "이상형만 AI로 새로 그리기" = **1차에서 뺌** | 주류 성공작(Snapchat·Epik·Lensa)은 모두 셀카 기반. 글만으로 이성 이미지를 만드는 앱은 성인물 쪽으로 쏠리는 경우가 많음(App Store 17+ 다수) → 브랜드·안전 위험 |

### 🎨 무료 그림 화풍 — 11/25 서치·비교 후 결정: **B안(컷페이퍼 콜라주 + 판화 질감 + 유형 고정 색·동물 모티프)**
| | A안(첫 샘플) 부드러운 물감 일러스트 | **B안(채택)** 마티스 컷페이퍼 콜라주 |
|---|---|---|
| 2025~26 흐름 | 손그림 느낌은 맞지만 "AI가 흉내 낸 수채화"로 읽힐 위험(Skechers 2026 광고 비판) | Spotify Wrapped 2025가 'AI 같은 매끈함' 비판 뒤 스크랩북·아날로그로 전환, Pinterest 2026 콜라주, 일러스트 시장 과슈·판화 질감 급증 |
| 우리 브랜드 | 지금 결과 카드(컷페이퍼)와 따로 놂 | 결과 카드와 같은 언어 → "미술 × 메이크업" |
| 유형 체계 | 유형이 그림에서 안 보임 | 16Personalities처럼 **유형마다 고정 색 1개 + 숨은 동물 모양**(강아지상 = 머스터드 해 + 리트리버) → 64장이 한 시리즈로 보임 |
| 기각 | 지브리·애니풍: 2025 최대 유행이지만 저작권 논란·OpenAI 제한·누구나 만드는 그림이라 차별점 X | |
- 보완: B안 샘플은 앉은 자세 → 아래 20% 여백이 좁음. 본 생성 때 "서 있거나 앉아도 발밑 여백 20%" 지시 추가. 유형별 고정 색 8개는 결과 카드 gradient 색과 맞춰 정할 것.

### 📷 사용자 사진 넣기 — 11/25 서치·확인
| 항목 | 글로벌 사례 | 우리 결정 |
|---|---|---|
| 몇 장 | Lensa 10~20장·Epik 8~12장(얼굴 학습 방식) / 커플 사진 앱은 사람마다 1장 | **셀카 1장**(지금 AI 메이크업과 같음). 학습 방식이 아니라 편집 방식이라 1장으로 충분 |
| 다른 사람 사진 | 커플 앱은 상대방 사진도 받음 | **받지 않음.** 이상형은 AI 인물만 → 남의 얼굴 무단 합성 위험 차단 |
| 얼굴 닮음 | gpt-image-2는 얼굴이 크게 나오면 잘 유지, **두 사람·작은 얼굴에선 흐려짐**, 피부가 매끈해지는 문제 보고 | **무릎 위·허리 위 구도** 기본, "피부 결 유지" 지시. 운영자 사진으로 실제 확인 필요 |
| 몸 전체 | 셀카만 받고 몸은 AI가 그림. 전신 품질 자료는 못 찾음 | 1차는 무릎 위. 전신 사진 추가 칸은 샘플 결과 보고 결정 |
| 사진 보관 | Lensa·Epik "생성 직후 삭제". Lensa는 생체정보 고지가 모호하다고 일리노이 BIPA 소송 | 지금 개인정보처리방침 3.1(서버 저장 X·즉시 폐기·BIPA 고지) 그대로 + **이상형 기능 항목 추가** |
| 동의 | OpenAI 정책: 동의 없이 남의 얼굴을 사진처럼 만드는 것 금지 | "본인 사진만" 동의 체크 필수 |
| 표시 | 한국 AI 기본법(2026.1.22 시행): 실제 사람을 닮은 생성물은 **눈에 보이는 표시** 의무(과태료 최대 3천만 원, 유예 1년 이상) | 유료 고화질도 작은 "AI 생성" 표시 유지 |

### ⏭️ 다음 단계
- 샘플 1~2장: 강아지상 남자 × 한강 피크닉(약 $0.2, gpt-image-2) → 운영자 OK → 나머지 62장 → 개수 대조

---

## 1. 한 줄 정의

질문 10개에 답하면 **내 이상형의 얼굴 인상 + 패션 스타일 + 어울리는 데이트 메이크업**을
미술 포스터 카드 한 장으로 받는 무료 테스트. 다음 단계로 "이상형 옆에 선 나"(AI, 크레딧)로 이어진다.

---

## 2. 글로벌 벤치마크 — 무엇이 먹혔고 우리는 무엇을 가져오나

| 사례 | 실제로 한 것 | 숫자 | 우리가 가져올 것 |
|---|---|---|---|
| **Epik AI Yearbook** (스노우·네이버) | 셀카 8~12장 → 90년대 졸업사진 약 60장, 장당이 아니라 **팩 단위 유료** | 2주 280만 다운로드·순매출 약 $1.7M(제3자 추정), 사용자 90% 해외 | 유료는 "한 장"보다 **"세트(팩)"** 로. 한국 회사가 해외에서 터진 사례 = 글로벌 가능성 |
| **SNOW AI 프로필** | 한국식 증명·프로필 사진 AI | 한 달 150만 명, 스노우 매출 +30.4% | 결과물이 **프로필 사진으로 바로 쓰일 만큼** 예쁘면 공유된다 |
| **"내 옆에 어울리는 남자" 유행** (2026.1 릴스·틱톡) | 내 사진 1장 + 짧은 프롬프트 → 옆에 이상형 | 기사화될 만큼 확산 | 2차 유료 기능 "이상형 옆에 선 나"의 근거 |
| **16Personalities** | 무료 테스트 → 유형별 상세 페이지 → 유료 리포트 | 누적 10억 회 이상, 49개 언어 | **유형별 고정 페이지**(검색 유입) + 유료는 상세. ⚠ 결제 숨김 불만(Trustpilot 2.5) → 결제 조건은 분명하게 |
| **BuzzFeed 퀴즈** | 한 화면에 질문 하나, 결과는 기분 좋게, 공유 버튼 크게 | 퀴즈 유입 70%가 모바일 | 질문은 짧게, 결과는 **칭찬형**, 공유는 한 번 탭 |
| **Spotify Wrapped** | 카드가 곧 제품. "이게 나야" 정체성 배지 | 매년 세계적 공유 | 9:16 스토리 카드 먼저 설계, 브랜드는 작게, 문구는 **"나를 말해주는" 한 줄** |
| **틱톡 동물 연애 유형** (골든 리트리버 남친·검은 고양이 여친) | 성격을 동물로 부르는 유행, 2021년부터 계속 | 미국 매체 다수 기사화 | 한국 "강아지상·고양이상"과 **똑같은 언어** → 한·영 둘 다 통하는 유형 체계 |
| **피큐 이상형 월드컵** (한국) | 사진 2장 중 고르기 토너먼트 | 월 150만~220만 방문(추정), "이상형 월드컵" 월 검색 약 3.7만 | 고르기 방식은 중독성이 있다. 다만 피큐는 **실제 연예인 사진** → 우리는 AI 인물로만(법적 안전 + 차별점) |
| **Picrew** | 그림 조각을 골라 아바타 만들기 | 미국·한국·일본 순 방문(추정) | 일러스트 화풍은 해외에서도 통한다 |
| **Bumble Bee / Tinder** (2026) | "선호를 말하면 AI가 맞는 사람 추천"으로 이동 | 2026.3 발표 | "이상형을 말로 설명하기"가 이미 주류 행동이라는 근거 |

**공통 결론 5가지**
1. 무료 + 마찰 0 → 유료는 "더 많이/더 나다운" 세트 (Epik, 16P)
2. 결과는 **정체성 카드**여야 공유된다 (Wrapped, BuzzFeed)
3. 유형 이름이 **이미 아는 말**이면 바로 퍼진다 (동물상·골든 리트리버)
4. 유형마다 고정 페이지 = 검색 유입 자산 (16P, 우리 얼굴형 /oval/ 구조와 같음)
5. 실존 인물 없이 AI 인물만 쓰면 **안전하고 차별화**도 된다 (피큐와 반대)

### 2-1. 결과 그림을 만드는 방식 — 세 갈래 (11/24 추가 조사)
| 방식 | 사례 | 어떻게 | 돈 |
|---|---|---|---|
| ① 고정 결과 | BuzzFeed 고전 퀴즈, 16Personalities(16유형) | 유형 수만큼 미리 만든 결과 | 무료(광고·유료 리포트) |
| ② 조합형 | **Spotify Audio Aura**: 6가지 무드 중 상위 2개의 색을 청취 비율로 섞음 → 약 100가지 조합 × 30개 언어, 웹에서 실시간으로 그림 / **Co-Star**: 사람이 쓴 문장 조각을 규칙으로 조립 / **Bitmoji·Memoji**: 부위 조합 / **Google Art Selfie**: 미술관 작품 7만~8만 점 중 가장 닮은 것 찾기, 며칠 만에 셀카 3천만 장 | 미리 만든 조각을 답·데이터로 조합하거나 고르기 | **무료**, 사용자가 늘어도 비용 0 |
| ③ 매번 AI 생성 | **BuzzFeed Infinity Quizzes**(2023, AI가 결과 글을 씀, 체류 +40%) / **Snapchat Dreams**(처음 8장 1회 무료 → 팩 $0.99 또는 구독) / **Lensa**(50장 $7.99) / **Epik**(팩 유료) / **Remini**(주간 구독, 체험 뒤 자동 결제 불만) | 사용자마다 새로 생성 | 글은 무료, **얼굴 사진은 거의 모두 유료**(맛보기 1회만 무료) |

**결론**: 성공한 곳들은 **무료 = ①·②(비용 0)**, **내 얼굴로 AI 생성 = ③ 유료 팩**으로 나눴다. 얼굴 이미지를 무제한 무료로 준 곳은 찾지 못했다.
→ 우리 1차 = **② 조합형 그림 + ③ AI 한 줄 문장(BuzzFeed Infinity식, 비용이 거의 0)**. 맛보기·유료 = ③ "이상형 옆에 선 나" 팩.

---

## 3. 제품 설계

### 3-1. 주소·이름
- `/tools/ideal-type/` — **AI 이상형 테스트 — 내 이상형 얼굴·패션 1분 진단 | 키스인스킨**
- `/en/tools/ideal-type/` — **AI Ideal Type Test — Your Dream Partner's Face & Style**
- 유형별 고정 페이지: `/tools/ideal-type/golden-retriever/` … (얼굴형 /oval/ 와 같은 구조)
- 지금 있는 `PerfumeTypeQuiz` / `PerfumeTypeResult` 구조를 그대로 재사용

### 3-2. 유형 체계 — "동물상 8종" (한·영 공통)
| 유형 | 한국어 | English | 얼굴 인상 | 패션 | 데이트 메이크업 (우리 룩으로 연결) |
|---|---|---|---|---|---|
| 1 | 강아지상 | Golden Retriever | 처진 눈꼬리, 큰 웃음 | 니트·데님 캐주얼 | 코랄 생기 룩 |
| 2 | 고양이상 | Black Cat | 올라간 눈매, 무표정 | 블랙 미니멀 | 스모키·캣아이 |
| 3 | 여우상 | Fox | 가는 눈, 날렵한 턱 | 트렌치·댄디 | 누드 음영 |
| 4 | 토끼상 | Bunny | 동그란 눈, 앞니 웃음 | 파스텔 프레피 | 핑크 블러셔 |
| 5 | 곰상 | Teddy Bear | 둥근 얼굴, 순한 눈 | 아메카지·오버핏 | 웜 브라운 |
| 6 | 사슴상 | Deer | 큰 눈, 긴 목선 | 셔츠·내추럴 리넨 | 투명 피부 |
| 7 | 늑대상 | Wolf | 짙은 눈썹, 각진 턱 | 레더·스트릿 | 레드 립 |
| 8 | 공룡상 | Dino | 시원한 이목구비 | 스포티·고프코어 | 글로시 |

- 이상형 성별을 먼저 고름: **남 / 여 / 상관없음** → 그림은 8종 × 남·여 × 데이트 장소(Q1) 4 = **64장**(0절과 같음)
- 이름은 동물·무드형만. **연예인 이름이나 "○○ 닮은"은 쓰지 않음**(10/29 원칙과 같음)

### 3-3. 질문 10개 (한 화면에 하나, 6개는 그림으로 고르기)
- 그림 고르기 6개: 데이트 장소, 옷장 색, 첫눈에 보는 곳(눈·웃음·손·목소리), 주말 모습, 향, 사진 속 분위기 → **Pinterest 무드보드처럼** 고르게
- 상황 질문 4개: 연락 스타일, 싸웠을 때, 선물, 여행 방식
- 30~60초 안에 끝냄. 진행 막대 표시

**질문 초안 (11/24)**: 보기 4개 × 보기마다 2유형에 1점씩. 문항마다 8유형이 한 번씩 나와서 점수가 치우치지 않음. 동점이면 Q3(첫눈에 보는 곳)으로 정함.
| # | 질문 | 보기 → 점수 받는 유형 |
|---|---|---|
| 0 | 이상형은? (점수 없음) | 남 / 여 / 상관없음 |
| 1 | 첫 데이트 장소 🖼 | 한강 피크닉(강아지·곰) / 조용한 LP바(고양이·늑대) / 전시회(사슴·여우) / 놀이공원(토끼·공룡) |
| 2 | 그 사람 옷장 색 🖼 | 크림·베이지(곰·사슴) / 블랙·차콜(고양이·늑대) / 파스텔(토끼·강아지) / 포인트 컬러 하나(여우·공룡) |
| 3 | 첫눈에 보는 곳 🖼 | 눈웃음(강아지·토끼) / 눈빛(고양이·여우) / 어깨·손(늑대·공룡) / 분위기·목소리(곰·사슴) |
| 4 | 함께 보내는 주말 🖼 | 운동·캠핑(공룡·늑대) / 카페에서 책(사슴·고양이) / 맛집 탐방(곰·강아지) / 쇼핑·전시(여우·토끼) |
| 5 | 그 사람에게서 나는 향 🖼 | 비누·코튼(강아지·토끼) / 우디·머스크(늑대·고양이) / 시트러스(공룡·여우) / 플로럴·티(사슴·곰) |
| 6 | 둘이 찍은 사진 분위기 🖼 | 필름 카메라(곰·강아지) / 흑백(고양이·여우) / 햇살(토끼·사슴) / 도시 야경(늑대·공룡) |
| 7 | 연락 스타일 | 하루 종일 수다(강아지·토끼) / 짧고 굵게(고양이·늑대) / "잘 자"는 꼭(곰·사슴) / 갑자기 전화(공룡·여우) |
| 8 | 다퉜을 때 | 먼저 사과(강아지·곰) / 시간 두고 대화(고양이·사슴) / 바로 풀자(공룡·늑대) / 애교로 풀기(토끼·여우) |
| 9 | 받고 싶은 선물 | 손편지(사슴·토끼) / 실용템(공룡·늑대) / 깜짝 이벤트(강아지·여우) / 취향 저격 소품(고양이·곰) |
| 10 | 함께 가는 여행 | 계획 없이 떠나기(공룡·강아지) / 완벽한 계획(여우·고양이) / 호캉스(곰·토끼) / 각자 시간도 존중(늑대·사슴) |
- 11/25 점검: 10문항 모두 8유형이 한 번씩 나옴(균형 OK). 원안은 고양이·늑대가 6문항에서 같은 보기라 거의 구분이 안 됨 → Q6·Q9 짝을 바꿔 **한 짝이 같이 나오는 횟수 최대 4번**으로 낮춤
- 영어판도 같은 질문. 유형 이름만 Golden Retriever · Black Cat … 으로 바꿈

### 3-4. 결과 화면 (순서대로)
1. **이상형 카드**(9:16 스토리 + 4:5 피드, 지금 카드 규격과 같음) — 구성은 0절 "무료 카드 구성" ①~⑥ 그대로
2. 얼굴 인상 3가지 · 패션 키워드 3가지 · 어울리는 향(향수 타입 테스트로 연결)
3. **"이 사람을 만나는 날 내 메이크업"** → 우리 9룩 중 하나 → AI 메이크업으로 바로 이동 ← **매출 동선 핵심**
4. 공유: 저장 · 스토리 · 링크 복사(한 번 탭) + "친구 이상형도 맞혀보기"
5. 다른 유형 7개 둘러보기(고정 페이지로, 검색용)

### 3-5. 맛보기·유료 — "이상형 옆에 선 나" + 2차 후보
- **"이상형 옆에 선 나"**: 내 셀카 + 이상형 유형 → 둘이 나란히 선 한 장, 내 얼굴엔 데이트 메이크업
  - 맛보기 1장(가입 X, 하루 1장, 저화질+워터마크) = 지금 `functions/api/makeup-preview.ts` 방식 재사용
  - 유료는 Epik처럼 **세트로**: 1장(1크레딧) / 4장(4크레딧) — 장소: 카페·바다·눈길·전시장(무료 그림의 Q1 장소 4개와는 다른 묶음)
  - 1차에 넣을지는 0절 결정 1번에 포함
- **"AI 이상형 월드컵"**: AI 인물 16명 토너먼트 → 우승자 = 내 이상형. 검색 수요("이상형 월드컵" 월 약 3.7만)를 노림. 실존 인물이 없어서 안전

### 3-6. 무료·유료 기준 (11/24 추가)
**한 줄 규칙: 내 셀카가 들어가서 AI가 새로 그리면 유료(첫 1장은 맛보기 무료), 그 밖에는 전부 무료.**
- 우리 쪽 비용 기준과도 같다. 미리 그린 카드는 사용자가 늘어도 비용이 0이고, 셀카로 새로 그리는 이미지는 1장에 약 $0.05~0.07이 든다.
- **테스트 결과는 절대 잠그지 않는다.** 16Personalities 불만의 핵심은 결과를 보려는데 결제를 요구한 것이었다(Trustpilot 2.5).

| 구분 | 무엇 | 가격 |
|---|---|---|
| 무료 | 퀴즈·결과 카드·유형 설명·공유·유형 페이지(8유형 × 한·영 = 16개)·(2차) 월드컵 | 0, 가입도 필요 없음 |
| 맛보기 | "이상형 옆에 선 나" 1장: 저화질 + 워터마크(지금 `/api/makeup-preview` 방식) | 0, 가입 필요 없음, 하루 1장 |
| 유료 | 같은 사진의 고화질·워터마크 없는 버전, 장소별 4장 세트(Epik식) | 1장 = 1크레딧. 4장 세트는 기존 5개 $2.99로 해결(팩: 5개 $2.99·9개 $4.99·15개 $6.99, `functions/api/_packs.ts`) |

- **새 상품이나 새 무료권은 만들지 않는다.** 가입 무료권(메이크업 1 + 럭키 1)과 크레딧 5/9/15개를 그대로 쓴다. 무료권 정책이 복잡해지지 않게.
- "이 사람 만나는 날 내 메이크업" 버튼은 기존 메이크업 무료권 1장으로 연결한다(이미 있는 동선).

---

## 4. 지켜야 할 선 (안전·법)
- 실존 인물 금지: 이름 입력란 없음, 결과·이미지에 실명이나 닮은꼴 표현 없음
- **업로드는 내 셀카만**: "본인 사진만" 동의 체크. 다른 사람 사진으로 커플 사진을 만드는 딥페이크를 막기 위함
- 나이: 지금 약관과 같은 **만 14세 이상**("성인 전용" 아님). 노출 있는 옷·선정적 포즈는 프롬프트에서 막음
- 성별·체형·피부색 편견 없게: 유형마다 다양한 피부톤을 섞어서 그림
- 모든 이미지에 "AI 생성" 표시 + 워터마크(지금 규칙과 같음)

---

## 5. 측정 (GA4) — 4주 통과 기준
| 이벤트 | 의미 | 4주 기준 |
|---|---|---|
| `ideal_quiz_start` → `ideal_quiz_complete` | 완료율 | ≥ 60% |
| `ideal_share` | 공유율 | ≥ 5% (완료 대비) |
| `ideal_to_makeup` | 메이크업 이동률 | ≥ 8% |
| `ideal_try_side` → 가입 | 맛보기 → 가입률(맛보기를 1차에 넣을 경우) | 기준선 먼저 수집 |
| 서치콘솔 | 유형 페이지 16개(한·영) 노출 | 4주 안에 색인·노출 시작 |
- 통과하면 → 2차(유료 4장 세트·월드컵) 진행 / 못 미치면 → 질문·카드 문구를 고치고 2주 더

---

## 6. 비용·일정 (추정)
- 그림 64장: 샘플 1~2장(강아지상 남 × 한강 피크닉, 약 $0.2) 먼저 → 운영자 OK → 나머지 → 개수 대조 (**유료 대량 생성 점검 절차** 지킴). gpt-image-2 기준 약 $3~11(화질에 따라)
- AI 한 줄: 작은 텍스트 모델, 1명당 약 0.1원 / 맛보기: 1장 약 $0.05~0.07 × 하루 사용량
- 1주차: 결정 5가지 + 샘플 1~2장 · 2주차: 64장 + 퀴즈·결과·유형 페이지(한국어) · 3주차: 영어판 + 사이트맵·IndexNow · 4주차부터 측정

---

## 7. 운영자 결정 필요
- **0절 끝 "다음에 다시 시작할 때" 5가지로 합침**(11/24 원안 4가지 = 유형 체계·화풍·1차 범위·성별 선택지 → 0절 2번·4번에 들어감)

---

### 출처
- Epik: [TechCrunch](https://techcrunch.com/2023/10/06/ai-app-epik-hits-no-1-on-the-app-store-for-its-viral-yearbook-photo-feature) · [Korea Times](https://www.koreatimes.co.kr/amp/lifestyle/trends/20231006/epiks-ai-yearbook-feature-goes-viral-takes-users-back-to-90s) · [數位時代](https://www.bnext.com.tw/article/76964/epik-ai-yearbook-snow-naver-generativeai-profile-picture) · [NBC](https://www.nbcnews.com/tech/ai-yearbook-app-epik-not-free-social-media-rcna118702)
- "내 옆 남자" 유행: [Free Press Journal](https://www.freepressjournal.in/lifestyle/generate-a-man-next-to-me-that-will-suit-me-goes-viral-new-ai-trend-decides-your-boyfriend-heres-how-to-make) · FaceVibe [App Store](https://apps.apple.com/us/app/id6748242954)
- 16Personalities: [공식 테스트](https://www.16personalities.com/free-personality-test) · [Trustpilot](https://www.trustpilot.com/review/www.16personalities.com) · [GRI wiki](https://wiki.gri.co/index.php/16_Personalities)
- BuzzFeed: [Fast Company](https://www.fastcompany.com/3026627/how-buzzfeed-made-the-online-quiz-irresistible) · [Nieman Lab](https://www.niemanlab.org/2014/02/are-quizzes-the-new-lists-what-buzzfeeds-latest-viral-success-means-for-publishing/)
- Spotify Wrapped: [NoGood](https://nogood.io/blog/spotify-wrapped-marketing-strategy/) · [Fortune](https://fortune.com/2025/12/03/why-spotify-wrapped-marketing-genius-individuality-uniqueness-belonging-psychology/) · [ADMA](https://adma.com.au/resources/personal-shareable-no-strings-attached-the-winning-formula-behind-spotify-wrapped) · [UX Collective](https://uxdesign.cc/before-you-ship-your-wrapped-this-year-a0a47ee191f8)
- 동물 연애 유형: [Bustle](https://www.bustle.com/life/tiktok-black-cat-golden-retriever-energy-trend) · [Elite Daily](https://www.elitedaily.com/dating/tiktok-golden-retriever-boyfriend) · [Distractify](https://www.distractify.com/p/what-is-a-golden-retriever-boyfriend)
- 피큐: [Semrush](https://ja.semrush.com/website/piku.co.kr/overview) · [Ahrefs](https://ahrefs.com/websites/piku.co.kr) · [나무위키](https://namu.moe/w/PIKU)
- Picrew: [Wikipedia](https://en.wikipedia.org/wiki/Picrew) · [Semrush](https://zh.semrush.com/website/picrew.me/overview)
- Pinterest: [Pinterest Business](https://business.pinterest.com/blog/how-gen-z-is-taking-back-their-taste-from-ai/) · [YPulse(Shuffles)](https://www.ypulse.com/newsfeed/2022/08/03/pinterest-is-appealing-to-gen-z-and-millennials-with-a-new-app-called-shuffles-that-helps-users-create-mood-boards-and-collages/)
- 11/25 결정 근거: [Snap Newsroom(Dreams)](https://newsroom.snap.com/dreams) · [TechCrunch(Dreams)](https://techcrunch.com/2023/08/29/snapchat-launches-a-new-ai-selfie-feature-called-dreams) · [Spotify Me in 2023](https://newsroom.spotify.com/tag/me-in-2023) · [Tinder 성별 설정](https://www.help.tinder.com/hc/articles/15668360470669-Gender-Sexual-Orientation) · [You2 App Store](https://apps.apple.com/us/app/id6760884531) · [Couplio App Store](https://apps.apple.com/us/app/id6751223823)
- 사진 넣기(11/25): [TechCrunch(Lensa)](https://techcrunch.com/2022/12/01/lensa-ai-climbs-the-app-store-charts-as-its-magic-avatars-go-viral) · [NBC(Epik)](https://www.nbcnews.com/tech/ai-yearbook-app-epik-not-free-social-media-rcna118702) · [Lensa BIPA 소송](https://petapixel.com/2023/03/16/lawsuit-alleges-lensa-ai-app-illegally-took-users-biometric-data) · [OpenAI 이용 정책](https://openai.com/policies/usage-policies/) · [AI 기본법 워터마크(중앙데일리)](https://www.koreajoongangdaily.com/business/koreas-groundbreaking-ai-law-requires-watermarks-on-generated-content-but-enforcement-gaps-remain/12094830) · [PetaPixel(AI 표시법)](https://petapixel.com/2026/01/29/south-korea-launches-landmark-laws-requiring-labels-on-ai-generated-content/) · [PhotoWorkout(얼굴 유지 시험)](https://www.photoworkout.com/gpt-image-26-test/) · [OpenAI 포럼(매끈한 피부)](https://community.openai.com/t/gpt-image-2-produces-plastic-looking-faces-in-product-edit/1394653)
- 화풍(11/25): [Fast Company·Spotify 2025](https://newsroom.spotify.com/?p=37865) · [iMusician(2024 AI 광택→2025 아날로그)](https://imusician.pro/en/resources/blog/spotify-wrapped-2025) · [Creative Bloq 2026 일러스트 흐름](https://www.creativebloq.com/art/illustration/messy-meaningful-and-made-by-humans-the-biggest-illustration-trends-for-2026) · [IllustrationX 시장 분석](https://www.illustrationx.com/news/6932/trendx_-_our_deep_analysis_of_whats_going_on_in_the_market) · [Highsnobiety 2026 패션 일러스트](https://www.highsnobiety.com/p/2026-is-the-year-of-the-fashion-illustrator) · [DesignRush Skechers](https://www.designrush.com/best-designs/print/trends/skechers-bad-ai-ads-on-purpose) · [NBC 지브리 유행](https://www.nbcnews.com/tech/tech-news/studio-ghibli-chatgpt-inspired-memes-portraits-rcna198273) · [Zeda Labs 16P 캐릭터](https://dribbble.com/zedalabs/projects/240402-16-Personalities)
- Bumble·Tinder: [TechCrunch](https://techcrunch.com/2026/03/12/bumble-introduces-an-ai-dating-assistant-bee/) · [Axios](https://www.axios.com/2026/03/12/tinder-ai-features-hinge-bumble)

---

### 정리 기록 (11/25)
- 상태 줄: "맨 아래 4가지" → 0절 5가지로 통일, 7절은 0절로 합침
- 그림 수: 본문 16장 → 0절과 같은 **64장**(3-2·6절), 비용·샘플도 64장 기준으로
- 이름: "커플 포스터" 남은 곳 → "이상형 옆에 선 나"
- 질문 짝: Q6·Q9 조정(고양이·늑대 6번 → 4번)
- 나이: "성인 전용(만 14세…)" 모순 → 약관과 같은 만 14세 이상
- 측정: 맛보기 → 가입 이벤트 추가
- 코드 확인: `PerfumeTypeQuiz`·`PerfumeTypeResult`·`functions/api/makeup-preview.ts`(gpt-image-2)·크레딧 팩 5/9/15개 실제 존재
