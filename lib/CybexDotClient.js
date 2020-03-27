import config from '~/lib/config/config.js'

const { ApiPromise, WsProvider } = require('@polkadot/api')
const axios = require('axios')
const moment = require('moment')

let api
let account
let baseTokenHash
let quoteTokenHash
let TradePairHash

async function init() {
  const wsProvider = new WsProvider(config.cybexDotServer)

  if (!api) {
    api = await ApiPromise.create({
      provider: wsProvider,
      types: config.cybexDotCustomTypes
    })
  }
}

function setSignAccount(keyPair) {
  if (!account) {
    account = keyPair
  }
}

function setPair(baseHash, quoteHash, pHash) {
  if (!baseTokenHash) baseTokenHash = baseHash
  if (!quoteTokenHash) quoteTokenHash = quoteHash
  if (!TradePairHash) TradePairHash = pHash
}

// Read

async function getBalance(tokenHash, accountId) {
  if (!accountId) {
    return null
  }
  const params = { tokenHash }
  const result = await axios.get(
    `${config.cybexDotExplorerApiServer}account/${accountId}`,
    { params }
  )
  if (result.status === 200) {
    return result.data
  } else {
    throw new Error('cybexDot get balance request error')
  }
}

async function getOrderBook() {
  const result = await axios.get(
    `${config.cybexDotExplorerApiServer}orderbook/${TradePairHash}`
  )

  if (result.status === 200) {
    return result.data
  } else {
    throw new Error('cybexDot orderbook request error')
  }
}

async function getMarket(period, before, limit = 200) {
  // period: 1m 5m 1h 1d
  let time = before
  const intervalMap = { 60: '1m', 300: '5m', 3600: '1h', 86400: '1d' }
  if (!time) {
    time = moment.utc().format('YYYY-MM-DD HH:mm:ss')
  }

  // console.log("market request:-------", order.base, order.quote, intervalMap[period] ? intervalMap[period] : "1m", time);

  const params = {
    time,
    interval: intervalMap[period] ? intervalMap[period] : '1m',
    base: baseTokenHash.replace('0x', ''),
    quote: quoteTokenHash.replace('0x', ''),
    limit
  }
  const result = await axios.get(`${config.cybexDotMarketApiServer}market`, {
    params
  })
  // console.log("market result:-------", result);

  if (result.status === 200) {
    return result.data.reverse()
  } else {
    throw new Error('cybexDot get market request error')
  }
}

async function getTrades(count = 20, accountId) {
  const params = accountId
    ? { accountId, hash: TradePairHash, count }
    : { hash: TradePairHash, count }
  const result = await axios.get(`${config.cybexDotExplorerApiServer}trades`, {
    params
  })

  if (result.status === 200) {
    return result.data
  } else {
    throw new Error('cybexDot get trades request error')
  }
}

async function getTicker() {
  const result = await axios.get(
    `${config.cybexDotExplorerApiServer}ticker/${TradePairHash}`
  )

  if (result.status === 200) {
    return result.data
  } else {
    throw new Error('cybexDot get ticker request error')
  }
}

async function getOrders(accountId, isOpened) {
  const params = { accountId, hash: TradePairHash, isOpened: isOpened ? 1 : 0 }
  const order = await getTicker(TradePairHash)

  const result = await axios.get(`${config.cybexDotExplorerApiServer}orders`, {
    params
  })
  if (result.status === 200) {
    return result.data.filter((o) => {
      return o.base === order.base && o.quote === order.quote
    })
  } else {
    throw new Error('cybexDot get orders request error')
  }
}

async function getTokens() {
  const result = await axios.get(`${config.cybexDotExplorerApiServer}token`)
  if (result.status === 200) {
    return result.data
  } else {
    throw new Error('cybexDot get orders request error')
  }
}

async function getPairs() {
  const result = await axios.get(`${config.cybexDotExplorerApiServer}pair`)
  if (result.status === 200) {
    return result.data
  } else {
    throw new Error('cybexDot get orders request error')
  }
}

// Write
function transfer(tokenHash, toAccountId, amount) {
  return new Promise((resolve) => {
    // Transferd(AccountId, AccountId, Hash, Balance)
    api.tx.tokenModule
      .transfer(tokenHash, toAccountId, amount)
      .signAndSend(account, (result) => {
        if (result.status.isFinalized) {
          const record = result.findRecord('tokenModule', 'Transferd')
          if (record) {
            resolve(record.toJSON().event.data)
          }
        }
      })
  })
}

async function createLimitOrder(isBuy, price, amount) {
  let sellAmount
  let type

  if (isBuy) {
    type = 0
    sellAmount = price * amount
  } else {
    type = 1
    sellAmount = amount
  }
  const ticker = await getTicker(TradePairHash)

  return api.tx.tradeModule
    .createLimitOrder(
      ticker.base,
      ticker.quote,
      type,
      parseFloat((price * 10 ** 8).toPrecision(12)),
      parseFloat(parseFloat(sellAmount).toPrecision(12))
    ) // price need * 10 ** 8
    .signAndSend(account)
}

function cancelLimitOrder(orderHash) {
  return api.tx.tradeModule.cancelLimitOrder(orderHash).signAndSend(account)
}

function createToken(symbol, amount) {
  return new Promise((resolve) => {
    api.tx.tokenModule.issue(symbol, amount).signAndSend(account, (result) => {
      if (result.status.isFinalized) {
        const record = result.findRecord('tokenModule', 'Issued')
        if (record) {
          resolve(record.toJSON().event.data)
        }
      }
    })
  })
}

function createTradePair(baseHash, quoteHash) {
  return new Promise((resolve) => {
    // TradePairCreated(AccountId, Hash, TradePair),
    api.tx.tradeModule
      .createTradePair(baseHash, quoteHash)
      .signAndSend(account, (result) => {
        if (result.status.isFinalized) {
          const record = result.findRecord('tradeModule', 'TradePairCreated')
          if (record) {
            resolve(record.toJSON().event.data)
          }
        }
      })
  })
}

export default {
  init,
  setSignAccount,
  setPair,
  baseTokenHash,
  quoteTokenHash,
  TradePairHash,
  getBalance,
  getOrderBook,
  getMarket,
  getTicker,
  getTrades,
  getOrders,
  getTokens,
  getPairs,

  transfer,
  createLimitOrder,
  cancelLimitOrder,
  createToken,
  createTradePair
}
