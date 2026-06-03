// 서비스워커는 프로덕션 도메인에서만 등록한다. dev/preview/Codespaces 에서는
// 이전에 설치된 SW 가 라우트를 가로채(캐시된 셸 서빙) 새 코드 확인을 방해하므로,
// 그런 환경에서는 기존 SW 를 해제하고 캐시를 비워 자동 치유한다. (프로덕션 영향 0)
if ('serviceWorker' in navigator) {
  const h = location.hostname;
  const isProd = h === 'kissinskin.net' || h === 'www.kissinskin.net';
  if (isProd) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('SW registered:', reg.scope);
      }).catch((err) => {
        console.log('SW registration failed:', err);
      });
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    }).catch(() => {});
    if (window.caches && caches.keys) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
    }
  }
}

// PWA 설치 프롬프트를 전역에 노출 (React에서 사용)
window.__pwaInstall = { deferredPrompt: null, installed: false };

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  window.__pwaInstall.deferredPrompt = e;
  // React 컴포넌트에 알림
  window.dispatchEvent(new Event('pwa-install-available'));
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  window.__pwaInstall.deferredPrompt = null;
  window.__pwaInstall.installed = true;
  window.dispatchEvent(new Event('pwa-installed'));
});
