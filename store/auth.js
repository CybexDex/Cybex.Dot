// import UserStorageService from '~/lib/storage'
import Wallet from '~/lib/wallet'
import UserStorageService from '~/lib/storage'

// auth.js
// 用户身份验证 解锁等相关逻辑
export const state = () => ({
  username: null, // 当前用户,
  islocked: null,
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
    state.lock = lock
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
  register({ dispatch, commit }, { username, password, mnemonic }) {
    const { address, seed, json } = Wallet.CreateWallet(
      username,
      password,
      mnemonic
    )

    if (address && seed && json) {
      commit('SET_SEED', seed)
      commit('needMnemonicBackup', { need: true })
      // commit('setNotice', { val: true })
      dispatch('accountInit', {
        username,
        address,
        json
      })
      return true
    }
    return false
  },
  login({ dispatch }, { json, password }) {
    const pair = Wallet.addAccount(json, password)

    if (pair) {
      const username = pair.meta.name

      dispatch('accountInit', {
        username,
        address: pair.address,
        json
      })
      return true
    } else {
      return false
    }
  },
  accountInit({ commit, state, rootState }, { username, address, json }) {
    commit('initAuthInfo', {
      username,
      address,
      json
    })

    this.$cookies.set('auth-username', username)

    new UserStorageService().setLocalWalletName(username)
    new UserStorageService().setCurrentAddress(address)
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
      }
    } else {
      await Wallet.loadCached()
    }
  },
  // 切换 锁状态

  toggleLock({ commit, state }, noLoginPage) {
    if (Wallet.switchLockState(state.address)) {
      this._vm.$toggleLock() // 打开 UnlockDialog 输入密码
    } else {
      commit('SET_Locked', true)
    }
  },
  logout({ commit, state }, { redirect, showLogout }) {
    Wallet.forgetCurrentAccount(state.address)

    commit('initAuthInfo', {
      username: null,
      address: null,
      json: null
    })

    this.$cookies.remove('auth-username')
    new UserStorageService().removeCurrentAddress()
    new UserStorageService().removeLocalWalletName()

    if (showLogout) {
      this._vm.$toggleLogout()
    }
    if (redirect) {
      this.$router.push(redirect)
    }
  }
}
