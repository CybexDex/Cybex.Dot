import config from '~/lib/config/config.js'

const { ApiPromise, WsProvider } = require('@polkadot/api')
const axios = require('axios')
const moment = require('moment')

let api
let account
const info = {}

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

function setPairInfo(
  baseHash,
  quoteHash,
  pHash,
  basePrecision,
  quotePrecision
) {
  info.baseTokenHash = baseHash
  info.quoteTokenHash = quoteHash
  info.tradePairHash = pHash
  info.basePrecision = basePrecision
  info.quotePrecision = quotePrecision
}

// Read

async function getBalance(tokenHash, accountId) {
  if (!accountId) {
    return null
  }
  const params = { tokenHash }
  const result = await axios.get(
    `${config.cybexDotExplorerApiServer}balance/${accountId}`,
    { params }
  )
  if (result.status === 200) {
    return result.data
  } else {
    throw new Error('cybexDot get balance request error')
  }
}

async function getSystemBalance(accountId) {
  if (!accountId) {
    return null
  }
  const result = await axios.get(
    `${config.cybexDotExplorerApiServer}systembalance/${accountId}`
  )
  if (result.status === 200) {
    return result.data
  } else {
    throw new Error('cybexDot get balance request error')
  }
}

async function getAllBalance(accountId) {
  if (!accountId) {
    return null
  }
  const result = await axios.get(
    `${config.cybexDotExplorerApiServer}balance/${accountId}`
  )

  if (result.status === 200) {
    return result.data
  } else {
    throw new Error('cybexDot get balance request error')
  }
}

async function getOrderBook() {
  const result = await axios.get(
    `${config.cybexDotExplorerApiServer}orderbook/${info.tradePairHash}`
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
    base: info.baseTokenHash.replace('0x', ''),
    quote: info.quoteTokenHash.replace('0x', ''),
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

async function getTrades(count = 20, accountId, tpHash) {
  let params = accountId ? { accountId, count } : { count }
  if (tpHash) {
    params = { ...params, hash: tpHash }
  }
  const result = await axios.get(`${config.cybexDotExplorerApiServer}trades`, {
    params
  })

  if (result.status === 200) {
    return result.data
  } else {
    throw new Error('cybexDot get trades request error')
  }
}

async function getTicker(tradePairHash) {
  const result = await axios.get(
    `${config.cybexDotExplorerApiServer}ticker/${tradePairHash}`
  )

  if (result.status === 200) {
    return result.data
  } else {
    throw new Error('cybexDot get ticker request error')
  }
}

async function getOrders(accountId, isOpened) {
  const params = {
    accountId,
    hash: info.tradePairHash,
    isOpened: isOpened ? 1 : 0
  }

  const result = await axios.get(`${config.cybexDotExplorerApiServer}orders`, {
    params
  })
  if (result.status === 200) {
    return result.data.filter((o) => {
      return o.base === info.baseTokenHash && o.quote === info.quoteTokenHash
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

function createLimitOrder(isBuy, price, sellAmount) {
  let type

  if (isBuy) {
    type = 0
  } else {
    type = 1
  }

  return api.tx.tradeModule
    .createLimitOrder(
      info.baseTokenHash,
      info.quoteTokenHash,
      type,
      parseFloat((price * config.pricePrecision).toPrecision(12)),
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
  setPairInfo,
  info,
  getBalance,
  getSystemBalance,
  getAllBalance,
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
