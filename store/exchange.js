import CybexDotClient from '~/lib/CybexDotClient'

export const state = () => ({
  innerWidth: null,
  baseCurrency: null,
  quoteCurrency: null,
  pair: null,
  currentRTEPrice: null, // 当前成交价格
  currentOrderLegalPrice: null,
  priceDigits: 8, // 深度价格默认精度
  pairs: null,
  assets: null,
  tradesRefreshRate: 6000 // 频率 ms
})

export const getters = {
  baseName: (state) => state.baseCurrency.name, // base name
  quoteName: (state) => state.quoteCurrency.name, // quote name
  baseHash: (state) => state.baseCurrency.id,
  quoteHash: (state) => state.quoteCurrency.id,
  pairHash: (state) => state.pair.id,
  pairs: (state) => state.pairs,
  assets: (state) => state.assets,
  innerWidth: (state) => state.innerWidth,
  currentRTEPrice: (state) => state.currentRTEPrice,
  currentOrderLegalPrice: (state) => state.currentOrderLegalPrice,
  tradesRefreshRate: (state) => state.tradesRefreshRate,
  priceDigits: (state) => state.priceDigits
}

export const mutations = {
  SET_INNER_WIDTH(state, val) {
    state.innerWidth = val
  },
  SET_CURRENCY(state, currency) {
    CybexDotClient.setPair(currency.base.id, currency.quote.id, currency.id)

    state.baseCurrency = currency.base
    state.quoteCurrency = currency.quote
    state.pair = currency
  },
  SET_PRICE_DIGITS(state, digits) {
    state.priceDigits = digits
  },
  SET_CURRENT_RTE_PRICE(state, { price, legalPrice }) {
    state.currentRTEPrice = price
    state.currentRTELegalPrice = legalPrice
  },
  SET_PAIRS(state, pairs) {
    state.pairs = pairs
  },
  SET_ASSETS(state, assets) {
    state.assets = assets
  }
}

export const actions = {
  init() {}
}
