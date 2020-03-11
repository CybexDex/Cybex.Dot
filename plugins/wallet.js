export default async ({ store }) => {
  // 初始化用户信息
  // 本地钱包
  console.log('init wallet')

  await store.dispatch('auth/loadLocalWallet')
}
