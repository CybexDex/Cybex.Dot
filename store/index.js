export const state = () => ({
  showMsg: false,
  msgContent: '',
  msgType: '',
  msgDelay: 3000,
  showUnlock: false,
  showLogout: false,
  showVersion: false
})

export const getters = {
  showMsg: (state) => state.showMsg,
  showUnlock: (state) => state.showUnlock,
  showLogout: (state) => state.showLogout,
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
  TOGGLE_UNLOCK(state, val) {
    state.showUnlock = val
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
  }
}

export const actions = {}
