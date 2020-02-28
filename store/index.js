export const state = () => ({
  showMsg: false,
  msgContent: '',
  msgType: '',
  msgDelay: 3000,
  showUnlock: false,
  showLogout: false,
  showVersion: false,
  dwCoinType: null,
  navMenus: { internal: {}, external: {} } // 导航栏设置
})

export const getters = {
  showMsg: (state) => state.showMsg,
  msgContent: (state) => state.msgContent,
  msgType: (state) => state.msgType,
  msgDelay: (state) => state.msgDelay
}

export const mutations = {
  SHOW_MSG(state, { type, message, delay }) {
    state.showMsg = true
    state.msgContent = message
    state.msgType = type
    state.msgDelay = delay || state.msgDelay
  },
  CLOSE_MSG(state) {
    state.showMsg = false
  },
  TOGGLE_UNLOCK(state) {
    state.showUnlock = !state.showUnlock
  },
  TOGGLE_LOGOUT(state, val) {
    if (val !== undefined && val !== null) {
      state.showLogout = val
    } else {
      state.showLogout = !state.showLogout
    }
  },
  TOGGLE_VERSION(state) {
    state.showVersion = !state.showVersion
  },
  UPDATE_DW_COINTYPE(state, cointype) {
    state.dwCoinType = cointype
  },
  SET_NAV_MENUS: (state, menus) => {
    state.navMenus = Object.assign(state.navMenus, menus)
  }
}

export const actions = {}
