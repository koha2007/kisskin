import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { useI18n } from '../i18n/I18nContext'
import AboutMakeupAiBodyEn, { ABOUT_MAKEUP_AI_HERO_EN } from './AboutMakeupAiBodyEn'

const HERO_KO = {
  badge: 'K-뷰티 메이크업 완전 가이드',
  title: 'K-뷰티 메이크업의 모든 것',
  subtitle:
    '역사·6가지 여성 스타일·6가지 남성 스타일·AI 시뮬레이션의 원리·사진 촬영 팁까지. K-뷰티 메이크업을 시작하는 사람부터 현직 뷰티 에디터까지 참고할 수 있는 3,000단어 분량의 심화 가이드입니다.',
  toc: [
    ['#history', '1. K-뷰티 메이크업의 역사'],
    ['#philosophy', '2. K-뷰티 메이크업의 미학 — 왜 세계가 주목하는가'],
    ['#women-styles', '3. 여성을 위한 6가지 K-뷰티 스타일'],
    ['#men-styles', '4. 남성을 위한 6가지 K-뷰티 스타일'],
    ['#ai-principle', '5. AI 메이크업 시뮬레이션의 원리'],
    ['#photo-tips', '6. 정확도를 높이는 사진 촬영 팁'],
    ['#faq', '7. 자주 묻는 질문'],
  ] as const,
  tocLabel: '목차',
}

export default function AboutMakeupAi() {
  const { t, locale } = useI18n()
  const isEn = locale === 'en'
  const hero = isEn ? ABOUT_MAKEUP_AI_HERO_EN : HERO_KO
  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />
      <main>

      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-pink-200/40 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-pink-200 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <span className="material-symbols-outlined text-sm">menu_book</span>
            {hero.badge}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight text-navy mb-4">
            {hero.title}
          </h1>
          <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {hero.subtitle}
          </p>
        </div>
      </section>

      {/* TOC */}
      <section className="py-10 bg-white border-y border-pink-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-4">{hero.tocLabel}</h2>
          <ol className="grid md:grid-cols-2 gap-y-2 gap-x-6 text-sm">
            {hero.toc.map(([href, label]) => (
              <li key={href}><a href={href} className="text-primary hover:underline">{label}</a></li>
            ))}
          </ol>
        </div>
      </section>

      {isEn ? <AboutMakeupAiBodyEn /> : <AboutMakeupAiBodyKo t={t} />}

      </main>
      <ToolsFooter />
    </div>
  )
}

