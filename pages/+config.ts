import vikeReact from 'vike-react/config'

export default {
  extends: [vikeReact],
  prerender: true,
  lang: 'ko',
  htmlAttributes: { class: 'light', dir: 'ltr', style: 'scroll-behavior: smooth' },
  bodyHtmlEnd: `
    <script src="/pwa-register.js"></script>
    <script src="https://unpkg.com/@polar-sh/checkout@0.2.0/dist/embed.global.js" defer></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-JJ7G39W5T3"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-JJ7G39W5T3');</script>
    <script>(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "w5fx3z4rfg");</script>
    <style>.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 300,'GRAD' 0,'opsz' 24;}</style>
  `,
}
