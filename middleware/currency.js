import { find } from 'lodash'

export default function({ isHMR, store, params, route, redirect }) {
  // If middleware is called from hot module replacement, ignore it
  if (isHMR) return

  const currency = /^([a-zA-Z]*[.]*[a-zA-Z]*)_([a-zA-Z]*[.]*[a-zA-Z]*)$/g.exec(
    params.currency
  )

  const pairs = store.getters['exchange/pairs']
  const base = pairs[0].base
  const quote = pairs[0].quote

  // 默认跳转配置文件中的第一个交易对
  const defaultHandler = () => {
    store.commit('exchange/SET_CURRENCY', pairs[0])

    const url = `/${params.lang}/exchange/${quote.name}_${base.name}`
    redirect(url)
  }
  if (!currency) {
    defaultHandler()
  } else {
    const pair = find(
      pairs,
      (v) => v.base.name === currency[2] || v.quote.name === currency[1]
    )
    if (pair) {
      store.commit('exchange/SET_CURRENCY', pair)
    } else {
      defaultHandler()
    }
  }
}
