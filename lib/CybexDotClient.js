import config from '~/lib/config/config.js'

const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api')
const axios = require('axios')
const moment = require('moment')

const TradePairHash =
  '0x2b58c85113b5c19d838c4b1b4c024d6f6f7f75f8796f4a2675d17dbe9d5e8b65'
const quoteTokenHash =
  '0x65609ec1db09630dd910e79e70812bcc0988ef47b655c578abd5bbac5b9c46df' // 1.3.0
const baseTokenHash =
  '0x748ea2329a21712c562a765df838de8b7d0039b432ab464f9ed5fd099739ee22' // 1.3.27
const AccountId = '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy'
// 5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy
// 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
const accountName = 'Dave' // Dave Alice

let api
let account
async function init() {
  const wsProvider = new WsProvider(config.cybexDotServer)

  api = await ApiPromise.create({
    provider: wsProvider,
    types: config.cybexDotCustomTypes
  })

  const keyring = new Keyring({ type: 'sr25519' })
  account = keyring.addFromUri(`//${accountName}`, { name: 'default' })
}

// Read

async function getBalance(tokenHash) {
  const params = { tokenHash }
  const result = await axios.get(
    `${config.cybexDotExplorerApiServer}account/${AccountId}`,
    { params }
  )
  if (result.status === 200) {
    return result.data
  } else {
    throw new Error('cybexDot get balance request error')
  }
}

async function getOrderBook(pairHash) {
  const result = await axios.get(
    `${config.cybexDotExplorerApiServer}orderbook/${pairHash}`
  )

  if (result.status === 200) {
    return result.data
  } else {
    throw new Error('cybexDot orderbook request error')
  }
}

async function getMarket(pairHash, period, before, limit = 200) {
  // period: 1m 5m 1h 1d
  let time = before
  const intervalMap = { 60: '1m', 300: '5m', 3600: '1h', 86400: '1d' }
  if (!time) {
    time = moment.utc().format('YYYY-MM-DD HH:mm:ss')
  }

  // const order = await getTicker(pairHash);

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

async function getTrades(pairHash, count = 20, accountId) {
  const params = accountId
    ? { accountId, hash: pairHash, count }
    : { hash: pairHash, count }
  const result = await axios.get(`${config.cybexDotExplorerApiServer}trades`, {
    params
  })

  if (result.status === 200) {
    return result.data
  } else {
    throw new Error('cybexDot get trades request error')
  }
}

async function getTicker(pairHash) {
  const result = await axios.get(
    `${config.cybexDotExplorerApiServer}ticker/${pairHash}`
  )

  if (result.status === 200) {
    return result.data
  } else {
    throw new Error('cybexDot get ticker request error')
  }
}

async function getOrders(pairHash, accountId, isOpened) {
  const params = { accountId, hash: pairHash, isOpened: isOpened ? 1 : 0 }
  const order = await getTicker(pairHash)

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

async function createLimitOrder(pairHash, isBuy, price, amount) {
  let realAmount
  let type
  if (isBuy) {
    type = 0
    realAmount = parseFloat((price * amount).toFixed(2))
  } else {
    type = 1
    realAmount = parseInt(amount)
  }

  const ticker = await getTicker(pairHash)
  return api.tx.tradeModule
    .createLimitOrder(
      ticker.base,
      ticker.quote,
      type,
      parseFloat((price * 10 ** 8).toFixed(2)),
      realAmount
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

function createTradePair(baseTokenHash, quoteTokenHash) {
  return new Promise((resolve) => {
    // TradePairCreated(AccountId, Hash, TradePair),
    api.tx.tradeModule
      .createTradePair(baseTokenHash, quoteTokenHash)
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
  TradePairHash,
  baseTokenHash,
  quoteTokenHash,
  AccountId,
  accountName,

  init,
  getBalance,
  getOrderBook,
  getMarket,
  getTicker,
  getTrades,
  getOrders,

  transfer,
  createLimitOrder,
  cancelLimitOrder,
  createToken,
  createTradePair
}
