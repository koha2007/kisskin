interface FaqItem {
  q: string
  a: string
}

interface Props {
  title?: string
  items: FaqItem[]
  accentColor?: string
}

export default function ToolFaq({ title = '자주 묻는 질문', items, accentColor = '#eb4763' }: Props) {
  return (
    <section className="py-14 md:py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl md:text-2xl font-extrabold text-navy text-center mb-8 tracking-tight">{title}</h2>
        <div className="space-y-3">
          {items.map((item, i) => (
            <details
              key={i}
              className="group bg-white rounded-2xl border transition-colors"
              style={{ borderColor: `${accentColor}30` }}
            >
              <summary className="cursor-pointer list-none p-5 flex items-start gap-3">
                <span
                  className="material-symbols-outlined shrink-0 mt-0.5 group-open:rotate-180 transition-transform"
                  style={{ color: accentColor }}
                >
                  expand_more
                </span>
                <span className="font-bold text-navy-mid text-sm md:text-base flex-1">{item.q}</span>
              </summary>
              <div className="px-5 pb-5 pl-14 text-slate-600 text-sm md:text-[15px] leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: items.map((x) => ({
                '@type': 'Question',
                name: x.q,
                acceptedAnswer: { '@type': 'Answer', text: x.a },
              })),
            }),
          }}
        />
      </div>
    </section>
  )
}

export const FACE_SHAPE_FAQ_BASE: FaqItem[] = [
  {
    q: '얼굴형은 변할 수 있나요?',
    a: '뼈 구조 자체는 성인이 된 이후 거의 변하지 않지만, 체중 변화·근육량·붓기·헤어스타일에 따라 인상이 달라 보일 수 있습니다. 진단 결과는 평소 상태 기준이며, 다이어트나 시술 후 다시 측정하면 다른 결과가 나올 수도 있습니다.',
  },
  {
    q: '여러 얼굴형이 섞여 있을 때는 어떻게 해야 하나요?',
    a: '실제로 100% 한 가지 얼굴형인 사람은 드뭅니다. 진단은 가장 비중이 큰 형태를 알려 주며, 메이크업·헤어 가이드는 주된 형태에 부형을 보완하는 방향으로 적용하면 가장 자연스럽습니다.',
  },
  {
    q: '컨투어링이 어색해 보이는 이유는 무엇인가요?',
    a: '쉐이딩 컬러가 너무 짙거나, 경계가 명확하게 남아 있을 때 부자연스러워집니다. 자연광에 가까운 환경에서 작은 브러쉬로 얇게 여러 번 빌드업하고, 경계는 스펀지로 두드려 풀어 주면 훨씬 자연스럽게 합쳐집니다.',
  },
  {
    q: '안경 추천이 실제 시력 교정용에도 적용되나요?',
    a: '네. 얼굴형별 추천 프레임은 시력 교정용·도수 없는 패션 안경 모두에 동일하게 적용됩니다. 다만 도수가 높은 경우 렌즈 두께를 고려해 프레임 사이즈를 약간 작게 선택하는 것이 좋습니다.',
  },
  {
    q: 'AI 메이크업 시뮬레이션과 함께 쓰면 어떤 점이 좋은가요?',
    a: '얼굴형 진단은 "어떤 컨투어가 어울리는지"를, AI 시뮬레이션은 "내 얼굴에 메이크업이 실제로 어떻게 보이는지"를 알려 줍니다. 두 결과를 함께 보면 어울리는 룩 후보를 빠르게 좁혀 실패 없는 메이크업이 가능합니다.',
  },
]

export const FACE_SHAPE_FAQ_BASE_EN: FaqItem[] = [
  {
    q: 'Can my face shape change over time?',
    a: 'The underlying bone structure barely changes after adulthood, but weight changes, muscle volume, water retention, and hairstyle can shift the impression of your face. Quiz results reflect your typical state, so a re-take after major weight changes or procedures may give a slightly different answer.',
  },
  {
    q: 'What if my face has features from multiple shapes?',
    a: 'Very few people sit at 100% of a single shape. The quiz tells you which base shape dominates; for makeup and hair, follow the primary shape\'s guidance first, then borrow small adjustments from the secondary shape for a more natural fit.',
  },
  {
    q: 'Why does my contouring look unnatural?',
    a: 'Usually because the shading color is too dark, or the edges are too defined. Work in natural light, build up shadow in thin layers with a small brush, and pat over the edges with a damp sponge to fade them — that single step makes contour read as light instead of paint.',
  },
  {
    q: 'Do the eyewear recommendations apply to prescription glasses too?',
    a: 'Yes. The recommended frame shapes work the same way whether the lens is prescription or non-prescription. With a strong prescription, you may want to size the frame slightly smaller to keep lens thickness from overpowering the face.',
  },
  {
    q: 'How does this work alongside the AI makeup simulation?',
    a: 'Face-shape diagnosis tells you which contour direction suits your bone structure. The AI makeup simulation shows how a specific look will actually render on your photo. Reading them together is the fastest way to narrow down looks you will actually want to wear.',
  },
]

