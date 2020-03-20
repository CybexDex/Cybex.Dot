import colors from 'vuetify/es5/util/colors'
require('dotenv').config()

export default {
  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    titleTemplate: '%s - ' + process.env.npm_package_name,
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#ff9143' },
  /*
   ** Global CSS
   */
  css: [],
  router: {
    middleware: ['i18n']
  },
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~plugins/perfect-scroll',
    '~plugins/cybex',
    '~plugins/i18n',
    '~plugins/vuejs-logger',
    '~plugins/filter',
    {
      src: '~plugins/tradingview',
      mode: 'client'
    },
    {
      src: '~plugins/wallet',
      mode: 'client'
    },
    '~plugins/global-components'
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    '@nuxtjs/vuetify'
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    // '@nuxtjs/pwa',
    // Doc: https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/dotenv',
    'cookie-universal-nuxt'
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    customVariables: ['~/assets/style/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          anchor: '#212939',
          orange: '#FF9143',
          blue: '#2e5be2',
          cybexCrimson: '#D2323E',
          grass: '#6DBB49',
          light: '#F7F8FA',
          cybexGrey: '#78819A',
          dark: '#171D2A',
          cybexRed: '#D7333D',
          lead: '#1b2230',
          primary: '#FF9143',
          accent: colors.green.accent3,
          secondary: colors.green.accent3,
          info: '#78819a',
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },
  /*
   ** Build configuration
   */
  build: {
    transpile: [/^vuetify/],
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {}
  }
}
