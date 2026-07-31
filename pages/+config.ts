import vikeReact from 'vike-react/config'

export default {
  extends: [vikeReact],
  prerender: true,
  lang: 'ko',
  htmlAttributes: { class: 'light', dir: 'ltr', style: 'scroll-behavior: smooth' },
  bodyHtmlEnd: `
    <style>.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 300,'GRAD' 0,'opsz' 24;}</style>
    <script src="/pwa-register.js" defer></script>
    <!-- Polar 임베드 체크아웃 SDK 는 2026-07-31 에 걷어냈다.
         ① 라이브 결제(MakeupTopUp → /api/checkout)는 **호스티드 리다이렉트**라
            window.Polar 를 쓰지 않는다. 임베드 SDK 를 참조하던 곳은 AnalysisApp.tsx
            하나였는데 그 파일은 아무 데서도 import 되지 않는 죽은 코드다.
            → 이 태그는 전 페이지에서 아무 일도 하지 않으면서 요청만 하나 늘리고 있었다.
         ② 무료 CDN(unpkg) 단일 장애점이기도 했다. 결제 스크립트를 남의 무료 CDN 에
            매달아 두면 안 된다.
         임베드 체크아웃을 되살릴 일이 생기면 전역 태그로 되돌리지 말고, 결제를 여는
         그 지점에서 동적으로 주입할 것(자체 호스팅 사본 권장). -->
    <script>
      (function() {
        function loadAnalytics() {
          var h = location.hostname;
          var isProd = h === 'kissinskin.net' || h === 'www.kissinskin.net';
          if (!isProd) return;
          // Internal/family-traffic exclusion. The operator opens the site once per
          // device with ?internal=1; family logins set the same flag from React
          // (src/lib/internalTraffic.ts). Either way we skip GA4 + Clarity entirely
          // so dashboards reflect only real external visitors (no fake $ from free
          // codes, no operator pageviews).
          try {
            if (new URLSearchParams(location.search).get('internal') === '1') {
              localStorage.setItem('kisskin_internal', '1');
            }
          } catch (e) {}
          var internal = false;
          try { internal = localStorage.getItem('kisskin_internal') === '1'; } catch (e) {}
          if (internal) {
            window['ga-disable-G-JJ7G39W5T3'] = true; // official GA4 kill switch
            return;
          }
          // GA4 — Consent Mode v2 (initialized in <head>) gates cookie storage until user accepts.
          var gs = document.createElement('script');
          gs.src = 'https://www.googletagmanager.com/gtag/js?id=G-JJ7G39W5T3';
          gs.async = true;
          document.head.appendChild(gs);
          gs.onload = function() {
            window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-JJ7G39W5T3');
          };
          // Microsoft Clarity
          (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "w5fx3z4rfg");
        }
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', loadAnalytics);
        } else {
          loadAnalytics();
        }
      })();
    </script>
  `,
}
