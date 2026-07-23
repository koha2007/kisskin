// AI 메이크업 — 셀카 업로드 (2026-07-05: 성별/피부타입 제거, 단일 라인업)
// ────────────────────────────────────────────────────────────────────
// 글래스 카드 안에 원형 업로드 존 + 카메라 FAB, 촬영 가이드, 프라이버시 문구, "다음" CTA.
// 폰트·색은 우리 토큰(Pretendard / navy #232a52 / primary #d8503c).
//
// GENDER/SKIN TYPE 칩 제거: 성별 분기 없이 단일 9룩 라인업으로 전환했고,
//   SKIN TYPE 은 프롬프트에 실제로 쓰이지 않던 장식 UI 였다(수집만 하고 버려짐).
//   → 업로드 화면을 "셀카 한 장"이라는 단일 행동에 집중시킨다.
//   (실제 개인화에 연결할 때 재도입 가능 — git 히스토리 보관)
//
// §8 가짜 이미지 금지: 미리보기는 사용자가 올린 본인 셀카만 표시(AI 생성 X).
//   업로드 전에는 점선 원 + 아이콘 플레이스홀더.
// 프라이버시: "셀카는 분석 후 저장되지 않아요" 문구 유지.

import { useState } from 'react'
import { pickImage } from '../../lib/nativePicker'

const NAVY = '#232a52'
const PRIMARY = '#d8503c'
const screenBg = { background: `linear-gradient(160deg, ${NAVY} 0%, #1a1268 45%, ${PRIMARY} 125%)` }

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
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-90 transition"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-base font-bold tracking-tight">{isEn ? 'AI Makeup' : 'AI 메이크업'}</h1>
        <div className="shrink-0 flex items-center gap-1.5" aria-hidden>
          <span className="w-2 h-2 rounded-full bg-white/30" />
          <span className="w-2 h-2 rounded-full bg-white" />
          <span className="w-2 h-2 rounded-full bg-white/30" />
        </div>
      </header>

      {/* 본문: 글래스 카드 */}
      <main className="flex-1 flex flex-col px-5 pt-6 pb-4 max-w-xl w-full mx-auto">
        {/* 미로그인 안내 — 생성 직전이 아니라 여기서 미리 알려야 셀카를 올린 뒤
            로그인 화면으로 튕겨 처음부터 다시 하는 헛수고가 없다.
            문구는 "로그인하면 무료"(혜택)가 아니라 "로그인 필수"(요건)로 못박는다.
            혜택으로만 읽히면 로그인을 건너뛸 수 있는 줄 알고 진행하다 게이트에 걸린다. */}
        {loginHref && (
          <a
            href={loginHref}
            className="mb-4 flex items-center gap-2.5 rounded-2xl bg-white/15 border border-white/25 px-4 py-3 active:scale-[0.99] transition"
          >
            <span className="material-symbols-outlined text-xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock
            </span>
            <span className="flex-1 text-[13px] font-semibold leading-snug">
              {isEn ? (
                <>
                  <span className="font-extrabold">Login required</span> to generate AI makeup.
                  <span className="block text-white/70 text-[11.5px] font-medium mt-0.5">1st try free · no card needed</span>
                </>
              ) : (
                <>
                  AI 메이크업 생성은 <span className="font-extrabold">로그인 필수</span>예요.
                  <span className="block text-white/70 text-[11.5px] font-medium mt-0.5">로그인하면 무료 1회 · 카드 필요 없어요</span>
                </>
              )}
            </span>
            <span className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-extrabold" style={{ background: PRIMARY }}>
              {isEn ? 'Log in' : '로그인'}
            </span>
          </a>
        )}

        <div className="rounded-3xl bg-white/10 border border-white/15 backdrop-blur-md p-6 shadow-xl shadow-black/20">
          {/* 원형 업로드 존 */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <button
                type="button"
                onClick={() => pick('gallery')}
                className="w-32 h-32 rounded-full border-2 border-dashed border-white/45 flex items-center justify-center overflow-hidden bg-white/5 active:scale-[0.97] transition"
                aria-label={isEn ? 'Choose from album' : '앨범에서 사진 선택'}
              >
                {photo ? (
                  <img src={photo} alt={isEn ? 'Your selfie' : '내 셀카'} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-5xl text-white/70" style={{ fontVariationSettings: "'FILL' 1" }}>
                    face
                  </span>
                )}
              </button>
              {/* 카메라 FAB — 앨범이 아니라 전면(셀카) 카메라를 연다 */}
              <button
                type="button"
                onClick={() => pick('camera')}
                className="absolute bottom-1 right-1 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition"
                style={{ background: PRIMARY }}
                aria-label={isEn ? 'Take a selfie' : '카메라로 셀카 촬영'}
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  photo_camera
                </span>
              </button>
            </div>

            {/* 두 경로를 글자로도 명시 — 아이콘만으로는 카메라/앨범 구분이 안 보인다 */}
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => pick('camera')}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3.5 py-1.5 text-xs font-bold active:scale-95 transition"
              >
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                {isEn ? 'Take selfie' : '카메라로 촬영'}
              </button>
              <button
                type="button"
                onClick={() => pick('gallery')}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3.5 py-1.5 text-xs font-bold active:scale-95 transition"
              >
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>photo_library</span>
                {isEn ? 'From album' : '앨범에서 선택'}
              </button>
            </div>

            <h2 className="mt-5 text-xl font-extrabold tracking-tight">
              {isEn ? 'Upload your selfie' : '셀카를 올려주세요'}
            </h2>
            {hintLabel && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3 py-1 text-xs font-semibold">
                <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                {(isEn ? 'Selected look · ' : '선택한 룩 · ') + hintLabel}
              </span>
            )}
            {/* 셀카 가이드 — 좋은 입력이 결과 품질의 절반 (측면/모자/그림자 대응) */}
            <ul className="mt-3 flex flex-col gap-1.5 text-[13px] text-white/75 w-full max-w-[16rem]">
              {(isEn
                ? ['Face the camera', 'No hat or sunglasses', 'Keep hair off your face', 'Good lighting']
                : ['정면을 바라보고', '모자·선글라스 없이', '머리카락이 얼굴을 가리지 않게', '밝은 곳에서']
              ).map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-[16px] text-white/55"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* 프라이버시 + CTA */}
      <footer
        className="sticky bottom-0 px-5 pt-3 pb-6 max-w-xl w-full mx-auto"
        style={{ background: 'linear-gradient(to top, rgba(35,42,82,0.95) 60%, transparent)' }}
      >
        <p className="text-center text-xs font-medium text-white/75 mb-3 inline-flex w-full items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield
          </span>
          {isEn ? 'Your selfie is never stored after analysis' : '셀카는 분석 후 저장되지 않아요'}
        </p>
        <button
          onClick={() => photo && onNext({ photo })}
          disabled={!ready}
          className="w-full rounded-full py-4 font-extrabold text-[15px] text-white shadow-xl shadow-primary/30 active:scale-[0.98] transition-transform disabled:opacity-40 disabled:active:scale-100"
          style={{ background: PRIMARY }}
        >
          {isEn ? 'Next' : '다음'}
        </button>
      </footer>
    </div>
  )
}
