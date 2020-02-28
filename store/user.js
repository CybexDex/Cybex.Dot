import { invert, keyBy } from 'lodash'
// 用户页面显示/行为/控件交互的设置
export const state = () => ({
  memokey: null, // 查看memo的一个key
  icons: null,
  bases: null,
  coins: {
    '1.3.0': 'CYB',
    '1.3.27': 'USDT'
  },
  whitelist: null,
  assets: null,
  total: {
    balance: 0,
    value: 0
  },
  inited: false,
  withdraw: null,
  deposit: null,
  versionFlag: null, // 版本弹窗
  noticeFlag: null, // 交易大赛弹窗
  assetTab: 0,
  pairs: null,
  userAssets: null, // 用户所有资产信息
  transferTo: {
    name: '',
    id: ''
  },
  assetConfig: null,
  topAssets: [],
  customAssets: []
})

export const getters = {
  bases: (state) => state.bases,
  coins: (state) => state.coins,
  coinsInvert: (state) => invert(state.coins),
  whitelist: (state) => invert(state.coins),
  icons: (state) => state.icons,
  assets: (state) => state.assets,
  total: (state) => state.total,
  inited: (state) => state.inited,
  withdraw: (state) => state.withdraw,
  deposit: (state) => state.deposit,
  versionFlag: (state) => state.versionFlag,
  noticeFlag: (state) => state.noticeFlag !== 'false',
  assetTab: (state) => {
    return state.assetTab
  },
  pairs: (state) => state.pairs,
  userAssets: (state) => state.userAssets,
  memokey: (state) => state.memokey,
  transferTo: (state) => state.transferTo,
  assetConfig: (state) => state.assetConfig,
  assetConfigBySymbol: (state) => {
    return keyBy(state.assetConfig || [], 'cybname')
  },
  assetConfigByName: (state) => {
    return keyBy(state.assetConfig || [], 'name')
  },
  assetConfigById: (state) => {
    return keyBy(state.assetConfig || [], 'cybid')
  },
  topAssets: (state) => state.topAssets,
  customAssets: (state) => state.customAssets,
  customAssetsInvert: (state) => invert(state.customAssets)
}

export const mutations = {
  setBases(state, bases) {
    state.bases = bases
  },
  SET_COIN(state, coins) {
    state.coins = coins
  },
  // SET_WHITELIST(state, { whitelist }) {
  //   state.whitelist = whitelist;
  // },
  SET_ASSET_CONFIG(state, { assetConfig, topAssets }) {
    state.assetConfig = assetConfig
    state.topAssets = topAssets
  },
  SET_ICONS(state, icons) {
    state.icons = icons
  },
  SET_ASSETS(state, assets) {
    state.assets = assets
  },
  SET_TOTAL(state, total) {
    state.total = total
  },
  SET_INITED(state, val) {
    state.inited = val
  },
  SET_VERSION_FLAG(state, { username, flag }) {
    state.versionFlag = flag
    localStorage.setItem(`${username}_noversion`, flag)
  },
  SET_NOTICE_FLAG(state, { username, flag, save }) {
    state.noticeFlag = flag
    if (save) {
      localStorage.setItem(`${username}_no_notice`, flag)
    }
  },

  UPDATE_ASSET_TAB(state, { username, tab }) {
    state.assetTab = tab
    localStorage.setItem(`${username}_assettab`, tab)
  },
  SET_PAIRS(state, pairs) {
    state.pairs = Object.assign({}, pairs)
  },
  SET_USER_ASSETS(state, assets) {
    state.userAssets = assets
  },
  SET_MEMO_KEY(state, key) {
    state.memokey = key || 'empty'
  },
  CLEAR_MEMO_KEY(state) {
    state.memokey = null
  },
  SET_TRANSFER_TO(state, user) {
    state.transferTo = user
  },
  SET_CUSTOM_ASSETS(state, assets) {
    state.customAssets = assets
  }
}

export const actions = {
  async init({ dispatch, commit }) {
    // console.log('start init')
    await Promise.all([
      await dispatch('load_coinmap'),
      await dispatch('load_icons'),
      await dispatch('load_bases')
    ])
    commit('SET_INITED', true)
  },
  setTotal({ commit }, total) {
    commit('SET_TOTAL', total)
  },

  loadVersionFlag({ commit }, username) {
    const flag = localStorage.getItem(`${username}_noversion`)
    if (flag) {
      commit('SET_VERSION_FLAG', { username, flag: JSON.parse(flag) })
    }
  },
  loadNoticeFlag({ commit }, username) {
    let flag = localStorage.getItem(`${username}_no_notice`)
    if (flag === null) {
      flag = 'false'
    }
    commit('SET_NOTICE_FLAG', { username, flag })
  },
  loadAssetTab({ commit }, username) {
    const tab = parseInt(localStorage.getItem(`${username}_assettab`))
    if (tab === 0 || tab === 1) {
      commit('UPDATE_ASSET_TAB', { username, tab })
    }
  }
}
