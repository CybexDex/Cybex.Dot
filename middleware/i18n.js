import { find } from 'lodash'

export default function({ isHMR, app, store, params, error, route, redirect }) {
  // If middleware is called from hot module replacement, ignore it
  if (isHMR) return
  console.log('--', store.getters['auth/username'])

  const storeLocale = store.getters['i18n/locale']
  const locale = params.lang || app.i18n.fallbackLocale
  // Get locale from params
  const localeData = find(
    store.state.i18n.locales,
    (one) => one.name === locale || one.code === locale
  )

  if (!localeData) {
    return error({
      message: app.i18n.t('errorMessage.404'),
      statusCode: 404
    })
  }
  // const extensions = await web3Enable('Cybex Dot')

  // Set locale
  if (storeLocale !== localeData.name) {
    store.commit('i18n/SET_LANG', localeData.name)

    app.i18n.locale = localeData.code || localeData.name
  }

  const cookieRes = app.$cookies.get('auth-username')

  const isLogin = !!cookieRes

  // 已登录时 不可访问注册 登录 恢复本地钱包
  // 并默认跳转到交易所页面
  const notAllowedPaths = ['register', 'guide']
  const shouldRedirectPaths = [`/${locale}/`, '/']
  const checkRedirect = notAllowedPaths.filter((path) => {
    return route.path.includes(path)
  })
  const shouldRedirect = shouldRedirectPaths.filter((path) => {
    return route.path === path || `/${locale}${path}` === route.path
  })

  if (isLogin && (checkRedirect.length || shouldRedirect.length)) {
    return redirect(`/${localeData.name}/exchange`)
  }

  // when no logined
  if (route.path === '/') {
    return redirect(`/${localeData.name}/`)
  }
}
