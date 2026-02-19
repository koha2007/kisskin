interface Env {
  OPENAI_API_KEY: string
}

interface RequestBody {
  photo: string
  gender: string
  skinType: string
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context

  if (!env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { photo, gender, skinType } = (await request.json()) as RequestBody

    if (!photo || !gender || !skinType) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // base64 data URL → Blob 변환
    const base64Data = photo.split(',')[1]
    const binaryStr = atob(base64Data)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }
    const imageBlob = new Blob([bytes], { type: 'image/png' })

    // FormData 구성
    const formData = new FormData()
    formData.append('image', imageBlob, 'photo.png')
    formData.append('model', 'gpt-image-1.5')
    formData.append('n', '1')
    formData.append('size', '1024x1024')
    formData.append('quality', 'auto')
    formData.append('background', 'auto')
    formData.append('moderation', 'auto')
    formData.append('input_fidelity', 'high')
    formData.append('prompt', `너는 최고의 메이크업 아티스트야. 이 사람은 ${gender}이고 ${skinType} 피부타입이야.
사용자가 사진을 넣으면 ${skinType} 타입을 반영해서
2026년 유행하는 메이크업과 기본메이크업 총 6가지로 2x3 그리드로 생성해줘.
단 사람의 얼굴은 절대 바꾸지 말고 메이크업만 확실하게 분별할 수 있게 표현해줘.
그리드 라인 표시해줘, 그리고 머리카락 화면에서 잘리지 않게 다 균등하게 생성해줘.
내추럴, 글라스 스킨, 블러셔 중심, 톤온톤, 스모키, 딥 베리 립 총 6가지 메이크업으로
다 다르게 확실한 메이크업 방식으로 생성해줘`)

    // Images Edit API 호출
    const res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const errorBody = await res.text()
      return new Response(JSON.stringify({
        error: `API 오류 (${res.status}): ${errorBody}`,
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await res.json() as {
      data: { b64_json?: string; url?: string }[]
    }

    const result = data.data?.[0]
    if (!result) {
      return new Response(JSON.stringify({
        error: '이미지가 생성되지 않았습니다.',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // b64_json 또는 url 처리
    let imageData: string
    if (result.b64_json) {
      imageData = `data:image/png;base64,${result.b64_json}`
    } else if (result.url) {
      const imgRes = await fetch(result.url)
      const imgBuf = await imgRes.arrayBuffer()
      const imgBytes = new Uint8Array(imgBuf)
      let binary = ''
      for (let i = 0; i < imgBytes.length; i++) {
        binary += String.fromCharCode(imgBytes[i])
      }
      imageData = `data:image/png;base64,${btoa(binary)}`
    } else {
      return new Response(JSON.stringify({
        error: '이미지 데이터를 찾을 수 없습니다.',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ image: imageData }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({
      error: `서버 오류: ${e instanceof Error ? e.message : String(e)}`,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
