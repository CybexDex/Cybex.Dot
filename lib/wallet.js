import keyring from '@polkadot/ui-keyring'
import { mnemonicGenerate, cryptoWaitReady } from '@polkadot/util-crypto'

class Wallet {
  static CreateWallet(user, password, mnemonic) {
    const seed = mnemonic ?? mnemonicGenerate()
    const result = keyring.addUri(
      `${seed}`,
      password,
      { name: user.trim(), tags: [] },
      'ed25519' // sr25519
    )
    const json = result.json
    const { address } = result.pair

    return { seed, address, json }
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

  // return last lock state
  static switchLockState(address, password) {
    const pair = keyring.getPair(address)
    if (pair.isLocked) {
      if (password) {
        pair.decodePkcs8(password)
      }
      return true
    } else {
      pair.lock()
      return false
    }
  }
}

// main()
export default Wallet
