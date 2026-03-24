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

  // 2. Insert metadata
  let reportJson: object
  try {
    reportJson = JSON.parse(report)
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
  report: { analysis?: { gender?: string; skinType?: string; skinTypeDetail?: string; tone?: string; toneDetail?: string; advice?: string }; products?: { category: string; name: string; brand: string; price: string; reason: string }[] }
  gender: string
  styles: string[]
}

export async function loadSharedResult(id: string): Promise<SharedResultData | null> {
  const { data, error } = await supabase
    .from('shared_results')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null

  const { data: urlData } = supabase.storage
    .from('results')
    .getPublicUrl(data.image_path)

  return {
    imageUrl: urlData.publicUrl,
    report: data.report,
    gender: data.gender,
    styles: data.styles as string[],
  }
}