export const MBTI_FAQ_BASE: FaqItem[] = [
  {
    q: '메이크업 MBTI는 일반 MBTI와 어떻게 다른가요?',
    a: '일반 MBTI가 성격 4축을 진단한다면, 메이크업 MBTI는 메이크업 성향을 4축(미니멀-맥시멀, 자연-가공, 컬러-뉴트럴, 데일리-스페셜)으로 분석해 16가지 메이크업 유형을 도출합니다. 성격 MBTI와는 별개의 결과가 나올 수 있습니다.',
  },
  {
    q: '진단 결과를 평소 화장에 어떻게 활용하나요?',
    a: '결과 페이지의 시그니처 컬러·아이코닉 룩·텍스처 가이드를 참고해 자신에게 어울리는 제품 카테고리를 좁혀 보세요. 무지성으로 인기 제품을 따라 사는 대신, 자신의 유형에 맞는 컬러/텍스처/마무리감 위주로 골라 화장대 효율을 높일 수 있습니다.',
  },
  {
    q: '결과가 마음에 들지 않으면 다시 할 수 있나요?',
    a: '얼마든지 다시 진단할 수 있습니다. 다만 너무 빠르게 결과만 보려고 하면 답이 일관되지 않을 수 있으므로, 평소의 메이크업 취향을 떠올리며 솔직하게 답하는 것이 가장 정확합니다.',
  },
  {
    q: '추천 룩과 실제 어울리는 룩이 다른 이유는?',
    a: '메이크업 MBTI는 성향만 보는 진단이라 얼굴형·퍼스널 컬러를 반영하지 않습니다. 같은 ENFP-자연계라도 봄웜·여름쿨 사용자에게는 추천 컬러 톤이 달라집니다. 퍼스널 컬러·얼굴형 진단을 함께 받으면 더 정확합니다.',
  },
  {
    q: '커플·친구와 함께 진단해도 되나요?',
    a: '권장합니다. 자신의 유형과 상대의 "굿매치" 유형, "반대" 유형을 비교해 보면 메이크업 취향 차이를 이해하는 좋은 계기가 됩니다. 함께 비슷한 룩에 도전해 보거나 정반대 룩을 시도해 보는 컨텐츠로도 활용할 수 있습니다.',
  },
]

export const PERSONAL_COLOR_FAQ_BASE: FaqItem[] = [
  {
    q: '온라인 퍼스널 컬러 진단은 정확한가요?',
    a: '오프라인 컬러 드레이프 진단보다는 정확도가 다소 낮지만, 봄웜·여름쿨·가을웜·겨울쿨의 4계절 큰 분류는 70~85% 수준으로 일치합니다. 정밀한 1차/2차 톤 분류가 필요하다면 별도 오프라인 진단을 받아 보고, 평소 옷·메이크업 색 선택 가이드로는 온라인 진단으로도 충분합니다.',
  },
  {
    q: '진단할 때 어떤 환경이 좋은가요?',
    a: '자연광에 가까운 조명에서 메이크업·필터 없이 답하는 것이 가장 정확합니다. 형광등이나 색온도가 강한 조명 아래서는 피부톤이 다르게 보일 수 있으므로 주의가 필요합니다.',
  },
  {
    q: '시즌이 애매하게 걸쳐 있을 때는 어떻게 하나요?',
    a: '실제 사람의 톤은 한 시즌으로 딱 떨어지기보다 인접 시즌에 일부 걸쳐 있는 경우가 많습니다(예: 봄웜+여름쿨 라이트). 이럴 땐 메인 시즌 추천 색을 70%, 보조 시즌의 채도 낮은 색을 30% 정도로 섞어 사용하면 가장 자연스럽습니다.',
  },
  {
    q: '머리 염색이나 화장으로 시즌이 바뀌나요?',
    a: '본인의 피부 언더톤(웜/쿨)은 변하지 않습니다. 다만 머리색·메이크업으로 보이는 인상은 크게 바뀌므로, 자신의 시즌과 반대인 색을 시도하고 싶다면 채도를 낮추거나 페일톤을 활용해 부조화를 줄일 수 있습니다.',
  },
  {
    q: '내 시즌이 아닌 색은 절대 쓰면 안 되나요?',
    a: '그렇지 않습니다. 퍼스널 컬러는 "어울리는 확률을 높여 주는 가이드"이지 절대 규칙이 아닙니다. 어울리지 않는 색이라도 옷의 면적을 줄이거나(머플러·스카프·립 컬러 등 작은 부분) 채도를 조절해 충분히 활용할 수 있습니다.',
  },
]
