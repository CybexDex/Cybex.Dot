// import UserStorageService from '~/lib/storage'
import Wallet from '~/lib/wallet'
import CybexDotClient from '~/lib/CybexDotClient'

import UserStorageService from '~/lib/storage'

// auth.js
// 用户身份验证 解锁等相关逻辑
export const state = () => ({
  username: null, // 当前用户,
  islocked: true,
  seed: null,
  address: null,
  backupJson: null,

  mnemonicBackup: false,
  hasNotice: false // 是否有新通知
})

export const getters = {
  username: (state) => state.username,
  seed: (state) => state.seed,
  address: (state) => state.address,
  backupJson: (state) => state.backupJson,

  islocked: (state) => state.islocked,
  hasNotice: (state) => state.hasNotice,
  mnemonicBackup: (state) => state.mnemonicBackup
}

export const mutations = {
  initAuthInfo(state, { username, address, json }) {
    state.address = address
    state.username = username
    state.backupJson = json
  },
  needMnemonicBackup(state, { need }) {
    state.mnemonicBackup = need
    if (!need) {
      state.seed = null
    }
  },
  SET_SEED(state, seed) {
    state.seed = seed
  },
  SET_ADDRESS(state, address) {
    state.address = address
  },
  SET_BackupJSON(state, backupJson) {
    state.backupJson = backupJson
  },
  SET_Locked(state, lock) {
    state.islocked = lock
  }

  // async setNotice(state, val) {
  //   state.hasNotice = val
  //   if (state.wallet && !val) {
  //     const storage = new UserStorageService()
  //     await storage.cleanBackupNotice()
  //   }
  // },
}

export const actions = {
  // after register unlocked
  register({ dispatch, commit }, { username, password, mnemonic }) {
    const { address, seed, json, pair } = Wallet.CreateWallet(
      username,
      password,
      mnemonic
    )

    if (address && seed && json && pair) {
      commit('SET_SEED', seed)
      commit('needMnemonicBackup', { need: true })
      // commit('setNotice', { val: true })
      dispatch('accountInit', {
        username,
        address,
        password,
        json
      })
      return true
    }
    return false
  },
  // after login locked
  login({ dispatch }, { json, password }) {
    const pair = Wallet.addAccount(json, password)

    if (pair) {
      const username = pair.meta.name

      dispatch('accountInit', {
        username,
        address: pair.address,
        password,
        json
      })
      return true
    } else {
      return false
    }
  },
  // unlock and start timer
  accountInit(
    { commit, state, rootState },
    { username, address, password, json }
  ) {
    commit('initAuthInfo', {
      username,
      address,
      json
    })

    this.$cookies.set('auth-username', username)
    this.$cookies.set('auth-address', address)

    new UserStorageService().setLocalWalletName(username)
    new UserStorageService().setCurrentAddress(address)

    this._vm.$wallet.unlock(address, password)
    const pair = Wallet.getPair(address)
    if (pair) {
      CybexDotClient.setSignAccount(pair)
    }
  },
  async loadLocalWallet({ commit, state, rootState }) {
    const username = new UserStorageService().getLocalWalletName()
    const address = new UserStorageService().getCurrentAddress()
    if (address) {
      await Wallet.loadCached(address)
      const json = new UserStorageService().getEncodeJSON(address)
      if (username && json) {
        commit('initAuthInfo', {
          username,
          address,
          json: JSON.parse(json)
        })
        this.$cookies.set('auth-username', username)
        this.$cookies.set('auth-address', address)

        const pair = Wallet.getPair(address)

        if (pair) {
          CybexDotClient.setSignAccount(pair)
        }
      }
    } else {
      await Wallet.loadCached()
    }
  },
  // 切换 锁状态
  // return locked
  toggleLock({ commit, state }, noLoginPage) {
    if (this._vm.$wallet.switchLockState(state.address)) {
      this._vm.$toggleLock(true) // 打开 UnlockDialog 输入密码

      return false
    } else {
      return true
    }
  },
  unlock({ state }, { password, toggleDialog = false }) {
    const result = this._vm.$wallet.unlock(state.address, password)
    if (result && toggleDialog) {
      this._vm.$toggleLock(false)
    }
  },
  lock({ state }) {
    this._vm.$wallet.lock(state.address)
  },
  logout({ commit, state }, { redirect, showLogout }) {
    this._vm.$wallet.lock(state.address)

    Wallet.forgetCurrentAccount(state.address)

    commit('initAuthInfo', {
      username: null,
      address: null,
      json: null
    })

    this.$cookies.remove('auth-username')
    this.$cookies.remove('auth-address')

    new UserStorageService().removeCurrentAddress()
    new UserStorageService().removeLocalWalletName()

    CybexDotClient.setSignAccount(null)
    if (showLogout) {
      this._vm.$toggleLogout()
    }
    if (redirect) {
      this.$router.push(redirect)
    }
  },
  getUnlockPeriod(_, address) {
    return UserStorageService.getUnlockPeriod(address)
  },
  setUnlockPeriod(_, { address, val }) {
    return UserStorageService.setUnlockPeriod(address, val)
  }
}
