// 헤드리스 POC 러너 — playwright chromium에서 index.html을 띄우고
// 테스트 이미지를 MediaPipe 파이프라인에 통과시켜 결과/마스크/보존 히트맵을 저장한다.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const dir = path.dirname(fileURLToPath(import.meta.url));
const MIME = { '.html':'text/html', '.mjs':'text/javascript', '.js':'text/javascript',
  '.jpg':'image/jpeg', '.png':'image/png' };

const server = http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const fp = path.join(dir, p);
  if (!fp.startsWith(dir) || !fs.existsSync(fp)) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(fp)] || 'application/octet-stream' });
  fs.createReadStream(fp).pipe(res);
});
await new Promise(r => server.listen(8123, r));
console.log('static server :8123');

const TESTS = [
  { name:'frontal_1', file:'assets/frontal_1.jpg',
    opts:{ lip:true, blush:true, hair:true, lipColor:'#bb2f48', blushColor:'#ff7a6b', hairColor:'#9b5a2b' } },
  { name:'frontal_2', file:'assets/frontal_2.jpg',
    opts:{ lip:true, blush:true, hair:true, lipColor:'#c64b5a', blushColor:'#ff8a78', hairColor:'#5a3a8c' } }, // 보라빛 헤어로 가시성↑
  { name:'hat_beanie', file:'assets/hat_beanie.jpg',
    opts:{ lip:true, blush:true, hair:true, lipColor:'#bb2f48', blushColor:'#ff7a6b', hairColor:'#c0651f' } },
];

const browser = await chromium.launch({ args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--no-sandbox'] });
const page = await browser.newPage({ viewport:{ width:1400, height:900 } });
page.on('console', m => console.log('  [page]', m.text()));
page.on('pageerror', e => console.log('  [pageerror]', e.message));

const t0 = Date.now();
await page.goto('http://localhost:8123/index.html');
console.log('waiting for models…');
await page.waitForFunction('window.__POC_READY===true || !!window.__POC_ERROR', null, { timeout:180000 });
const initErr = await page.evaluate('window.__POC_ERROR');
if (initErr) { console.error('INIT ERROR:', initErr); await browser.close(); server.close(); process.exit(1); }
console.log('models ready in', ((Date.now()-t0)/1000).toFixed(1)+'s');

const summary = [];
for (const t of TESTS) {
  const buf = fs.readFileSync(path.join(dir, t.file));
  const dataUrl = 'data:image/jpeg;base64,' + buf.toString('base64');
  const ts = Date.now();
  const { report, result, diff } = await page.evaluate(
    async ([d,o]) => await window.processImage(d,o), [dataUrl, t.opts]);
  const ms = Date.now()-ts;
  fs.writeFileSync(path.join(dir,`out/${t.name}_result.png`), Buffer.from(result.split(',')[1],'base64'));
  fs.writeFileSync(path.join(dir,`out/${t.name}_diff.png`),  Buffer.from(diff.split(',')[1],'base64'));
  report.processMs = ms;
  fs.writeFileSync(path.join(dir,`out/${t.name}_report.json`), JSON.stringify(report,null,2));
  console.log(`\n=== ${t.name} (${ms}ms) ===`);
  console.log(JSON.stringify(report));
  summary.push({ name:t.name, ...report });
}
fs.writeFileSync(path.join(dir,'out/summary.json'), JSON.stringify(summary,null,2));
console.log('\nDONE. outputs in out/');
await browser.close();
server.close();
