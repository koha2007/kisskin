// 인앱 브라우저용 — 다운로드가 막히는 곳에서도 사진 길게 누르기 저장은 된다
// (9룩 컬렉션 · 럭키 메이크업 9장 공용, 2026-10-29 MakeupCollection 에서 분리)
export default function LongPressSaveViewer({ images, isEn, onClose }: { images: string[]; isEn: boolean; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 px-5 pb-10" role="dialog" aria-modal="true">
      <div className="sticky top-0 -mx-5 flex items-center gap-3 bg-black/90 px-5 py-4">
        <p className="flex-1 text-[14px] font-bold text-white break-keep">
          {isEn ? 'Press and hold each image to save it' : '사진을 꾹 눌러서 하나씩 저장하세요'}
        </p>
        <button onClick={onClose} aria-label={isEn ? 'Close' : '닫기'} className="material-symbols-outlined text-white">close</button>
      </div>
      <p className="mb-4 text-[12px] text-white/60 break-keep">
        {isEn ? 'Or open this page in Safari/Chrome, or use "Email all 10 to me".' : '안 되면 사파리·크롬으로 열거나 "내 메일로 10장 받기"를 쓰세요.'}
      </p>
      <div className="mx-auto flex max-w-sm flex-col gap-4">
        {images.map((src, i) => (
          <img key={i} src={src} alt={i === 0 ? (isEn ? 'Grid image' : '모아보기') : `${i}`} className="w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
