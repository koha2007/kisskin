// 내 메이크업 룩 — 저장/공유한 AI 메이크업 결과를 계정에 남긴다.
// (SUBSCRIBER_GROWTH_PLAN P1 · 표 정의는 supabase/migrations/0006_makeup_look.sql)
//
// 이미지는 다시 올리지 않는다. 저장/공유가 이미 results 버킷에 <id>.jpg 로 올리고
// shared_results 에 같은 id 로 행을 만들므로(lib/shareResult.ts), 여기서는 그 id 를
// 내 것으로 표시해 두기만 한다. 그래서 이 파일에는 업로드 코드가 없다.

import { supabase } from '../supabase'

export interface MakeupLook {
  id: string
  styleId: string | null
  styleName: string | null
  imageUrl: string
  createdAt: string
}

/** results 버킷은 공개라 경로만 알면 URL 이 나온다(shareResult.ts 와 같은 규칙). */
function publicUrl(imagePath: string): string {
  return supabase.storage.from('results').getPublicUrl(imagePath).data.publicUrl
}

/**
 * 방금 저장/공유한 룩을 내 기록에 남긴다. 실패해도 조용히 넘어간다 —
 * 저장·공유 자체는 이미 성공했고, 기록이 안 남았다고 화면을 막을 이유가 없다.
 */
export async function recordLook(
  shareId: string,
  styleId: string,
  styleName: string,
): Promise<void> {
  const { data } = await supabase.auth.getUser()
  const userId = data.user?.id
  if (!userId) return // 무로그인은 기록하지 않는다(남길 계정이 없다)

  await supabase.from('makeup_look').upsert(
    {
      id: shareId,
      user_id: userId,
      style_id: styleId || null,
      style_name: styleName || null,
      image_path: `${shareId}.jpg`,
    },
    { onConflict: 'id' }, // 같은 결과를 저장하고 또 공유해도 한 줄만 남는다
  )
}

/** 마이페이지용 — 최신 룩 몇 개. */
export async function listLooks(limit = 6): Promise<MakeupLook[]> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return []

  const { data, error } = await supabase
    .from('makeup_look')
    .select('id, style_id, style_name, image_path, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error || !data) return []

  return (data as { id: string; style_id: string | null; style_name: string | null; image_path: string; created_at: string }[])
    .map((r) => ({
      id: r.id,
      styleId: r.style_id,
      styleName: r.style_name,
      imageUrl: publicUrl(r.image_path),
      createdAt: r.created_at,
    }))
}
