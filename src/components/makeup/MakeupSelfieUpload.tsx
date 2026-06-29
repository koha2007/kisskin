// AI 메이크업 — 셀카 업로드 + 성별/피부타입 (FREE_PIVOT_PLAN §2 / 커밋 P1-1, screen2 시안)
// ────────────────────────────────────────────────────────────────────
// Stitch 시안(screen2.png) 레이아웃 채용: 글래스 카드 안에 원형 업로드 존
// + 카메라 FAB, GENDER / SKIN TYPE 글래스 칩, 프라이버시 문구, "다음" CTA.
// 시안 폰트·색은 전부 우리 토큰으로 교체(Pretendard / navy #070953 / primary #eb4763).
// 글래스 칩 언어는 QuizScreen fullscreen variant 의 옵션 칩을 따라간다.
//
// §8 가짜 이미지 금지: 미리보기는 사용자가 올린 본인 셀카만 표시(AI 생성 X).
//   업로드 전에는 점선 원 + 아이콘 플레이스홀더.
// 프라이버시: "셀카는 분석 후 저장되지 않아요" 문구 유지.

import { useRef, useState } from 'react'

const NAVY = '#070953'
const PRIMARY = '#eb4763'
const screenBg = { background: `linear-gradient(160deg, ${NAVY} 0%, #1a1268 45%, ${PRIMARY} 125%)` }

export type MakeupGender = 'female' | 'male'
export type MakeupSkin = 'dry' | 'oily' | 'combination' | 'sensitive'

const GENDERS: { id: MakeupGender; ko: string; en: string }[] = [
  { id: 'female', ko: '여성', en: 'Female' },
  { id: 'male', ko: '남성', en: 'Male' },
]
const SKINS: { id: MakeupSkin; ko: string; en: string }[] = [
  { id: 'dry', ko: '건성', en: 'Dry' },
  { id: 'oily', ko: '지성', en: 'Oily' },
  { id: 'combination', ko: '복합성', en: 'Combination' },
  { id: 'sensitive', ko: '민감성', en: 'Sensitive' },
]

interface Props {
  onNext: (data: { photo: string; gender: MakeupGender; skin: MakeupSkin }) => void
  onBack: () => void
  isEn?: boolean
}

export default function MakeupSelfieUpload({ onNext, onBack, isEn = false }: Props) {
  const [photo, setPhoto] = useState<string | null>(null)
  const [gender, setGender] = useState<MakeupGender>('female')
  const [skin, setSkin] = useState<MakeupSkin>('dry')
  const fileRef = useRef<HTMLInputElement>(null)

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setPhoto(URL.createObjectURL(f))
  }

  const ready = !!photo

  // 글래스 칩 (선택형) — QuizScreen 옵션 칩과 동일 언어
  const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all active:scale-[0.97] ${
        active
          ? 'bg-white text-navy shadow-lg shadow-black/20'
          : 'bg-white/12 text-white border border-white/25 backdrop-blur-md hover:bg-white/20'
      }`}
    >
      {children}
    </button>
  )

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

          <hr className="my-6 border-white/15" />

          {/* GENDER */}
          <p className="text-xs font-bold tracking-[0.2em] text-white/55 mb-3 uppercase">{isEn ? 'Gender' : 'Gender'}</p>
          <div className="flex gap-2.5 mb-6">
            {GENDERS.map((g) => (
              <div key={g.id} className="flex-1">
                <Chip active={gender === g.id} onClick={() => setGender(g.id)}>
                  <span className="block w-full text-center">{isEn ? g.en : g.ko}</span>
                </Chip>
              </div>
            ))}
          </div>

          {/* SKIN TYPE */}
          <p className="text-xs font-bold tracking-[0.2em] text-white/55 mb-3 uppercase">{isEn ? 'Skin type' : 'Skin type'}</p>
          <div className="grid grid-cols-2 gap-2.5">
            {SKINS.map((s) => (
              <Chip key={s.id} active={skin === s.id} onClick={() => setSkin(s.id)}>
                <span className="block w-full text-center">{isEn ? s.en : s.ko}</span>
              </Chip>
            ))}
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
          onClick={() => photo && onNext({ photo, gender, skin })}
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
