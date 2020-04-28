import { values } from 'lodash'

export default function({ app, store, params, route, redirect }) {
  const assetConfig = store.getters['gateway/assetConfigBySymbol']
  try {
    const cointype = params.cointype
    if (route.name.startsWith('lang-fund') && cointype) {
      const cfgData = assetConfig[cointype] || {}
      const [, , fundtype] = route.name.split('-')
      if (fundtype === 'transfer') {
      } else if (!cfgData[`${fundtype}Switch`]) {
        const newAssetItem = values(assetConfig).find(
          (o) => o[`${fundtype}Switch`]
        )
        if (newAssetItem) {
          redirect(app.i18n.path(`/fund/${fundtype}/${newAssetItem.cybname}`))
        }
      }
    }
  } catch (e) {
    if (
      route.name.startsWith('lang-fund-deposit') ||
      route.name.startsWith('lang-fund-withdraw')
    ) {
      throw new Error({ statusCode: 500 })
    }
  }
}
