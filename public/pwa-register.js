if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('SW registered:', reg.scope);
    }).catch((err) => {
      console.log('SW registration failed:', err);
    });
  });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  if (document.getElementById('pwa-install-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'pwa-install-btn';
  btn.innerHTML = '📲 앱 설치하기';
  btn.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: #eb4763; color: white; border: none;
    padding: 14px 28px; border-radius: 50px; font-size: 16px; font-weight: 600;
    cursor: pointer; box-shadow: 0 4px 20px rgba(235,71,99,0.4);
    z-index: 10000; transition: all 0.3s ease;
  `;

  btn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      btn.remove();
    }
  });

  document.body.appendChild(btn);

  setTimeout(() => {
    if (btn.parentNode) {
      btn.style.opacity = '0';
      setTimeout(() => btn.remove(), 300);
    }
  }, 10000);
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  const btn = document.getElementById('pwa-install-btn');
  if (btn) btn.remove();
});
