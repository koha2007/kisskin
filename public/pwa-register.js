if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('SW registered:', reg.scope);
    }).catch((err) => {
      console.log('SW registration failed:', err);
    });
  });
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
