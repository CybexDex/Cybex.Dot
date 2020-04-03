import CybexDotClient from '~/lib/CybexDotClient.js'

export const state = () => ({
  innerWidth: null,
  baseCurrency: null,
  quoteCurrency: null,
  pair: null,
  currentRTEPrice: null, // 当前成交价格
  currentOrderLegalPrice: null,
  pairs: null,
  assets: null,
  priceDigits: null,

  tradesRefreshRate: 6000 // 频率 ms
})

export const getters = {
  baseName: (state) => state.baseCurrency.name, // base name
  quoteName: (state) => state.quoteCurrency.name, // quote name
  baseHash: (state) => state.baseCurrency.id,
  quoteHash: (state) => state.quoteCurrency.id,
  basePrecision: (state) => state.baseCurrency.precision,
  quotePrecision: (state) => state.quoteCurrency.precision,
  pairHash: (state) => state.pair.id,
  pairs: (state) => state.pairs,
  pair: (state) => state.pair,
  assets: (state) => state.assets,
  priceDigits: (state) => state.priceDigits,

  innerWidth: (state) => state.innerWidth,
  currentRTEPrice: (state) => state.currentRTEPrice,
  currentOrderLegalPrice: (state) => state.currentOrderLegalPrice,
  tradesRefreshRate: (state) => state.tradesRefreshRate
}

export const mutations = {
  SET_INNER_WIDTH(state, val) {
    state.innerWidth = val
  },
  SET_CURRENCY(state, currency) {
    state.baseCurrency = currency.base
    state.quoteCurrency = currency.quote
    state.pair = currency
    CybexDotClient.setPairInfo(
      currency.base.id,
      currency.quote.id,
      currency.id,
      currency.base.precision,
      currency.quote.precision
    )
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
  },
  SET_PRICE_DIGITS(state, digits) {
    state.priceDigits = digits
  }
}

export const actions = {
  async init() {}
}
