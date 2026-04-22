// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@nuxt/content',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/i18n',
    // '@nuxtjs/seo', // re-enable once nuxt-og-image 4.x + unenv Windows path bug is resolved
    '@nuxtjs/tailwindcss',
    '@vueuse/motion/nuxt',
    '@vueuse/nuxt',
  ],

  css: ['~/assets/css/tokens.css', '~/assets/css/global.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'nl' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap',
        },
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#F7F8FA' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  site: {
    url: 'https://mkkunststoffen.example',
    name: 'M&K Kunststoffen',
    description: 'B2B groothandel kunststof plaat-, buis- en stafmateriaal. Focus op HDPE en PP. Scherp geprijsd, dezelfde kwaliteit.',
    defaultLocale: 'nl',
  },

  content: {
    defaultLocale: 'nl',
    locales: ['nl', 'en'],
    highlight: false,
    markdown: {
      toc: { depth: 2, searchDepth: 2 },
    },
  },

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'nl',
    locales: [
      { code: 'nl', language: 'nl-NL', name: 'Nederlands', file: 'nl.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'mk_i18n',
      redirectOn: 'root',
      alwaysRedirect: false,
    },
  },

  image: {
    format: ['avif', 'webp'],
    quality: 80,
  },

  icon: {
    serverBundle: {
      collections: ['lucide'],
    },
  },

  routeRules: {
    '/': { prerender: true },
    '/materialen/**': { prerender: true },
    '/producten/**': { prerender: true },
    '/over-ons': { prerender: true },
    '/contact': { prerender: true },
    '/en/**': { prerender: true },
  },

  runtimeConfig: {
    resendApiKey: '', // NUXT_RESEND_API_KEY
    leadRecipient: '', // NUXT_LEAD_RECIPIENT
    leadFromAddress: 'M&K Kunststoffen <no-reply@mkkunststoffen.example>', // NUXT_LEAD_FROM_ADDRESS
    stockSheetUrl: '', // NUXT_STOCK_SHEET_URL — published Google Sheet CSV URL
    public: {
      companyName: 'M&K Kunststoffen',
    },
  },

  typescript: {
    strict: true,
  },
})
