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
    const { email, report, styles, resultImage, lang } = (await request.json()) as RequestBody

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
      <tr><td style="padding:0 24px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#fdf2f8,#faf5ff);border-radius:16px;overflow:hidden;">
          <tr><td style="padding:28px;">
            <h2 style="margin:0 0 16px;font-size:18px;color:#1e293b;font-weight:700;">✨ ${labels.skinAnalysis}</h2>
            <p style="margin:0;font-size:14px;color:#475569;line-height:1.7;white-space:pre-wrap;">${report.summary}</p>
          </td></tr>
        </table>
      </td></tr>
    ` : ''

    const analysisHtml = a ? `
      <tr><td style="padding:0 24px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#fdf2f8,#faf5ff);border-radius:16px;overflow:hidden;">
          <tr><td style="padding:28px;">
            <h2 style="margin:0 0 18px;font-size:18px;color:#1e293b;font-weight:700;">✨ ${labels.skinAnalysis}</h2>
            <table cellpadding="0" cellspacing="0" style="margin-bottom:18px;"><tr>
              <td style="padding-right:6px;"><span style="display:inline-block;background:linear-gradient(135deg,#ec4899,#f472b6);color:#fff;border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600;letter-spacing:0.3px;">${a.gender}</span></td>
              <td style="padding-right:6px;"><span style="display:inline-block;background:linear-gradient(135deg,#ec4899,#f472b6);color:#fff;border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600;letter-spacing:0.3px;">${a.skinType}</span></td>
              <td><span style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#fff;border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600;letter-spacing:0.3px;">${a.tone}</span></td>
            </tr></table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;margin-bottom:10px;">
              <tr><td style="padding:18px;">
                <h4 style="margin:0 0 8px;font-size:14px;color:#7c3aed;font-weight:700;">🧴 ${labels.skinType}</h4>
                <p style="margin:0;font-size:14px;color:#475569;line-height:1.7;">${a.skinTypeDetail}</p>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;margin-bottom:10px;">
              <tr><td style="padding:18px;">
                <h4 style="margin:0 0 8px;font-size:14px;color:#7c3aed;font-weight:700;">🎨 ${labels.toneAnalysis}</h4>
                <p style="margin:0;font-size:14px;color:#475569;line-height:1.7;">${a.toneDetail}</p>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;">
              <tr><td style="padding:18px;">
                <h4 style="margin:0 0 8px;font-size:14px;color:#e67e22;font-weight:700;">💡 ${labels.advice}</h4>
                <p style="margin:0;font-size:14px;color:#475569;line-height:1.7;">${a.advice}</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
    ` : ''

    const styleColors = ['#ec4899','#8b5cf6','#ef4444','#3b82f6','#6366f1','#e11d48','#f97316','#475569','#06b6d4']
    const stylesHtml = styles.length > 0 ? `
      <tr><td style="padding:0 24px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #f1f5f9;">
          <tr><td style="padding:28px;">
            <h2 style="margin:0 0 18px;font-size:18px;color:#1e293b;font-weight:700;">💄 ${labels.makeupStyles}</h2>
            <table cellpadding="0" cellspacing="0">
              ${styles.map((s, i) => `${i % 3 === 0 ? '<tr>' : ''}<td style="padding:0 6px 8px 0;"><span style="display:inline-block;background:${styleColors[i % styleColors.length]}15;color:${styleColors[i % styleColors.length]};border:1px solid ${styleColors[i % styleColors.length]}30;border-radius:20px;padding:6px 14px;font-size:12px;font-weight:600;white-space:nowrap;">${i + 1}. ${s}</span></td>${i % 3 === 2 || i === styles.length - 1 ? '</tr>' : ''}`).join('')}
            </table>
          </td></tr>
        </table>
      </td></tr>
    ` : ''

    const productColors = ['#ec4899','#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444']
    const productsHtml = report.products.length > 0 ? `
      <tr><td style="padding:0 24px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding-bottom:18px;">
            <h2 style="margin:0;font-size:18px;color:#1e293b;font-weight:700;">🛍️ ${labels.productRec}</h2>
          </td></tr>
          ${report.products.map((p, i) => {
            const color = productColors[i % productColors.length]
            return `
            <tr><td style="padding-bottom:12px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #f1f5f9;">
                <tr>
                  <td style="width:4px;background:${color};"></td>
                  <td style="padding:18px 20px;">
                    <table cellpadding="0" cellspacing="0" style="margin-bottom:8px;"><tr>
                      <td style="padding-right:8px;"><span style="display:inline-block;background:${color}15;color:${color};border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">${p.category}</span></td>
                    </tr></table>
                    <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#1e293b;">${p.name}</p>
                    <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;font-weight:500;">${p.brand} · ${p.price}</p>
                    <p style="margin:0 0 14px;font-size:13px;color:#64748b;line-height:1.6;">${p.reason}</p>
                    <a href="https://www.google.com/search?tbm=shop&q=${encodeURIComponent(p.brand + ' ' + p.name)}"
                       style="display:inline-block;background:linear-gradient(135deg,${color},${color}dd);color:#fff;text-decoration:none;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:600;letter-spacing:0.3px;">
                      ${labels.buyNow}
                    </a>
                  </td>
                </tr>
              </table>
            </td></tr>`
          }).join('')}
        </table>
      </td></tr>
    ` : ''

    // 결과 이미지를 인라인 첨부 + CID 참조
    const attachments: { filename: string; content: string; content_type?: string; headers?: Record<string, string> }[] = []
    let imageHtml = ''
    if (resultImage && resultImage.startsWith('data:image')) {
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
        <tr><td style="padding:0 24px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #f1f5f9;">
            <tr><td style="padding:28px;text-align:center;">
              <h2 style="margin:0 0 18px;font-size:18px;color:#1e293b;font-weight:700;">🖼️ ${labels.makeupResult}</h2>
              <img src="cid:${contentId}" alt="Makeup Result" style="max-width:100%;border-radius:12px;border:1px solid #f1f5f9;" />
            </td></tr>
          </table>
        </td></tr>
      `
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#f4f1ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ee;">
          <tr><td align="center" style="padding:32px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              <!-- Header Banner -->
              <tr><td style="background:linear-gradient(135deg,#ec4899,#8b5cf6,#6366f1);padding:40px 24px;text-align:center;">
                <h1 style="margin:0;font-size:28px;color:#ffffff;font-weight:800;letter-spacing:-0.5px;">kissinskin</h1>
                <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85);font-weight:500;letter-spacing:0.5px;">${labels.reportTitle}</p>
                <div style="width:40px;height:3px;background:rgba(255,255,255,0.5);border-radius:2px;margin:16px auto 0;"></div>
              </td></tr>
              <!-- Spacer -->
              <tr><td style="height:28px;"></td></tr>
              <!-- Content -->
              ${analysisHtml}
              ${summaryHtml}
              ${imageHtml}
              ${stylesHtml}
              ${productsHtml}
              <!-- Footer -->
              <tr><td style="padding:20px 24px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f1f5f9;">
                  <tr><td style="padding-top:24px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:11px;color:#cbd5e1;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Powered by AI</p>
                    <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">
                      &copy; 2026 kissinskin. All rights reserved.
                    </p>
                    <a href="https://kissinskin.net" style="font-size:12px;color:#8b5cf6;text-decoration:none;font-weight:600;">kissinskin.net</a>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </td></tr>
        </table>
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
