// 헤드리스: looks.html을 띄워 12종 룩 + 베이스 비교 + 모자 케이스를 렌더해 저장
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const dir = path.dirname(fileURLToPath(import.meta.url))
const MIME = { '.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png' }
const srv = http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]); if(p==='/')p='/looks.html'
  const fp = path.join(dir,p)
  if(!fp.startsWith(dir)||!fs.existsSync(fp)){res.writeHead(404);return res.end('404')}
  res.writeHead(200,{'content-type':MIME[path.extname(fp)]||'application/octet-stream'})
  fs.createReadStream(fp).pipe(res)
})
await new Promise(r=>srv.listen(8124,r))

const dataUrl = (f) => 'data:image/jpeg;base64,'+fs.readFileSync(path.join(dir,'assets',f)).toString('base64')
const FEM = ['glass-skin','blurred-lip','lingerie','glazed-lavender','kpop-idol-f','copper-hair']
const MAL = ['skincare-glow','no-makeup','kpop-idol-m','grunge-smoky','monochrome','ash-brown-hair']

const browser = await chromium.launch({ args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--no-sandbox'] })
const page = await browser.newPage({ viewport:{width:1200,height:900} })
page.on('console', m=>{ const t=m.text(); if(!t.includes('Download the React')) console.log('  [page]',t) })
page.on('pageerror', e=>console.log('  [pageerror]',e.message))

const t0=Date.now()
await page.goto('http://localhost:8124/looks.html')
await page.waitForFunction('window.__POC_READY===true || !!window.__POC_ERROR',null,{timeout:180000})
const err = await page.evaluate('window.__POC_ERROR'); if(err){ console.error('INIT ERROR',err); await browser.close(); srv.close(); process.exit(1) }
console.log('models ready', ((Date.now()-t0)/1000).toFixed(1)+'s')

const save = (name,result)=>fs.writeFileSync(path.join(dir,`out/look_${name}.png`),Buffer.from(result.split(',')[1],'base64'))
async function one(face,lookId,outName){
  const ts=Date.now()
  const { report, result } = await page.evaluate(async ([d,id])=>await window.renderOne(d,id),[dataUrl(face),lookId])
  save(outName,result); console.log(`  ${outName} ${Date.now()-ts}ms`, JSON.stringify(report))
  return report
}

console.log('\n=== FEMALE looks on female_demo ===')
for(const id of FEM) await one('female_demo.jpg', id, 'f_'+id)

console.log('\n=== MALE looks on male_demo ===')
for(const id of MAL) await one('male_demo.jpg', id, 'm_'+id)

console.log('\n=== BASE on/off comparison (female_demo, glass-skin) ===')
await page.evaluate(()=>window.setBaseEnabled(false))
await one('female_demo.jpg','glass-skin','compare_BASEOFF')
await page.evaluate(()=>window.setBaseEnabled(true))
await one('female_demo.jpg','glass-skin','compare_BASEON')

console.log('\n=== HAT case (hat_beanie) ===')
await one('hat_beanie.jpg','kpop-idol-f','hat_makeup')   // 메이크업 룩 → 정상
await one('hat_beanie.jpg','copper-hair','hat_hairlook')  // 헤어 룩 → hatWarning 기대

console.log('\nDONE. outputs in out/')
await browser.close(); srv.close()
