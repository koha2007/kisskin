import { supabase } from './supabase'

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',')
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const binary = atob(parts[1])
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

export async function saveSharedResult(
  resultImage: string,
  report: string,
  gender: string,
  styles: string[],
): Promise<string> {
  const id = crypto.randomUUID()

  // 1. Upload image to Supabase Storage
  const blob = dataUrlToBlob(resultImage)
  const { error: uploadError } = await supabase.storage
    .from('results')
    .upload(`${id}.jpg`, blob, { contentType: 'image/jpeg', upsert: false })

  if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)

  // 2. Insert metadata - report가 중첩 JSON 문자열일 수 있으므로 완전히 풀기
  let reportJson: object
  try {
    let parsed = JSON.parse(report)
    // 이중 stringify된 경우 한번 더 파싱
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed) } catch { /* keep as-is */ }
    }
    reportJson = parsed && typeof parsed === 'object' ? parsed : { raw: report }
  } catch {
    reportJson = { raw: report }
  }

  const { error: dbError } = await supabase
    .from('shared_results')
    .insert({
      id,
      image_path: `${id}.jpg`,
      report: reportJson,
      gender,
      styles,
    })

  if (dbError) throw new Error(`Save failed: ${dbError.message}`)

  return id
}

export interface SharedResultData {
  imageUrl: string
  report: { analysis?: { gender?: string; tone?: string; toneDetail?: string; advice?: string }; products?: { category: string; name: string; brand: string; price: string; reason: string }[] }
  gender: string
  styles: string[]
}

export async function loadSharedResult(id: string): Promise<SharedResultData | null> {
  // 2026-07-26 보안: 테이블 직접 조회를 막았다(0003 마이그레이션).
  //   그 전엔 익명 키로 id 없이 select * 를 던지면 저장된 결과가 전부 돌아왔다
  //   — 이용자 전원의 리포트와 사진 경로가 열려 있었다. 익명 키는 브라우저
  //   번들에 들어 있으니 사실상 공개다. 이제 id 로 한 건만 돌려주는
  //   SECURITY DEFINER 함수만 열려 있고, 목록은 훑을 수 없다.
  //   사진 자체는 공개 버킷의 /object/public/ 경로라 그대로 뜬다(RLS 밖).
  //
  //   ※ 아래 폴백은 **배포 순서 때문에** 있다. 마이그레이션(운영자가 SQL
  //     Editor 에서 실행)과 이 코드 배포 사이에 시차가 생기는데, 어느 쪽이
  //     먼저여도 공유 페이지가 깨지면 안 된다. 마이그레이션 적용을 확인한
  //     뒤에는 폴백을 지워도 된다(지워야 구버전 경로가 완전히 닫힌다).
  type Row = { image_path: string; report: SharedResultData['report']; gender: string; styles: string[] }
  let data: Row | null = null

  const { data: rows, error } = await supabase.rpc('get_shared_result', { p_id: id })
  if (!error) {
    data = (Array.isArray(rows) ? rows[0] : rows) ?? null
  } else {
    // 함수가 아직 없는 경우(마이그레이션 전)에만 옛 경로로 조회한다.
    const legacy = await supabase.from('shared_results').select('*').eq('id', id).single()
    if (legacy.error || !legacy.data) return null
    data = legacy.data
  }
  if (!data) return null

  const { data: urlData } = supabase.storage
    .from('results')
    .getPublicUrl(data.image_path)

  // report가 문자열로 저장된 경우 파싱 (이중 stringify 가능성 처리)
  let report = data.report
  if (typeof report === 'string') {
    try {
      report = JSON.parse(report)
      // Handle double-stringified case
      if (typeof report === 'string') {
        try { report = JSON.parse(report) } catch { /* keep as-is */ }
      }
    } catch { /* keep as-is */ }
  }

  return {
    imageUrl: urlData.publicUrl,
    report,
    gender: data.gender,
    styles: data.styles as string[],
  }
}
