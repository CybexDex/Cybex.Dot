/**
 * 浏览器用户存储相关方法
 */
// for 1.0兼容格式

import { u8aToHex } from '@polkadot/util'
import { decodeAddress } from '@polkadot/keyring'
import config from '~/lib/config/config.js'

const ACCOUNT_PREFIX = 'account:'

function toHex(address) {
  return u8aToHex(
    // When saving pre-checksum changes, ensure that we can decode
    decodeAddress(address, true)
  )
}

const accountKey = (address) => `${ACCOUNT_PREFIX}${toHex(address)}`

export default class UserStorageService {
  // 检查是否存在本地用户或者云钱包用户的缓存名
  _needBackupKey
  _addressKey
  _localKey

  // storage服务
  _storage

  constructor(localKey) {
    this._needBackupKey = 'needbackup'
    this._localKey = localKey || 'walletname'
    this._addressKey = 'address'

    this.setupStorage()
  }

  static getUnlockPeriod(address) {
    if (!address) {
      return null
    }
    let val
    let settings = localStorage.getItem(`${address}_settings`)
    if (settings) {
      settings = JSON.parse(settings)
      val = settings.unlockPeriod * 60
    } else {
      val = config.unlockPeriod
    }
    return val
  }

  static setUnlockPeriod(address, val) {
    if (!address) {
      return
    }
    let settings = localStorage.getItem(`${address}_settings`)
    if (!settings) {
      settings = { unlockPeriod: val }
    } else {
      settings = JSON.parse(settings)
      settings = Object.assign(settings, { unlockPeriod: val })
    }
    localStorage.setItem(`${address}_settings`, JSON.stringify(settings))
  }

  // todo change _storage to Service
  setupStorage(type = 'local') {
    if (type === 'local') {
      this._storage =
        window && window.localStorage
          ? window.localStorage
          : window.sessionStorage
    }
  }

  // 获取本地钱包账户名
  getLocalWalletName() {
    return this._storage.getItem(this._localKey)
  }

  // 设置本地钱包账户名
  setLocalWalletName(walletName) {
    this._storage.setItem(this._localKey, walletName)
  }

  removeLocalWalletName() {
    this._storage.removeItem(this._localKey)
  }

  getCurrentAddress() {
    return this._storage.getItem(this._addressKey)
  }

  setCurrentAddress(address) {
    this._storage.setItem(this._addressKey, address)
  }

  removeCurrentAddress() {
    return this._storage.removeItem(this._addressKey)
  }

  addBackupNotice() {
    this._storage.setItem(this._needBackupKey, true)
  }

  cleanBackupNotice() {
    this._storage.setItem(this._needBackupKey, false)
  }

  getBackupNotice() {
    return this._storage.getItem(this._needBackupKey)
  }

  getEncodeJSON(address) {
    return this._storage.getItem(accountKey(address))
  }
}
