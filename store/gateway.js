import { keyBy } from 'lodash'

export const state = () => ({
  assets: null
})

export const getters = {
  assets: (state) => state.assets,
  assetConfigBySymbol: (state) => {
    return keyBy(state.assets || [], 'cybname')
  },
  assetConfigByName: (state) => {
    return keyBy(state.assets || [], 'name')
  },
  assetConfigById: (state) => {
    return keyBy(state.assets || [], 'cybid')
  }
}

export const mutations = {
  SET_GW_ASSETS(state, assets) {
    state.assets = assets
  }
}

export const actions = {}
