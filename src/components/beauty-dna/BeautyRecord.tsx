// 내 뷰티 기록 — 무료 도구 4종의 진단 결과를 한 덩어리로 보여준다.
// (SUBSCRIBER_GROWTH_PLAN P1)
//
// 마이페이지의 첫 화면이다. 그전까지 마이페이지엔 이메일·비밀번호·크레딧·탈퇴뿐이라
// **가입한 사람이 다시 열어볼 이유가 한 줄도 없었다.** 여기가 그 이유를 만드는 자리다.
//
// 빈 칸을 숨기지 않고 "아직 안 한 진단"으로 남겨 두는 게 핵심이다 — 채우고 싶게
// 만드는 것이 다음 방문을 부른다. 4개를 다 채우면 통합 해석(/tools/beauty-dna/)으로 보낸다.

import { useEffect, useState } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import { useBeautyDna } from '../../hooks/useBeautyDna'
import { dnaTypeDisplay } from '../../lib/beauty-dna/display'
import { DNA_FIELDS, DNA_FIELD_META, type DnaField } from '../../lib/beauty-dna/types'
import { listLooks, type MakeupLook } from '../../lib/makeup/looks'

interface Props {
  /** 마이페이지 카드 안에 들어갈 때처럼 바깥이 이미 흰 배경이면 자체 배경을 끈다. */
  bare?: boolean
}

export function BeautyRecord({ bare = false }: Props) {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const { dna, done, total } = useBeautyDna()

  const [looks, setLooks] = useState<MakeupLook[]>([])

  // 로그인한 사람의 저장된 룩. 무로그인·표 없음·실패는 전부 빈 배열이라 화면이 그대로다.
  useEffect(() => {
    let alive = true
    void listLooks(6).then((r) => { if (alive) setLooks(r) })
    return () => { alive = false }
  }, [])

  const href = (path: string) => (isEn ? `/en${path}` : path)
  const label = (f: DnaField) => (isEn ? DNA_FIELD_META[f].labelEn : DNA_FIELD_META[f].labelKo)

  return (
    <div style={bare ? undefined : { background: '#fff', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: '#6b6f8c' }}>
          {isEn ? `${done} of ${total} done` : `${total}개 중 ${done}개 완료`}
        </span>
        {done > 0 && (
          <a href={href('/tools/beauty-dna/')} style={{ fontSize: 13, fontWeight: 600, color: '#eb4763', textDecoration: 'none' }}>
            {done === total
              ? (isEn ? 'See my full reading →' : '통합 해석 보기 →')
              : (isEn ? 'See what I have →' : '지금까지 결과 보기 →')}
          </a>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        {DNA_FIELDS.map((f) => {
          const d = dnaTypeDisplay(f, dna, isEn)
          // 빈 칸도 그린다 — 비어 있다는 사실 자체가 다음 행동을 부른다.
          return (
            <a
              key={f}
              href={href(DNA_FIELD_META[f].path)}
              style={{
                display: 'block',
                padding: '12px 14px',
                borderRadius: 10,
                textDecoration: 'none',
                border: d ? `1px solid ${d.accent}33` : '1px dashed rgba(7,9,83,0.2)',
                background: d ? `${d.accent}0f` : 'transparent',
              }}
            >
              <div style={{ fontSize: 11, color: '#6b6f8c', marginBottom: 4 }}>{label(f)}</div>
              {d ? (
                <div style={{ fontSize: 14, fontWeight: 700, color: '#070953', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span aria-hidden>{d.emoji}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                </div>
              ) : (
                <div style={{ fontSize: 13, fontWeight: 600, color: '#eb4763' }}>
                  {isEn ? 'Take it →' : '진단하기 →'}
                </div>
              )}
            </a>
          )
        })}
      </div>

      {/* 내가 저장한 AI 메이크업 룩 — 크레딧을 쓴 결과물이 남는 유일한 자리다.
          하나도 없으면 아예 그리지 않는다(빈 진단 칸과 달리, 여긴 유료라 권하지 않는다). */}
      {looks.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#070953' }}>
              {isEn ? 'My makeup looks' : '내 메이크업 룩'}
            </span>
            <a href={href('/analysis/')} style={{ fontSize: 13, fontWeight: 600, color: '#eb4763', textDecoration: 'none' }}>
              {isEn ? 'Make another →' : '새로 만들기 →'}
            </a>
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {looks.map((l) => (
              <a
                key={l.id}
                href={`/result/${l.id}`}
                style={{ flex: '0 0 auto', width: 84, textDecoration: 'none' }}
              >
                <img
                  src={l.imageUrl}
                  alt={l.styleName ?? ''}
                  loading="lazy"
                  style={{ width: 84, height: 105, objectFit: 'cover', borderRadius: 8, display: 'block', background: '#f1f0f2' }}
                />
                {l.styleName && (
                  <div style={{ fontSize: 11, color: '#6b6f8c', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.styleName}
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
