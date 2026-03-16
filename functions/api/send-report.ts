interface Env {
  RESEND_API_KEY: string
}

interface RequestBody {
  email: string
  report: {
    analysis?: {
      gender: string
      skinType: string
      skinTypeDetail: string
      tone: string
      toneDetail: string
      advice: string
    }
    summary?: string
    products: {
      category: string
      name: string
      brand: string
      price: string
      reason: string
    }[]
  }
  styles: string[]
  resultImage: string
  cellImages?: string[]
  lang?: string
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context

  if (!env.RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'Email service not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { email, report, styles, resultImage, cellImages, lang } = (await request.json()) as RequestBody

    const isEn = lang === 'en'
    const labels = {
      subject: isEn ? '💄 Your AI Makeup Analysis Report - kissinskin' : '💄 AI 메이크업 분석 리포트 - kissinskin',
      skinAnalysis: isEn ? 'AI Skin Analysis' : 'AI 피부 분석',
      skinType: isEn ? 'Skin Type' : '피부 타입',
      toneAnalysis: isEn ? 'Tone Analysis' : '톤 분석',
      advice: isEn ? 'Personalized Advice' : '맞춤 조언',
      makeupResult: isEn ? 'Makeup Simulation Result' : '메이크업 시뮬레이션 결과',
      makeupStyles: isEn ? '9 Makeup Styles' : '메이크업 스타일 9종',
      productRec: isEn ? 'Personalized Product Recommendations' : '맞춤 화장품 추천',
      buyNow: isEn ? 'Buy Now →' : 'Buy Now →',
      reportTitle: isEn ? 'AI Makeup Analysis Report' : 'AI 메이크업 분석 리포트',
    }

    console.log('[send-report] Data received:', {
      email,
      hasAnalysis: !!report?.analysis,
      hasSummary: !!report?.summary,
      productCount: report?.products?.length || 0,
      stylesCount: styles?.length || 0,
      hasImage: !!resultImage,
      imageLen: resultImage?.length || 0,
      cellImagesCount: cellImages?.length || 0,
    })

    if (!email || !report) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const a = report.analysis
    // summary 폴백 (analysis가 없을 때 텍스트라도 표시)
    const summaryHtml = (!a && report.summary) ? `
      <div style="background:#fdf2f8;border-radius:12px;padding:24px;margin-bottom:24px;">
        <h2 style="margin:0 0 16px;font-size:18px;color:#0f172a;">✨ ${labels.skinAnalysis}</h2>
        <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;white-space:pre-wrap;">${report.summary}</p>
      </div>
    ` : ''
    const analysisHtml = a ? `
      <div style="background:#fdf2f8;border-radius:12px;padding:24px;margin-bottom:24px;">
        <h2 style="margin:0 0 16px;font-size:18px;color:#0f172a;">
          ✨ ${labels.skinAnalysis}
        </h2>
        <div style="margin-bottom:12px;">
          <span style="display:inline-block;background:#f9a8d4;color:#fff;border-radius:20px;padding:4px 12px;font-size:13px;font-weight:600;margin-right:6px;">${a.gender}</span>
          <span style="display:inline-block;background:#f9a8d4;color:#fff;border-radius:20px;padding:4px 12px;font-size:13px;font-weight:600;margin-right:6px;">${a.skinType}</span>
          <span style="display:inline-block;background:#fbbf24;color:#fff;border-radius:20px;padding:4px 12px;font-size:13px;font-weight:600;">${a.tone}</span>
        </div>
        <div style="background:#fff;border-radius:8px;padding:16px;margin-bottom:10px;">
          <h4 style="margin:0 0 6px;font-size:14px;color:#6366f1;">🧴 ${labels.skinType}</h4>
          <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">${a.skinTypeDetail}</p>
        </div>
        <div style="background:#fff;border-radius:8px;padding:16px;margin-bottom:10px;">
          <h4 style="margin:0 0 6px;font-size:14px;color:#6366f1;">🎨 ${labels.toneAnalysis}</h4>
          <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">${a.toneDetail}</p>
        </div>
        <div style="background:#fff;border-radius:8px;padding:16px;">
          <h4 style="margin:0 0 6px;font-size:14px;color:#f59e0b;">💡 ${labels.advice}</h4>
          <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">${a.advice}</p>
        </div>
      </div>
    ` : ''

    const stylesHtml = styles.length > 0 ? `
      <div style="margin-bottom:24px;">
        <h2 style="margin:0 0 16px;font-size:18px;color:#0f172a;">💄 ${labels.makeupStyles}</h2>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${styles.map((s, i) => `<span style="display:inline-block;background:#f1f5f9;border-radius:20px;padding:6px 14px;font-size:13px;color:#334155;">${i + 1}. ${s}</span>`).join('')}
        </div>
      </div>
    ` : ''

    const productsHtml = report.products.length > 0 ? `
      <div style="margin-bottom:24px;">
        <h2 style="margin:0 0 16px;font-size:18px;color:#0f172a;">🛍️ ${labels.productRec}</h2>
        ${report.products.map(p => `
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:10px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              <span style="background:#f0abfc;color:#fff;border-radius:6px;padding:2px 8px;font-size:12px;font-weight:600;">${p.category}</span>
              <span style="font-size:14px;font-weight:700;color:#0f172a;">${p.name}</span>
            </div>
            <p style="margin:0 0 4px;font-size:13px;color:#64748b;">${p.brand} · ${p.price}</p>
            <p style="margin:0;font-size:13px;color:#334155;line-height:1.5;">${p.reason}</p>
            <a href="https://www.google.com/search?tbm=shop&q=${encodeURIComponent(p.brand + ' ' + p.name)}"
               style="display:inline-block;margin-top:10px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;">
              ${labels.buyNow}
            </a>
          </div>
        `).join('')}
      </div>
    ` : ''

    // 결과 이미지를 인라인 첨부 + CID 참조
    const attachments: { filename: string; content: string; content_type?: string; headers?: Record<string, string> }[] = []
    let imageHtml = ''

    // 9개 개별 셀 이미지가 있으면 3x3 카드 그리드로 표시
    if (cellImages && cellImages.length === 9) {
      cellImages.forEach((dataUrl, i) => {
        if (!dataUrl.startsWith('data:image')) return
        const base64Data = dataUrl.split(',')[1]
        const isJpeg = dataUrl.startsWith('data:image/jpeg')
        const ext = isJpeg ? 'jpg' : 'png'
        const contentType = isJpeg ? 'image/jpeg' : 'image/png'
        const contentId = `cell-${i}@kissinskin.net`
        attachments.push({
          filename: `style-${i + 1}.${ext}`,
          content: base64Data,
          content_type: contentType,
          headers: {
            'Content-ID': `<${contentId}>`,
            'Content-Disposition': 'inline',
          },
        })
      })

      const rows = [0, 1, 2].map(row => {
        const cols = [0, 1, 2].map(col => {
          const i = row * 3 + col
          const styleName = styles[i] || ''
          return `
            <td style="width:33.33%;padding:4px;vertical-align:top;">
              <div style="background:#fff;border-radius:10px;overflow:hidden;border:1px solid #f0f0f0;">
                <img src="cid:cell-${i}@kissinskin.net" alt="${styleName}" style="width:100%;display:block;border-radius:10px 10px 0 0;" />
                <p style="margin:0;padding:10px 4px;text-align:center;font-size:12px;font-weight:600;color:#1e293b;">${styleName}</p>
              </div>
            </td>`
        }).join('')
        return `<tr>${cols}</tr>`
      }).join('')

      imageHtml = `
        <div style="margin-bottom:24px;">
          <h2 style="margin:0 0 16px;font-size:18px;color:#0f172a;">🖼️ ${labels.makeupResult}</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;">
            ${rows}
          </table>
        </div>
      `
    } else if (resultImage && resultImage.startsWith('data:image')) {
      // 폴백: 기존 단일 그리드 이미지
      const base64Data = resultImage.split(',')[1]
      const isJpeg = resultImage.startsWith('data:image/jpeg')
      const ext = isJpeg ? 'jpg' : 'png'
      const contentType = isJpeg ? 'image/jpeg' : 'image/png'
      const filename = `kissinskin-result.${ext}`
      const contentId = `result-image@kissinskin.net`
      attachments.push({
        filename,
        content: base64Data,
        content_type: contentType,
        headers: {
          'Content-ID': `<${contentId}>`,
          'Content-Disposition': 'inline',
        },
      })
      imageHtml = `
        <div style="margin-bottom:24px;text-align:center;">
          <h2 style="margin:0 0 16px;font-size:18px;color:#0f172a;">🖼️ ${labels.makeupResult}</h2>
          <img src="cid:${contentId}" alt="Makeup Result" style="max-width:100%;border-radius:12px;" />
        </div>
      `
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f8f6f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
          <div style="text-align:center;margin-bottom:32px;">
            <h1 style="margin:0;font-size:24px;color:#ec4899;">kissinskin</h1>
            <p style="margin:4px 0 0;font-size:14px;color:#94a3b8;">${labels.reportTitle}</p>
          </div>
          ${analysisHtml}
          ${summaryHtml}
          ${imageHtml}
          ${stylesHtml}
          ${productsHtml}
          <div style="text-align:center;padding-top:24px;border-top:1px solid #e2e8f0;">
            <p style="font-size:12px;color:#94a3b8;margin:0;">
              © 2026 kissinskin. All rights reserved.<br/>
              <a href="https://kissinskin.net" style="color:#6366f1;">kissinskin.net</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const resendBody: Record<string, unknown> = {
      from: 'kissinskin <report@kissinskin.net>',
      to: [email],
      subject: labels.subject,
      html,
    }

    if (attachments.length > 0) {
      resendBody.attachments = attachments
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendBody),
    })

    if (!res.ok) {
      const errText = await res.text()
      return new Response(JSON.stringify({ error: 'Failed to send email', detail: errText }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const result = await res.json()
    return new Response(JSON.stringify({ success: true, id: (result as { id: string }).id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error', detail: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
