<template>
  <v-flex
    class="exchange-block-container market-trades-container has-scroll FlexHalf-2"
  >
    <div class="exchange-block-title">
      <span>{{ $t('exchange.block-title.market-trades') }}</span>
    </div>
    <Loading v-if="isLoading" />
    <template v-else class="exchange-block-containerWrapper">
      <div ref="rowsContent" class="trade-row-container">
        <perfect-scrollbar :options="{ useBothWheelAxes: true }">
          <div v-for="(trade, idx) in trades" :key="idx" class="trade-row">
            <span
              class="price"
              :class="{
                'c-buy': trade.tradetype == 'buy',
                'c-sell': trade.tradetype == 'sell'
              }"
              @click="
                $emit('set-form-price', {
                  price: parseFloat(trade.price).toFixed(digitsPrice)
                })
              "
              >{{ trade.price | roundDigits(digitsPrice) | shortenPrice }}</span
            >
            <span class="amount">{{
              trade.quote
                | roundDigits(digitsAmount)
                | avoidMinAmount(digitsAmount)
            }}</span>
            <span class="time c-white-30">{{
              trade.time | localDate('HH:mm:ss')
            }}</span>
          </div>
        </perfect-scrollbar>
      </div>
    </template>
  </v-flex>
</template>

<script>
import { mapGetters } from 'vuex'
import utils from '~/components/mixins/utils'
import CybexDotClient from '~/lib/CybexDotClient.js'
import config from '~/lib/config/config'

export default {
  components: {
    Loading: () => import('~/components/exchange/ExchangeLoading.vue')
  },
  mixins: [utils],
  data() {
    return {
      intervalMarketTrade: null,
      trades: [],
      containerWidth: '',
      isLoading: true
    }
  },
  computed: {
    ...mapGetters({
      tradesRefreshRate: 'exchange/tradesRefreshRate',
      currentOrderPrice: 'exchange/currentRTEPrice'
    }),
    digitsPrice() {
      return this.pair.book.last_price || 5
    },
    digitsAmount() {
      return this.pair.book.amount || 5
    }
  },
  watch: {
    trades(newVal, oldVal) {
      // base_id
      this.isLoading = false
    }
  },
  async mounted() {
    await this.initData()
    document.addEventListener('visibilitychange', this.bindIntervalEvent)
  },
  beforeDestroy() {
    this.removeInterval()
    document.removeEventListener('visibilitychange', this.bindIntervalEvent)
  },
  methods: {
    async bindIntervalEvent() {
      if (document.visibilityState === 'hidden') {
        this.removeInterval()
      } else if (document.visibilityState === 'visible') {
        await this.initData()
      }
    },
    initData() {
      // 动态获取最新交易信息
      this.$eventHandle(this.fetchSubstrateMarketTrades, [
        this.base_id,
        this.quote_id
      ])
        .then(() => {
          this.isLoading = false
        })
        .catch((e) => {})
    },
    removeInterval() {
      if (this.intervalMarketTrade) {
        // 确保定时器清除
        clearInterval(this.intervalMarketTrade)
        this.intervalMarketTrade = null
      }
    },

    async fetchSubstrateMarketTrades() {
      const func = async () => {
        const trades = await CybexDotClient.getTrades(
          50,
          null,
          CybexDotClient.info.tradePairHash
        )

        this.trades = trades.map((t) => {
          return {
            tradetype: t.otype === 0 ? 'buy' : 'sell',
            price:
              (t.price * 10 ** this.priceMatchedPrecision) /
              config.pricePrecision,
            quote: t.quote_amount / 10 ** this.quotePrecision,
            time: t.datetime
          }
        })
      }
      await func()
      // console.log(">>>>>> Market Trades 实时交易数据", this.trades);
      if (!this.intervalMarketTrade) {
        this.intervalMarketTrade = setInterval(async function() {
          await func()
        }, this.tradesRefreshRate)
      }
    }
  },
  head() {
    const currencies = (
      this.$route.params.currency ||
      this.$route.params.pairs ||
      ''
    ).replace(/_/, '/')
    // todo 动态获取价格
    let price = this.currentOrderPrice
    const digits = this.digitsPrice
    price = price ? parseFloat(price).toFixed(digits) : 0
    return {
      title: this.$t('title.exchange', {
        price: price || '--',
        currencies
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~assets/style/_fonts/_font_mixin';

.market-trades-container {
  margin-left: 14px;
}

.exchange-block-title {
  margin-bottom: 6px;
  width: calc(100% - 12px);
}

.trade-row-container {
  display: block;
  overflow-y: auto;
  height: calc(100% - 46px - 7px);
  @include f-cybex-style(heavy);
}

.trade-row {
  height: 20px;
  display: flex;
  align-items: center;
  line-height: 1.67;

  // f-cybex-style(roman);
  > span {
    display: inline-block;
    // opacity: 0.8;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;

    &:hover {
      &.price {
        opacity: 0.7;
      }

      cursor: pointer;
    }

    &.price {
      flex: 1 1 82px;
    }

    &.amount {
      flex: 1 1 50px;
      text-align: right;
      color: rgba(255, 255, 255, 0.8);
    }

    &.time {
      flex: 1 1 85px;
      text-align: right;
      padding-right: 16px;
    }
  }
}
</style>
