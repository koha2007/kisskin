import vikeReact from 'vike-react/config'

export default {
  extends: [vikeReact],
  prerender: true,
  lang: 'ko',
  htmlAttributes: { class: 'light', dir: 'ltr', style: 'scroll-behavior: smooth' },
  bodyHtmlEnd: `
    <style>.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 300,'GRAD' 0,'opsz' 24;}</style>
    <script>
      (function() {
        var fonts = [
          'https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap',
          'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL@20..48,100..700,0..1&display=swap'
        ];
        fonts.forEach(function(href) {
          var l = document.createElement('link');
          l.rel = 'stylesheet';
          l.href = href;
          l.media = 'print';
          l.onload = function() { this.media = 'all'; };
          document.head.appendChild(l);
        });
      })();
    </script>
    <script src="/pwa-register.js" defer></script>
    <script src="https://unpkg.com/@polar-sh/checkout@0.2.0/dist/embed.global.js" defer></script>
    <script defer src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5109067049933124" crossorigin="anonymous"></script>
    <script defer src="https://static.addtoany.com/menu/page.js"></script>
    <script>
      window.addEventListener('load', function() {
        var gs = document.createElement('script');
        gs.src = 'https://www.googletagmanager.com/gtag/js?id=G-JJ7G39W5T3';
        gs.async = true;
        document.body.appendChild(gs);
        gs.onload = function() {
          window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-JJ7G39W5T3');
        };
        (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "w5fx3z4rfg");
      });
    </script>
  `,
}
