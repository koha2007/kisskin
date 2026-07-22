import { useEffect, useRef, useState, useCallback } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { looksFor, type Gender, type Look } from '../lib/makeup/looksConfig'
import { initEngine, renderLook, type Engine } from '../lib/makeup/looksEngine'

interface Props {
  photo: string
  gender: Gender
  /** 매 렌더마다 현재 룩 이미지(jpeg dataURL)+표시명을 상위로 전달 → 공유/저장/이메일 단일 소스 */
  onRender: (image: string, lookName: string) => void
}

// 온디바이스 메이크업 스튜디오: 성별별 "K-뷰티 풀 메이크업" 1장만 크게 렌더.
// 9종 선택 폐기 — 모든 기술이 1장에 통합돼 있다. 얼굴은 원본 픽셀 위 합성이라 100% 보존.
export default function MakeupStudio({ photo, gender, onRender }: Props) {
  const { locale } = useI18n()
  const ko = locale === 'ko'
  const look = looksFor(gender)[0]   // 성별별 풀 메이크업 1장

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const engineRef = useRef<Engine | null>(null)

  const [status, setStatus] = useState(ko ? '메이크업 엔진 준비 중…' : 'Preparing makeup engine…')
  const [ready, setReady] = useState(false)
  const [engineErr, setEngineErr] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)
  const [hatWarning, setHatWarning] = useState(false)
  const [noFace, setNoFace] = useState(false)

  const draw = useCallback((look: Look) => {
    const canvas = canvasRef.current, img = imgRef.current, engine = engineRef.current
    if (!canvas || !img || !engine) return
    setRendering(true)
    // 스피너가 먼저 그려지도록 다음 프레임에 무거운 합성을 실행(헤어 룩 대비)
    setTimeout(() => {
      try {
        const report = renderLook(canvas, img, look, engine)
        setNoFace(!report.face)
        setHatWarning(!!look.hair && report.hatWarning)
        if (report.face) {
          const image = canvas.toDataURL('image/jpeg', 0.92)
          onRender(image, ko ? look.nameKo : look.name)
        }
      } catch (e) {
        console.warn('[MakeupStudio] render failed', e)
      } finally {
        setRendering(false)
      }
    }, 30)
  }, [ko, onRender])

  // 마운트 1회: 사진 로드 + 엔진 init → 첫 룩 자동 렌더
  useEffect(() => {
    let cancelled = false
    const img = new Image()
    const loadImg = new Promise<void>((resolve) => {
      img.onload = () => { imgRef.current = img; resolve() }
      img.onerror = () => resolve()
      img.src = photo
    })
    ;(async () => {
      try {
        const [, engine] = await Promise.all([loadImg, initEngine((s) => !cancelled && setStatus(s))])
        if (cancelled) return
        engineRef.current = engine
        setReady(true)
        if (look) draw(look)
      } catch (e) {
        console.error('[MakeupStudio] engine init failed', e)
        if (!cancelled) setEngineErr(ko
          ? '메이크업 엔진 로드에 실패했어요. 네트워크 확인 후 새로고침 해주세요.'
          : 'Failed to load the makeup engine. Check your network and refresh.')
      }
    })()
    return () => { cancelled = true }
    // photo/gender 가 바뀌면 재초기화(분석 1회당 1마운트라 사실상 1회)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo, gender])

  return (
    <div className="makeup-studio">
      <div className="makeup-studio-stage" style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#f1f1f4', minHeight: 240 }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: ready && !noFace ? 'block' : 'none' }} />
        {(!ready || rendering) && !engineErr && (
          <div className="makeup-studio-overlay" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#555', background: 'rgba(255,255,255,0.7)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 36, animation: 'spin 1s linear infinite' }}>progress_activity</span>
            <p style={{ margin: 0, fontSize: 14 }}>
              {!ready ? status : (look?.hair ? (ko ? '헤어 컬러 적용 중… (몇 초 걸려요)' : 'Applying hair color… (a few seconds)') : (ko ? '적용 중…' : 'Applying…'))}
            </p>
          </div>
        )}
        {engineErr && (
          <div style={{ padding: 24, textAlign: 'center', color: '#b91c1c' }}>{engineErr}</div>
        )}
        {ready && noFace && !engineErr && (
          <div style={{ padding: 24, textAlign: 'center', color: '#b45309' }}>
            {ko ? '얼굴을 찾지 못했어요. 정면이 잘 보이는 셀카로 다시 시도해 주세요.' : 'No face detected. Please try a clear, front-facing selfie.'}
          </div>
        )}
      </div>

      {hatWarning && (
        <div className="makeup-hat-note" style={{ marginTop: 10, padding: '10px 12px', borderRadius: 10, background: '#fff7ed', color: '#9a3412', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>info</span>
          <span>{ko ? '모자/두건이 감지돼 헤어 컬러는 적용하지 않았어요. 모자를 벗은 사진이면 헤어 색도 적용돼요. (메이크업은 정상 적용)' : 'A hat was detected, so hair color was skipped. Use a photo without a hat to apply hair color too. (Makeup is applied normally.)'}</span>
        </div>
      )}

      {ready && !noFace && !engineErr && look && (
        <p className="makeup-look-caption" style={{ marginTop: 12, textAlign: 'center', fontSize: 13.5, color: '#555' }}>
          <span style={{ fontWeight: 700, color: '#434c82' }}>{ko ? look.nameKo : look.name}</span>
          {ko && <span style={{ display: 'block', fontSize: 12, opacity: 0.8, marginTop: 2 }}>{look.point}</span>}
        </p>
      )}
    </div>
  )
}