function AboutMakeupAiBodyKo({ t }: { t: (key: string) => string }) {
  return (
    <>

      {/* Body */}
      <article className="py-14 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 prose max-w-none text-slate-700 leading-relaxed text-[15px] md:text-[17px]">

          {/* 1. History */}
          <section id="history" className="mb-14">
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-5">1. K-뷰티 메이크업의 역사</h2>
            <p className="mb-4">K-뷰티 메이크업의 현재 모습은 2010년대 초반 이후 약 15년간 급속도로 형성되었습니다. 그 이전까지 한국의 메이크업은 기본적으로 일본식 어른스러움(깔끔·세련) 또는 서양식 컨투어링(또렷·윤곽 강조) 의 영향을 강하게 받았지만, 2010년대 초 K-pop과 한류 드라마가 글로벌로 확산되면서 "한국식 만의 미감"이 정립되기 시작했습니다.</p>
            <p className="mb-4">2013~2015년경 "쿠션 파운데이션"의 세계적 성공이 K-뷰티의 첫 번째 전환점이었습니다. 아모레퍼시픽이 개발한 쿠션 포맷이 휴대성과 시트 피부 연출의 표준이 되면서, "한국인 = 피부가 좋다"는 글로벌 인식이 만들어졌습니다. 이 시기에 "글래스 스킨(Glass Skin)", "클라우드 스킨(Cloud Skin)" 같은 한국식 피부 표현 용어가 영문권 뷰티 매체에 공식 채택됩니다.</p>
            <p className="mb-4">2016~2019년은 "색조의 K-화"가 본격화된 시기입니다. 이 시기의 대표 아이콘은 블러드 립(Blood Lip, 안에서 붉어진 듯한 틴트) 과 그라데이션 립(Gradient Lip, 중앙에서 번지는 컬러)입니다. 두 스타일 모두 "꾸안꾸" — 과하게 화장한 티가 나지 않으면서도 건강한 혈색을 연출하는 — 철학을 공유합니다. 이 시기에 아이섀도 팔레트도 "한국 공식"이 정립되었습니다. 단색 포인트가 아닌 "톤 온 톤 레이어링"이 그 대표 예입니다.</p>
            <p className="mb-4">2020년 이후는 "개별 특화"의 시대입니다. 팬데믹 기간 동안 "마스크 메이크업" (마스크로 가려지는 부분은 생략, 눈에만 집중하는 전략)이 발전했고, 이는 이후 "맥시멀리스트 아이(Maximalist Eye)" 트렌드로 이어졌습니다. 2023년부터는 남성 메이크업의 대중화가 빠르게 진행되어, 스킨케어 하이브리드(Skincare Hybrid) · 모노크롬(Monochrome) · 유틸리티 메이크업(Utility Makeup) 같은 남성 전용 용어가 자리잡았습니다. 2025~2026년 현재는 "개인 페르소나를 반영하는 메이크업"이 주류로, 이 가이드에서 다루는 메이크업 MBTI·퍼스널 컬러·얼굴형 진단 같은 "셀프 분석" 콘텐츠 수요가 급증한 배경이기도 합니다.</p>
          </section>

          {/* 2. Philosophy */}
          <section id="philosophy" className="mb-14">
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-5">2. K-뷰티 메이크업의 미학 — 왜 세계가 주목하는가</h2>
            <p className="mb-4">K-뷰티가 세계적으로 사랑받는 이유는 단일한 "스타일"이 아니라, 독특한 <strong>미학적 철학</strong>에 있습니다. 이 철학은 크게 세 가지 원칙으로 요약할 수 있습니다.</p>
            <p className="mb-4"><strong>첫째, "피부 위의 투명함(Translucency over Coverage)"</strong> — 서양식 풀 커버 파운데이션이 "잡티를 가린다"는 목표에 초점을 맞춘다면, K-뷰티는 "피부 본연의 건강함이 드러나 보이게 한다"는 방향을 추구합니다. 쿠션·클라우드 스킨·글래스 스킨 모두 공통적으로 "피부가 살아있는 것처럼" 보이게 하는 기술입니다. 이는 단순히 가볍게 바르는 것이 아니라, 레이어링 순서와 제품 질감의 조합을 통해 "투명하면서도 균일한" 피부를 만드는 기술입니다.</p>
            <p className="mb-4"><strong>둘째, "꾸안꾸의 정교함(Precise Casualness)"</strong> — "꾸민 듯 안 꾸민 듯"이라는 표현은 K-뷰티를 가장 잘 설명합니다. 실제로는 상당히 많은 단계(스킨케어 5~10단계, 베이스 3~4단계, 색조 4~6단계)를 거치지만, 결과물은 "가볍게 한 듯"이 목표입니다. 이는 서양식 "확실히 드러나는 변신"과 반대되는 방향으로, 한국인 특유의 "과하지 않은 세련됨"을 선호하는 문화적 코드와도 연결됩니다.</p>
            <p className="mb-4"><strong>셋째, "감정 표현의 도구화(Emotional Expressiveness)"</strong> — K-뷰티는 메이크업을 "예뻐 보이기 위한 수단"을 넘어서 "그날의 감정·기분을 표현하는 도구"로 씁니다. 립 색상 하나로 오늘의 무드를 바꾸고, 아이섀도 포인트 위치로 캐릭터를 만드는 방식입니다. 이 철학은 메이크업 MBTI·퍼스널 컬러·얼굴형 진단 같은 "나를 분석하고 그에 맞는 스타일을 찾는" 콘텐츠 흐름의 근원이기도 합니다.</p>
          </section>

          {/* 3. Women styles */}
          <section id="women-styles" className="mb-14">
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-5">3. 여성을 위한 6가지 K-뷰티 스타일</h2>
            <p className="mb-6">kissinskin은 2026년 기준 가장 대표적인 6가지 여성 K-뷰티 스타일을 AI 시뮬레이션으로 제공합니다. 각 스타일의 핵심을 정리합니다.</p>
            <div className="space-y-5 not-prose">
              {WOMEN_STYLES.map(s => (
                <div key={s.name} className="bg-white rounded-2xl p-5 border border-pink-100">
                  <h3 className="font-extrabold text-primary-dark mb-1">{s.name} <span className="text-xs font-mono text-slate-400 ml-1">{s.en}</span></h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Men styles */}
          <section id="men-styles" className="mb-14">
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-5">4. 남성을 위한 6가지 K-뷰티 스타일</h2>
            <p className="mb-6">남성 메이크업은 2023년부터 대중화가 급격히 빨라졌으며, kissinskin은 남성 전용 6가지 스타일을 별도로 제공합니다. 남성 메이크업은 "티 안 나는 정돈"이 기본 원칙입니다.</p>
            <div className="space-y-5 not-prose">
              {MEN_STYLES.map(s => (
                <div key={s.name} className="bg-white rounded-2xl p-5 border border-blue-100">
                  <h3 className="font-extrabold text-blue-600 mb-1">{s.name} <span className="text-xs font-mono text-slate-400 ml-1">{s.en}</span></h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 5. AI principle */}
          <section id="ai-principle" className="mb-14">
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-5">5. AI 메이크업 시뮬레이션의 원리</h2>
            <p className="mb-4">kissinskin의 AI 메이크업 시뮬레이션은 크게 <strong>3단계</strong>로 동작합니다.</p>
            <p className="mb-4"><strong>1단계 · 얼굴 분석(Face Analysis)</strong>: 업로드된 사진에서 얼굴 랜드마크(눈·코·입·광대·턱 등 68~98개 포인트)를 추출합니다. 이 단계에서 얼굴형, 피부톤, 눈·입술 크기 비율이 계산됩니다. 추출된 데이터는 익명화된 벡터 형태로만 처리되며, 원본 사진은 서버에 저장되지 않습니다.</p>
            <p className="mb-4"><strong>2단계 · 스타일 매핑(Style Mapping)</strong>: 사용자가 선택한 스타일(예: Natural Glow, Blood Lip)의 "스타일 프로파일"이 AI에 입력됩니다. 각 프로파일은 수백 장의 레퍼런스 이미지와 브랜드 컬러 공식을 학습한 결과이며, 사용자의 얼굴 벡터에 맞게 컬러·강도·배치가 동적으로 조정됩니다.</p>
            <p className="mb-4"><strong>3단계 · 생성 및 합성(Generation & Composite)</strong>: 최종 이미지는 사용자의 원본 얼굴 구조를 유지한 채, 메이크업 레이어만 자연스럽게 합성됩니다. 이 과정에서 얼굴의 개인 정체성(눈매·입꼬리 각도·광대 높이 등)은 보존되며, 오직 "메이크업 레이어"만 적용됩니다. 이 원칙 덕분에 "전혀 다른 사람처럼 보이는" 부자연스러운 결과 없이 실제 본인이 그 메이크업을 한 것처럼 시뮬레이션됩니다.</p>
            <p className="mb-4">결과물은 총 6장의 이미지로, 여성의 경우 6가지 여성 스타일(메이크업 5 + 헤어 컬러 1), 남성의 경우 6가지 남성 스타일이 각각 별도로 생성됩니다. 원본 셀카 1장으로 항목마다 따로 합성해 얼굴 동일성을 보존합니다. 약 30~60초 내에 완성되며, 결과 페이지에서 각 룩을 크게 보고 다운로드·공유할 수 있습니다.</p>
          </section>

          {/* 6. Photo tips */}
          <section id="photo-tips" className="mb-14">
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-5">6. 정확도를 높이는 사진 촬영 팁</h2>
            <p className="mb-4">AI 시뮬레이션의 퀄리티는 입력 사진에 크게 좌우됩니다. 다음 5가지 조건을 지키면 결과 품질이 20~40% 이상 향상됩니다.</p>
            <ol className="list-decimal pl-5 space-y-3 mb-4">
              <li><strong>정면 얼굴 · 중립 표정</strong> — 고개를 약간이라도 기울이면 좌우 비대칭이 왜곡되어 결과가 어색해집니다. 미소 없이 편안한 상태로 정면을 바라보세요.</li>
              <li><strong>자연광 또는 무채색 조명</strong> — 노란 전등이나 색온도가 치우친 조명 아래에서는 피부톤이 실제와 다르게 읽힙니다. 창가 자연광이 가장 정확하며, 실내라면 5000~6500K 백색광을 추천합니다.</li>
              <li><strong>화장 없음 또는 아주 옅은 피부 정돈</strong> — 이미 풀메이크업을 한 상태면 AI가 "원본 피부"를 파악하기 어려워 결과가 두꺼워 보입니다. 스킨케어만 한 맨얼굴 또는 쿠션 한 톱만 올린 상태가 이상적입니다.</li>
              <li><strong>앞머리로 얼굴을 가리지 않기</strong> — 이마·헤어라인이 보여야 얼굴형 분석이 정확해집니다. 앞머리가 있다면 옆으로 넘기고 찍으세요.</li>
              <li><strong>고해상도 · 수직 구도</strong> — 가로 스마트폰으로 찍은 사진은 비율이 왜곡되기 쉽습니다. 수직(세로) 구도로 찍고, 최소 1080px 이상의 해상도를 사용하세요.</li>
            </ol>
          </section>

          {/* 7. FAQ */}
          <section id="faq" className="mb-14">
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-5">7. 자주 묻는 질문</h2>
            <div className="space-y-4">
              {FAQ.map(f => (
                <details key={f.q} className="bg-white rounded-2xl p-5 border border-pink-100">
                  <summary className="font-bold text-navy-mid cursor-pointer">{f.q}</summary>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mb-14">
            <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 rounded-3xl p-8 md:p-10 text-center">
              <span className="material-symbols-outlined text-primary text-5xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-navy mb-3">이론은 충분히 이해하셨나요?</h2>
              <p className="text-slate-600 mb-6 max-w-lg mx-auto text-sm md:text-base">직접 본인 얼굴에 6가지 스타일을 시뮬레이션해 보세요. 무엇이 가장 잘 어울리는지 바로 확인할 수 있습니다.</p>
              <a href="/analysis/" className="bg-gradient-to-r from-primary to-pink-500 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl shadow-primary/25 inline-flex items-center gap-2">
                {t('tools.common.aiMakeupStart')}
                <span className="material-symbols-outlined">arrow_forward</span>
              </a>
            </div>
          </section>

        </div>
      </article>
    </>
  )
}

const WOMEN_STYLES = [
  { name: '글래스 스킨 글로우', en: 'Glass Skin Glow', desc: '유리알처럼 맑고 촉촉한 광채 베이스. 2026 클라우드 글로우 트렌드의 핵심으로, 물광이 도는 투명한 피부에 은은한 핑크·피치 블러셔와 글로시 누드 립을 더합니다. 거의 모든 퍼스널 컬러에 어울리는 K-뷰티의 시그니처 베이스입니다.' },
  { name: '블러드 틴트 립', en: 'Blurred Tint Lip', desc: '입술 중앙은 진하고 바깥으로 갈수록 흐려지는 그라데이션 틴트. 경계가 번진 자연 혈색 연출로 "꾸안꾸"의 대표 기법이며, 2016년부터 한국 K-뷰티의 상징적인 립 표현으로 자리잡았습니다.' },
  { name: '란제리 메이크업', en: 'Lingerie Makeup', desc: '속옷처럼 은은하고 관능적인 뉴트럴 무드. 뮤트 베이지·로지 브라운 톤이 피부에 녹아드는 소프트 매트 베이스에 차분한 셰이딩을 더한 2026 트렌드 룩입니다.' },
  { name: '글레이즈드 라벤더 립', en: 'Glazed Lavender Lip', desc: '라벤더·모브 톤의 글로시한 누드 립이 핵심인 2026 신상 누드립 트렌드. 차분한 라벤더 기운이 도는 뮤트 베이스에 클린한 아이로 마무리해 세련되고 트렌디한 인상을 만듭니다.' },
  { name: 'K-pop 아이돌 메이크업', en: 'K-Pop Idol Makeup', desc: '유리알 광 베이스 + 그라데이션 핑크 립 + 쉬머 하이라이터의 3박자. 제니·IVE 스타일의 화사한 무대 메이크업으로, K-pop 팬덤과 함께 세계로 확산된 한국 메이크업의 아이콘입니다.' },
  { name: '코퍼 어번 헤어', en: 'Copper Auburn Hair', desc: '메이크업이 아닌 헤어 컬러 변신. 구리빛 어번(적갈색)은 2026 글로벌 유행 헤어 컬러로, 얼굴은 그대로 두고 머리색만 바꿔 분위기 변화를 미리 확인할 수 있습니다.' },
]

const MEN_STYLES = [
  { name: '스킨케어 글로우 베이스', en: 'Skincare Glow Base', desc: '이마·코끝·광대에 건강한 수분 광택이 도는 촉촉한 피부 연출. 잡티·다크서클만 살짝 정돈해 "원래 피부 좋은 남자" 인상을 만드는, 한국 남성 메이크업의 기본 접근법입니다.' },
  { name: '노메이크업 메이크업', en: 'No-Makeup Makeup', desc: '화장한 듯 안 한 듯한 궁극의 "티 안 나는 정돈". 피부결·모공·수염 자국은 유지한 채 매끈하게만 정리하고 눈썹을 가지런히 다듬는 수준으로, 남성 메이크업 입문자에게 가장 추천됩니다.' },
  { name: 'K-팝 아이돌 메이크업', en: 'K-Pop Idol Makeup', desc: '유리알 글로우 베이스 + 은은한 아이 포인트 + 코랄 립 틴트. 남성적인 얼굴은 그대로 두고 무대 위 남돌처럼 화사하게 연출하는 균형 잡힌 스타일입니다.' },
  { name: '그런지 스모키 아이', en: 'Grunge Smoky Eye', desc: '남성 메이크업 중 가장 강렬한 카테고리. 브라운·다크카키를 블렌딩한 스머지드 스모키로 샤프한 눈매를 만드는, 2026 그런지 부활 트렌드의 대표 룩입니다.' },
  { name: '모노크롬 메이크업', en: 'Monochrome Makeup', desc: '눈·볼·입술을 테라코타·피치 한 톤으로 묶은 절제된 톤온톤 스타일. 따뜻한 톤이 은은하게 감돌아 비즈니스·공식 자리에서 신뢰감 있는 남성 메이크업으로 평가받습니다.' },
  { name: '애쉬 브라운 헤어', en: 'Ash Brown Hair', desc: '메이크업이 아닌 헤어 컬러 변신. 애쉬 브라운은 2026 글로벌 유행 헤어 컬러로, 얼굴은 그대로 두고 머리색만 차분한 애쉬 브라운으로 바꿔 분위기 변화를 확인할 수 있습니다.' },
]

const FAQ = [
  {
    q: '메이크업 MBTI, 퍼스널 컬러, 얼굴형 — 셋 중 뭘 먼저 하면 좋나요?',
    a: '일반적으로 "얼굴형 → 퍼스널 컬러 → 메이크업 MBTI" 순서를 추천합니다. 얼굴형은 메이크업 컨투어의 기본 프레임을 결정하고, 퍼스널 컬러는 어울리는 색 범위를 확정하고, 메이크업 MBTI는 그 안에서 내 성향에 맞는 스타일을 제안합니다. 세 가지를 모두 알면 가장 체계적인 메이크업 공식을 만들 수 있습니다.',
  },
  {
    q: 'AI 메이크업 결과가 실제 화장과 얼마나 비슷한가요?',
    a: 'kissinskin의 AI는 피부의 실제 조명 반응까지 학습한 생성 모델을 사용하기 때문에, 실제 화장과 매우 유사한 결과를 제공합니다. 단, 실제 화장과 100% 동일하지는 않으며 "레퍼런스 이미지"로 활용하는 것이 적절합니다. 화장품 구매 전 어울림 여부를 확인하는 도구로 쓰시길 권장합니다.',
  },
  {
    q: '사진을 업로드하면 서버에 저장되나요?',
    a: '원본 사진은 분석 후 즉시 삭제되며, 익명화된 얼굴 벡터만 결과 생성에 사용됩니다. 자세한 내용은 개인정보 처리 방침 페이지를 참고해주세요.',
  },
  {
    q: '여성인데 남성 스타일도 시도할 수 있나요?',
    a: '가능합니다. AI는 성별 기반 제약 없이 모든 스타일을 적용해볼 수 있도록 설계되어 있습니다. 본인의 취향과 분위기에 맞는 스타일을 자유롭게 실험해 보세요.',
  },
  {
    q: '결과를 SNS에 공유해도 되나요?',
    a: '네, 결과 페이지의 공유 버튼을 통해 인스타그램·카카오톡·X 등에 바로 공유할 수 있습니다. AI 생성 이미지에는 워터마크가 포함되며, 본인 얼굴이 포함된 콘텐츠이므로 공유 범위는 신중히 선택해 주세요.',
  },
]
