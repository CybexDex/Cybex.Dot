import Vue from 'vue'
import { wallet, setStore } from '~/lib/wallet'

export default async ({ store }) => {
  // 初始化用户信息
  // 本地钱包
  setStore(store)
  console.log('~~~~~~~~', wallet)

  Vue.prototype.$wallet = wallet

  await store.dispatch('auth/loadLocalWallet')
}
