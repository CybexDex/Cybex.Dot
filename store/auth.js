// auth.js
// 用户身份验证 解锁等相关逻辑
export const state = () => ({
  info: null, // 用户全信息
  username: 'Dave', // 当前用户,
  islocked: null
})

export const getters = {
  info: (state) => state.info,
  username: (state) => state.username,
  islocked: (state) => (state.info ? state.info.getIsLocked() : null)
}

export const mutations = {}

export const actions = {}
