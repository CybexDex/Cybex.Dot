import keyring from '@polkadot/ui-keyring'
import { mnemonicGenerate, cryptoWaitReady } from '@polkadot/util-crypto'
import config from './config/config.js'

class Wallet {
  constructor(NODELIST) {
    this.keytimer = null
    this.store = null
  }

  static CreateWallet(user, password, mnemonic) {
    const seed = mnemonic ?? mnemonicGenerate()
    const result = keyring.addUri(
      `${seed}`,
      password,
      { name: user.trim(), tags: [] },
      'sr25519' // sr25519
    )
    const json = result.json
    const { address } = result.pair

    return { seed, address, json, pair: result.pair }
  }

  static addAccount(json, password) {
    return keyring.restoreAccount(json, password)
  }

  static forgetCurrentAccount(address) {
    keyring.forgetAccount(address)
  }

  static async loadCached(address) {
    await cryptoWaitReady()
    if (address) {
      keyring.loadAll({ address, isDevelopment: false })
    } else {
      keyring.loadAll({ isDevelopment: false })
    }
  }

  static getPair(address) {
    const pair = keyring.getPair(address)
    return pair
  }

  // return last lock state
  switchLockState(address, password) {
    const pair = keyring.getPair(address)

    if (pair.isLocked) {
      this.unlock(address, password)
      return true
    } else {
      this.lock(address)
      return false
    }
  }

  lock(address) {
    const pair = keyring.getPair(address)
    if (pair && !pair.isLocked) {
      pair.lock()
      this.keytimer && clearTimeout(this.keytimer)
      this.keytimer = null
      this.store.commit('auth/SET_Locked', true)
    }
  }

  unlock(address, password, timeout) {
    if (!timeout) {
      timeout = config.unlockPeriod
    }
    const pair = keyring.getPair(address)

    if (timeout && !this.keytimer && pair && pair.isLocked && password) {
      pair.decodePkcs8(password)
      this.unlock(address, password)
      this.store.commit('auth/SET_Locked', false)
      const self = this
      this.keytimer = setTimeout(() => {
        self.lock()
      }, timeout * 1000)
      return true
    }
    return false
  }
}

export function setStore(store) {
  wallet.store = store
}

// main()
export const wallet = new Wallet()

export default Wallet
