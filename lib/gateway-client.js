import Config from '~/lib/config/config'
const axios = require('axios')

export async function getDepositAddress(userAddress, coinType) {
  const result = await axios.get(
    `${Config.gateway.url}/v1/users/${userAddress}/assets/${coinType}/address`
  )
  if (result.status === 200) {
    return result.data
  } else {
    throw new Error('cybexDot get balance request error')
  }
}

export async function getAssets() {
  const result = await axios.get(`${Config.gateway.url}/v1/assets`)
  if (result.status === 200) {
    return result.data
  } else {
    throw new Error('cybexDot get balance request error')
  }
}

export async function getUserRecords(
  userAddress,
  fundtype,
  asset,
  size,
  offset
) {
  const result = await axios.get(
    `${Config.gateway.url}/v1/users/${userAddress}/records?fundType=${fundtype}&asset=${asset}&size=${size}&offset=${offset}`
  )

  if (result.status === 200) {
    return result.data
  } else {
    throw new Error('cybexDot get balance request error')
  }
}

export async function verifyAddress(coinType, address) {
  const result = await axios.get(
    `${Config.gateway.url}/v1/assets/${coinType}/address/${address}/verify`
  )

  if (result.status === 200) {
    return result.data
  } else {
    throw new Error('cybexDot get balance request error')
  }
}
