import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import vike from 'vike/plugin'
import fs from 'node:fs'
import path from 'node:path'

// ── dev 전용: Cloudflare Pages Functions(functions/api/*)를 vite dev 에서 실행 ──
// vite 는 기본적으로 functions/* 를 안 돌린다. P1-3 OpenAI Worker 를 codespace :3000
// 에서 테스트하기 위해 .dev.vars 환경 + 파일백드 사용량 저장소(MAKEUP_USAGE)를 주입해
// onRequestPost 를 실행한다. **dev 전용**(apply:'serve') — 프로덕션 빌드엔 영향 없음.
function devFunctions(): PluginOption {
  const parseDevVars = (): Record<string, string> => {
    const out: Record<string, string> = {}
    for (const f of ['.dev.vars', '.env']) {
      try {
        for (const line of fs.readFileSync(path.resolve(f), 'utf8').split('\n')) {
          const t = line.trim()
          if (!t || t.startsWith('#') || !t.includes('=')) continue
          const i = t.indexOf('=')
          const k = t.slice(0, i).trim()
          if (!(k in out)) out[k] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '')
        }
      } catch { /* file missing */ }
    }
    return out
  }
  // 파일백드 KV 셔임 — dev 에서 무료 1회 가드가 실제로 동작하도록.
  // node_modules/.cache 에 둔다(루트에 쓰면 vite 파일워처가 감지 → 생성 성공 직후
  // 풀 리로드 → React 상태 초기화 → "처음 화면으로 되돌아옴" 버그 발생).
  const cacheDir = path.resolve('node_modules/.cache')
  const usageFile = path.join(cacheDir, 'kisskin-makeup-usage.json')
  const readUsage = (): Record<string, string> => { try { return JSON.parse(fs.readFileSync(usageFile, 'utf8')) } catch { return {} } }
  const makeupUsage = {
    async get(k: string) { return readUsage()[k] ?? null },
    async put(k: string, v: string) {
      try { fs.mkdirSync(cacheDir, { recursive: true }) } catch { /* exists */ }
      const j = readUsage(); j[k] = v; fs.writeFileSync(usageFile, JSON.stringify(j))
    },
  }
  return {
    name: 'dev-cf-functions',
    apply: 'serve',
    configureServer(server) {
      const env = { ...parseDevVars(), MAKEUP_USAGE: makeupUsage } as Record<string, unknown>
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        if (!url.startsWith('/api/')) return next()
        const name = url.split('?')[0].replace(/^\/api\//, '').replace(/\/$/, '')
        const file = path.resolve('functions/api', `${name}.ts`)
        if (!name || !fs.existsSync(file)) return next()
        try {
          const mod = await server.ssrLoadModule(file)
          const handler = (req.method === 'POST' && mod.onRequestPost) || mod.onRequest
          if (!handler) return next()
          const chunks: Buffer[] = []
          for await (const c of req) chunks.push(c as Buffer)
          const buf = Buffer.concat(chunks)
          const headers = new Headers()
          for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v)
          const request = new Request(`http://localhost${url}`, {
            method: req.method, headers, body: buf.length ? buf : undefined,
          })
          const response: Response = await handler({ request, env })
          res.statusCode = response.status
          response.headers.forEach((v, k) => res.setHeader(k, v))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'dev_fn_error', message: e instanceof Error ? e.message : String(e) }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    devFunctions(),
    react(),
    tailwindcss(),
    vike(),
  ],
  // dev 전용: Codespaces 포워딩 도메인(*.app.github.dev)에서 접속 허용.
  // (미설정 시 Vite 가 "Blocked request. This host is not allowed." 403 반환)
  server: {
    host: true,
    allowedHosts: ['.app.github.dev'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor'
          }
          if (id.includes('node_modules/@supabase') || id.includes('node_modules/supabase')) {
            return 'supabase-vendor'
          }
        },
      },
    },
    cssCodeSplit: true,
    target: 'es2020',
    minify: 'esbuild',
  },
})
