// 비포·애프터 슬라이더 + 룩 썸네일 — 9가지 메이크업·럭키 메이크업 공용 (2026-11-02)
// 운영자: 홈에서 빠진 슬라이더를 두 페이지 밑에 "기존처럼" 넣기. 결제 전에 전후 차이를 직접 밀어 보게 한다.
// 휴대폰에서 고르는 그리드가 너무 밀리지 않게 슬라이더 높이를 화면의 절반으로 묶는다(3:4 → 너비 37.5vh).
import BeforeAfterSlider from './BeforeAfterSlider'

export interface CompareLook { id: string; name: string; thumb: string; before: string; after: string }

export default function LookCompare({ looks, active, isEn, onSelect }: { looks: CompareLook[]; active: string; isEn: boolean; onSelect: (id: string) => void }) {
  const cur = looks.find((l) => l.id === active) ?? looks[0]
  return (
    <div className="mt-5">
      <div className="relative mx-auto w-full min-w-[240px] max-w-[37.5vh]">
        <BeforeAfterSlider key={cur.id} beforeSrc={cur.before} afterSrc={cur.after} isEn={isEn} />
        <span className="pointer-events-none absolute bottom-3 left-3 max-w-[60%] truncate bg-white px-2.5 py-1 text-[11px] font-extrabold text-navy">{cur.name}</span>
      </div>
      <ul className="mt-3 flex gap-2.5 overflow-x-auto pb-1 md:justify-center [scrollbar-width:thin]">
        {looks.map((l) => {
          const on = l.id === cur.id
          return (
            <li key={l.id} className="w-14 shrink-0">
              <button type="button" aria-pressed={on} onClick={() => onSelect(l.id)} className="block w-full text-center">
                <img src={l.thumb} alt="" width={48} height={48} loading="lazy" decoding="async" className={`mx-auto h-12 w-12 rounded-full object-cover object-[50%_26%] ring-2 ring-offset-1 ${on ? 'ring-primary-dark' : 'ring-slate-200'}`} />
                <span className={`mt-1 block truncate text-[10.5px] font-bold ${on ? 'text-primary-dark' : 'text-slate-500'}`}>{l.name}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <p className="mt-1.5 text-center text-[11px] text-slate-500 break-keep">{isEn ? 'Drag the handle to compare. The model is AI-generated.' : '손잡이를 밀어 비교해 보세요. 모델은 AI 생성 이미지예요.'}</p>
    </div>
  )
}
