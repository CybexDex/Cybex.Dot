export default function({ isHMR, store, params, route, redirect }) {
  // If middleware is called from hot module replacement, ignore it
  if (isHMR) return

  const currency = /^([a-zA-Z]*[.]*[a-zA-Z]*)_([a-zA-Z]*[.]*[a-zA-Z]*)$/g.exec(
    params.currency
  )

  // 默认跳转配置文件中的第一个交易对
  if (!currency) {
    const url = `/${params.lang}/exchange/${'CYB'}_${'USDT'}`
    redirect(url)
  } else if (currency) {
    store.commit('exchange/SET_CURRENCY', {
      base: currency[2],
      quote: currency[1]
    })
  }
}
