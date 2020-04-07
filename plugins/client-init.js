import CybexDotClient from '~/lib/CybexDotClient.js'

export default async ({ store }) => {
  await CybexDotClient.init()

  const currency = store.state.exchange.pair

  if (currency) {
    CybexDotClient.setPairInfo(
      currency.base.id,
      currency.quote.id,
      currency.id,
      currency.base.precision,
      currency.quote.precision
    )
  }
}
