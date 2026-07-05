// AI 메이크업 — 셀카 업로드 (2026-07-05: 성별/피부타입 제거, 단일 라인업)
// ────────────────────────────────────────────────────────────────────
// 글래스 카드 안에 원형 업로드 존 + 카메라 FAB, 촬영 가이드, 프라이버시 문구, "다음" CTA.
// 폰트·색은 우리 토큰(Pretendard / navy #070953 / primary #eb4763).
//
// GENDER/SKIN TYPE 칩 제거: 성별 분기 없이 단일 9룩 라인업으로 전환했고,
//   SKIN TYPE 은 프롬프트에 실제로 쓰이지 않던 장식 UI 였다(수집만 하고 버려짐).
//   → 업로드 화면을 "셀카 한 장"이라는 단일 행동에 집중시킨다.
//   (실제 개인화에 연결할 때 재도입 가능 — git 히스토리 보관)
//
// §8 가짜 이미지 금지: 미리보기는 사용자가 올린 본인 셀카만 표시(AI 생성 X).
//   업로드 전에는 점선 원 + 아이콘 플레이스홀더.
// 프라이버시: "셀카는 분석 후 저장되지 않아요" 문구 유지.

import { useRef, useState } from 'react'

const NAVY = '#070953'
const PRIMARY = '#eb4763'
const screenBg = { background: `linear-gradient(160deg, ${NAVY} 0%, #1a1268 45%, ${PRIMARY} 125%)` }

interface Props {
  onNext: (data: { photo: string }) => void
  onBack: () => void
  isEn?: boolean
}

export default function MakeupSelfieUpload({ onNext, onBack, isEn = false }: Props) {
  const [photo, setPhoto] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setPhoto(URL.createObjectURL(f))
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
        <div className="rounded-3xl bg-white/10 border border-white/15 backdrop-blur-md p-6 shadow-xl shadow-black/20">
          {/* 원형 업로드 존 */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-32 h-32 rounded-full border-2 border-dashed border-white/45 flex items-center justify-center overflow-hidden bg-white/5 active:scale-[0.97] transition"
                aria-label={isEn ? 'Upload selfie' : '셀카 올리기'}
              >
                {photo ? (
                  <img src={photo} alt={isEn ? 'Your selfie' : '내 셀카'} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-5xl text-white/70" style={{ fontVariationSettings: "'FILL' 1" }}>
                    face
                  </span>
                )}
              </button>
              {/* 카메라 FAB */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-1 right-1 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition"
                style={{ background: PRIMARY }}
                aria-label={isEn ? 'Choose photo' : '사진 선택'}
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  photo_camera
                </span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            </div>

            <h2 className="mt-5 text-xl font-extrabold tracking-tight">
              {isEn ? 'Upload your selfie' : '셀카를 올려주세요'}
            </h2>
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
        style={{ background: 'linear-gradient(to top, rgba(7,9,83,0.95) 60%, transparent)' }}
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
