// ⚠️ DEV/TEST ONLY — MediaPipe Stage 2 운영자 셀카 확인용 임시 페이지.
// 결제 게이트를 건너뛰고 MakeupStudio(9종 온디바이스)를 바로 마운트한다.
// main 병합 전 pages/studio-test/ 폴더째 삭제할 것.
import { useState } from 'react'
import MakeupStudio from '../../src/components/MakeupStudio'
import type { Gender } from '../../src/lib/makeup/looksConfig'

export default function Page() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [gender, setGender] = useState<Gender>('female')

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#fff7ed', color: '#9a3412', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
        ⚠️ MediaPipe Stage 2 테스트 페이지 (결제 없이 9종 확인용 · 병합 전 삭제)
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {(['female', 'male'] as Gender[]).map((g) => (
          <button key={g} onClick={() => setGender(g)}
            style={{ flex: 1, padding: '10px', borderRadius: 10, border: gender === g ? '2px solid #2a2d8a' : '1px solid #ddd',
              background: gender === g ? '#eef0ff' : '#fff', fontWeight: gender === g ? 700 : 500, cursor: 'pointer' }}>
            {g === 'female' ? '여성' : '남성'}
          </button>
        ))}
      </div>

      <label style={{ display: 'block', padding: '12px', textAlign: 'center', border: '1px dashed #aaa', borderRadius: 10, marginBottom: 16, cursor: 'pointer' }}>
        {photo ? '📷 다른 셀카 선택' : '📷 셀카 업로드 (카메라/갤러리)'}
        <input type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
      </label>

      {photo && <MakeupStudio key={`${gender}-${photo.slice(0, 32)}`} photo={photo} gender={gender} onRender={() => {}} />}
    </div>
  )
}
