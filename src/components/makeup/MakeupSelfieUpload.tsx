// AI 메이크업 — 셀카 업로드 (2026-07-05: 성별/피부타입 제거, 단일 라인업)
// ────────────────────────────────────────────────────────────────────
// 3:4 업로드 프레임 + 촬영/앨범 버튼 2개, 촬영 가이드, 프라이버시 문구, "다음" CTA.
// 색·모서리·버튼 언어는 theme.ts 한 곳에서 온다(5개 화면 공용).
//
// GENDER/SKIN TYPE 칩 제거: 성별 분기 없이 단일 9룩 라인업으로 전환했고,
//   SKIN TYPE 은 프롬프트에 실제로 쓰이지 않던 장식 UI 였다(수집만 하고 버려짐).
//   → 업로드 화면을 "셀카 한 장"이라는 단일 행동에 집중시킨다.
//   (실제 개인화에 연결할 때 재도입 가능 — git 히스토리 보관)
//
// 2026-07-27 브랜드 정렬: 원형 점선 존 + 카메라 FAB 조합을 버렸다.
//   ① 동그라미=앨범 / FAB=카메라 라는 매핑이 화면 어디에도 안 적혀 있어, 홈 히어로의
//      "사진기 아이콘인데 앨범이 열린다" 와 같은 종류의 혼란을 만들고 있었다.
//   ② 결과물이 3:4 인데 업로드 미리보기만 원형이라 프레이밍 감이 안 잡혔다.
//   → 결과와 같은 3:4 프레임 + 글자가 붙은 버튼 2개(촬영/앨범)로 명시한다.
//
// §8 가짜 이미지 금지: 미리보기는 사용자가 올린 본인 셀카만 표시(AI 생성 X).
// 프라이버시: "셀카는 분석 후 저장되지 않아요" 문구 유지.

import { useState } from 'react'
import { pickImage } from '../../lib/nativePicker'
import {
  screenBg, surfaceStyle, footerScrim, BORDER, SURFACE,
  btnPrimary, btnPrimaryStyle, btnGhost, btnGhostStyle, chip, stepBar,
} from './theme'

interface Props {
  onNext: (data: { photo: string }) => void
  onBack: () => void
  isEn?: boolean
  /** 홈에서 특정 룩을 골라 들어온 경우 그 룩 이름 — 업로드 화면에 안내 칩으로 표시 */
  hintLabel?: string
  /** 미로그인이면 로그인 링크(?next= 포함). 사진을 올리기 전에 미리 알려준다. */
  loginHref?: string
}

