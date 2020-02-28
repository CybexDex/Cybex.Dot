export const state = () => ({
  innerWidth: null,
  baseCurrency: null,
  quoteCurrency: null,
  currentRTEPrice: null, // 当前成交价格
  currentOrderLegalPrice: null,
  baseId: '1.3.0',
  quoteId: '1.3.27',
  priceDigits: 8,
  netstatus: {
    market: false,
    tradeConnect: true,
    orderConnect: true,
    trade: false,
    order: false,
    history: false
  },
  tradesRefreshRate: 6000 // 频率 ms
})

export const getters = {
  base: (state) => state.baseCurrency,
  quote: (state) => state.quoteCurrency,
  base_id: (state) => state.baseId,
  quote_id: (state) => state.quoteId,
  innerWidth: (state) => state.innerWidth,
  currentRTEPrice: (state) => state.currentRTEPrice,
  currentOrderLegalPrice: (state) => state.currentOrderLegalPrice,
  netstatus: (state) => state.netstatus,
  tradesRefreshRate: (state) => state.tradesRefreshRate,
  priceDigits: (state) => state.priceDigits
}

export const mutations = {
  SET_INNER_WIDTH(state, val) {
    state.innerWidth = val
  },
  SET_CURRENCY(state, currency) {
    state.baseCurrency = currency.base
    state.quoteCurrency = currency.quote
  },
  SET_CONNECT_STATUS(state, connect) {
    const newConnect = Object.assign(state.netstatus, connect)
    newConnect.history = newConnect.tradeConnect && newConnect.orderConnect
    state.netstatus = newConnect
  },
  SET_MDP_CONNECT_STATUS(state, status) {
    state.netstatus = Object.assign(state.netstatus, { market: status })
  },
  SET_PRICE_DIGITS(state, digits) {
    state.priceDigits = digits
  },
  SET_CURRENT_RTE_PRICE(state, { price, legalPrice }) {
    state.currentRTEPrice = price
    state.currentRTELegalPrice = legalPrice
  }
}

export const actions = {}