export default function MakeupSelfieUpload({ onNext, onBack, isEn = false, hintLabel, loginHref }: Props) {
  const [photo, setPhoto] = useState<string | null>(null)

  // pickImage: 앱 웹뷰에선 네이티브 픽커(카메라/갤러리 각각), 브라우저에선
  // 클릭마다 일회용 <input> 을 만든다. 숨긴 input 재사용은 안드로이드 웹뷰에서
  // 첫 닫힘 이후 얼어붙는 버그(2026-07-16 실기기)가 있어 금지.
  const pick = (mode: 'gallery' | 'camera') => {
    pickImage(mode).then((f) => {
      if (!f) return
      // 교체 시 이전 미리보기만 해제한다. 현재 photo 는 언마운트 후에도 다음 단계
      // (MakeupFlow 의 이미지 로드 · 결과화면 BEFORE)에서 계속 쓰이므로 해제하면 안 된다.
      setPhoto((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(f)
      })
    })
  }

  const ready = !!photo

  return (
    <div className="min-h-[100dvh] flex flex-col font-display text-white" style={screenBg}>
      {/* 상단 */}
      <header className="px-5 pt-5 flex items-center gap-3 max-w-xl w-full mx-auto">
        <button
          onClick={onBack}
          aria-label={isEn ? 'Back' : '뒤로'}
          className="shrink-0 -ml-1 p-1 text-white/80 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-sm font-bold uppercase tracking-[0.18em] text-white/85">
          {isEn ? 'AI Makeup' : 'AI 메이크업'}
        </h1>
        <div className="shrink-0 flex items-center gap-1" aria-hidden>
          <span className={stepBar(false)} />
          <span className={stepBar(true)} />
          <span className={stepBar(false)} />
        </div>
      </header>

      <main className="flex-1 flex flex-col px-5 pt-7 pb-4 max-w-xl w-full mx-auto">
        {/* 미로그인 안내 — 생성 직전이 아니라 여기서 미리 알려야 셀카를 올린 뒤
            로그인 화면으로 튕겨 처음부터 다시 하는 헛수고가 없다.
            문구는 "로그인하면 무료"(혜택)가 아니라 "로그인 필수"(요건)로 못박는다.
            혜택으로만 읽히면 로그인을 건너뛸 수 있는 줄 알고 진행하다 게이트에 걸린다. */}
        {loginHref && (
          <a
            href={loginHref}
            className="mb-6 flex items-center gap-2.5 px-4 py-3 transition-colors hover:brightness-110"
            style={surfaceStyle}
          >
            <span className="material-symbols-outlined text-xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock
            </span>
            <span className="flex-1 text-[13px] font-semibold leading-snug break-keep">
              {isEn ? (
                <>
                  <span className="font-extrabold">Login required</span> to generate AI makeup.
                  <span className="block text-white/65 text-[11.5px] font-medium mt-0.5">1st try free · no card needed</span>
                </>
              ) : (
                <>
                  AI 메이크업 생성은 <span className="font-extrabold">로그인 필수</span>예요.
                  <span className="block text-white/65 text-[11.5px] font-medium mt-0.5">로그인하면 무료 1회 · 카드 필요 없어요</span>
                </>
              )}
            </span>
            <span className="shrink-0 px-3 py-1.5 text-[12px] font-extrabold" style={{ background: 'rgba(235,71,99,1)' }}>
              {isEn ? 'Log in' : '로그인'}
            </span>
          </a>
        )}

        <h2 className="text-[24px] font-extrabold leading-tight tracking-[-0.02em] break-keep">
          {isEn ? 'Upload your selfie' : '셀카를 올려주세요'}
        </h2>
        {hintLabel && (
          <span className={`${chip} mt-2.5 self-start`} style={surfaceStyle}>
            <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
            {(isEn ? 'Selected look · ' : '선택한 룩 · ') + hintLabel}
          </span>
        )}

        {/* 업로드 프레임 — 결과물과 같은 3:4. 누르면 앨범(가장 흔한 경로)이 열리고,
            촬영은 아래 버튼으로 명시한다. */}
        <button
          type="button"
          onClick={() => pick('gallery')}
          aria-label={isEn ? 'Choose from album' : '앨범에서 사진 선택'}
          className="mt-5 relative w-full max-w-[200px] mx-auto aspect-[3/4] rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-2.5 transition-colors hover:brightness-110"
          style={{ background: SURFACE, border: photo ? `1px solid ${BORDER}` : `1px dashed rgba(255,255,255,0.3)` }}
        >
          {photo ? (
            <img src={photo} alt={isEn ? 'Your selfie' : '내 셀카'} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <>
              <span className="material-symbols-outlined text-5xl text-white/45" style={{ fontVariationSettings: "'FILL' 1" }}>
                face
              </span>
              <span className="text-[12px] font-bold text-white/55">
                {isEn ? 'Tap to choose a photo' : '눌러서 사진 고르기'}
              </span>
            </>
          )}
        </button>

        {/* 두 경로를 글자로 명시 — 아이콘만으로는 카메라/앨범 구분이 안 보인다 */}
        <div className="mt-3 grid grid-cols-2 gap-2 w-full max-w-[200px] mx-auto">
          <button type="button" onClick={() => pick('camera')} className={btnGhost} style={btnGhostStyle}>
            <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
            {isEn ? 'Camera' : '촬영'}
          </button>
          <button type="button" onClick={() => pick('gallery')} className={btnGhost} style={btnGhostStyle}>
            <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>photo_library</span>
            {isEn ? 'Album' : '앨범'}
          </button>
        </div>

        {/* 셀카 가이드 — 좋은 입력이 결과 품질의 절반 (측면/모자/그림자 대응) */}
        <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-2 text-[12.5px] text-white/70 break-keep">
          {(isEn
            ? ['Face the camera', 'No hat or sunglasses', 'Keep hair off your face', 'Good lighting']
            : ['정면을 바라보고', '모자·선글라스 없이', '앞머리는 넘기고', '밝은 곳에서']
          ).map((t) => (
            <li key={t} className="flex items-start gap-1.5">
              <span
                className="material-symbols-outlined text-[15px] text-white/40 mt-[2px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </main>

      {/* 프라이버시 + CTA */}
      <footer className="sticky bottom-0 px-5 pt-4 pb-6 max-w-xl w-full mx-auto" style={footerScrim}>
        <p className="text-center text-[11.5px] font-medium text-white/60 mb-3 inline-flex w-full items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield
          </span>
          {isEn ? 'Your selfie is never stored after analysis' : '셀카는 분석 후 저장되지 않아요'}
        </p>
        <button
          onClick={() => photo && onNext({ photo })}
          disabled={!ready}
          className={btnPrimary}
          style={btnPrimaryStyle}
        >
          {isEn ? 'Next' : '다음'}
        </button>
      </footer>
    </div>
  )
}
