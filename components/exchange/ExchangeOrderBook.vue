<template>
  <v-container class="FlexHalf-2 pb-0 px-0" fill-height>
    <v-row>
      <v-col><span>1</span></v-col>
      <v-col><span>2</span></v-col>
    </v-row>
    <v-row>
      <v-col><span>2</span></v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'
import { reverse, maxBy, concat, take, takeRight } from 'lodash'
import utils from '~/components/mixins/utils'
import CybexDotClient from '~/lib/CybexDotClient.js'

export default {
  mixins: [utils],
  data() {
    return {
      rowHeight: 20,
      rteRows: 10,
      showDecimal: false,
      groupDecimal: null,
      order: 'all',
      orderSellRows: [],
      orderBuyRows: [],
      intervalRTE: null,
      currentIsUp: null
    }
  },
  computed: {
    ...mapGetters({
      baseCurrency: 'exchange/base',
      quoteCurrency: 'exchange/quote',
      // base_id: 'exchange/base_id',
      // base_digits: 'exchange/base_digits',

      // quote_id: 'exchange/quote_id',
      // quote_digits: 'exchange/quote_digits',
      priceDigits: 'exchange/priceDigits',
      legalSymbol: 'i18n/symbol',
      locale: 'i18n/locale',
      // prefix: 'exchange/prefix',
      currentOrderPrice: 'exchange/currentRTEPrice',
      currentOrderLegalPrice: 'exchange/currentOrderLegalPrice',
      netstatus: 'exchange/netstatus',
      refreshRate: 'exchange/tradesRefreshRate'
    }),
    rowsFullHeight() {
      return this.$refs.container.clientHeight - 28 - 17 - 40 // current price, sub title, title
    },
    // 监听当前网络状态
    currentNetStatus() {
      let r
      // console.log('this.netstatus', this.netstatus);
      if (!this.netstatus) return 'warning'
      if (!this.netstatus.market && !this.netstatus.history) {
        r = 'error'
      } else if (
        !this.netstatus.market ||
        !this.netstatus.history ||
        !this.netstatus.order ||
        !this.netstatus.trade
      ) {
        r = 'warning'
      } else {
        r = 'normal'
      }
      return r
    },
    digitsPrice() {
      const defaultDigits = 8

      return defaultDigits
    },
    digitsAmount() {
      const defaultDigits = 0

      return defaultDigits
    },
    digitsTotal() {
      const defaultDigits = 0

      return defaultDigits
    },
    currentGroupDecimal: {
      get() {
        return this.priceDigits
      },
      set(v) {
        this.$store.commit('exchange/SET_PRICE_DIGITS', v)
      }
    }
  },
  watch: {
    $route() {
      this.getDigitsDropdown()
      this.changeFilter('all')
    },
    currentOrderPrice(newVal, oldVal) {
      if (newVal !== null && oldVal !== null) {
        const newV = parseFloat(newVal).toFixed(this.currentGroupDecimal)
        const oldV = parseFloat(oldVal).toFixed(this.currentGroupDecimal)
        if (newV === oldV) {
          this.currentIsUp = null
        } else if (newV > oldV) {
          this.currentIsUp = true
        } else if (newV < oldV) {
          this.currentIsUp = false
        }
      }
    },
    order() {
      this.setScrollTop()
    },
    rteRows() {
      this.setScrollTop()
    }
  },

  mounted() {
    // 计算下拉菜单
    this.getDigitsDropdown()
    this.changeFilter('all')
    document.addEventListener('click', this.clickDocumentShowDecimal, false)
    document.addEventListener('visibilitychange', this.bindIntervalEvent)
  },
  beforeDestroy() {
    this.removeInterval()
    this.currentGroupDecimal = null
    document.removeEventListener('click', this.clickDocumentShowDecimal, false)
    document.removeEventListener('visibilitychange', this.bindIntervalEvent)
  },
  methods: {
    async bindIntervalEvent() {
      if (document.visibilityState === 'hidden') {
        this.removeInterval()
      } else if (document.visibilityState === 'visible') {
        await this.initRTEData()
      }
    },
    removeInterval() {
      if (this.intervalRTE) {
        clearInterval(this.intervalRTE)
        this.intervalRTE = null
      }
    },
    clickDocumentShowDecimal() {
      if (this.showDecimal) {
        this.showDecimal = false
      }
    },
    toggleShowDecimal(evt) {
      if (!this.showDecimal) {
        this.showDecimal = true
        evt.stopPropagation()
      }
    },
    /**
     * 点击Price，只设置Price
     * 点击Amount或者Total，设置Price 累加Total, 根据价格反推出Amount
     */
    changePrice(row, idx, side) {
      const price = parseFloat(row.price).toFixed(this.digitsPrice)
      let total = null
      let amount = null
      if (side === 'buy' && row.price !== null) {
        total = 0
        const arrs = take(this.orderBuyRows, idx + 1)
        arrs.forEach((item) => {
          total += item.total
          amount += item.amount
        })
      } else if (side === 'sell' && row.price !== null) {
        total = 0
        const arrs = takeRight(
          this.orderSellRows,
          this.orderSellRows.length - idx
        )
        arrs.forEach((item) => {
          total += item.total
          amount += item.amount
        })
      }
      if (price) {
        this.$emit('set-form-price', {
          price,
          total,
          amount,
          side
        })
      }
    },
    // 更改查看值
    changeFilter(order) {
      this.order = order
      this.orderSellRows = []
      this.orderBuyRows = []
      this.initRTEData()
    },
    async changeGroupDecimal(decimal) {
      if (this.currentGroupDecimal !== decimal.value) {
        this.currentGroupDecimal = decimal.value
        this.orderSellRows = []
        this.orderBuyRows = []
        await this.initRTEData()
      }
      this.showDecimal = !this.showDecimal
    },
    calculatePosition(buyRows, sellRows) {
      if (!buyRows) {
        buyRows = this.orderBuyRows
      }
      if (!sellRows) {
        sellRows = this.orderSellRows
      }
      let rowMax, find, target
      // 重新计算百分比
      switch (this.order) {
        case 'sell':
          find = sellRows
          target = [this.orderSellRows]
          break
        case 'buy':
          find = buyRows
          target = [this.orderBuyRows]
          break
        case 'all':
        default:
          // 找寻 buy 和 sell中的最大值
          find = concat(sellRows, buyRows)
          target = [this.orderSellRows, this.orderBuyRows]
      }
      if (find.length) {
        rowMax = maxBy(find, (arr) => arr.total).total
        target.forEach((arr) => {
          arr.map((v) => {
            v.perc = parseFloat(v.total / rowMax).toFixed(2) * 100
            return v
          })
        })
      }
    },
    // 计算可用下拉菜单
    getDigitsDropdown() {
      if (!this.digitsPrice) return
      let maxVal = this.digitsPrice
      const tmp = {}
      let min
      if (maxVal >= 3) {
        min = maxVal - 4 + 1
        // for PCX 临时挖矿设置
      } else if (maxVal === 1) {
        maxVal = 1
        min = 0
      } else {
        maxVal = 2
        min = 0
      }
      for (let i = min; i <= maxVal; i++) {
        tmp[i] = {
          value: i,
          text: this.$t('exchange.orderbook.digitsmulti', { digit: i })
        }
      }
      this.groupDecimal = tmp
      if (
        this.currentGroupDecimal === null ||
        this.currentGroupDecimal === undefined
      ) {
        this.currentGroupDecimal = maxVal || null
      }
    },
    initRTEData() {
      this.removeInterval()
      this.$eventHandle(this.getOrderBookByDigits)
        .then(() => {
          this.$store.commit('exchange/SET_MDP_CONNECT_STATUS', true)
        })
        .catch((e) => {
          this.$store.commit('exchange/SET_MDP_CONNECT_STATUS', false)
        })
    },
    setScrollTop() {
      // console.log('this.order', this.order);
      if (this.order === 'all') {
        this.$nextTick(() => {
          if (this.$refs.buyRows) {
            this.$refs.buyRows.scrollTop = 0
            this.$refs.buyRows.style = ''
          }
          if (this.$refs.sellRows) {
            const h = Math.floor(this.rowsFullHeight / 2)
            const marginTop = Math.ceil(h - this.rteRows * this.rowHeight)
            const height = this.rteRows * this.rowHeight
            this.$refs.sellRows.style = `height: ${height}px; margin-top: ${marginTop}px;`
          }
        })
      } else if (this.order === 'sell') {
        this.$nextTick(() => {
          if (this.$refs.buyRows) {
            this.$refs.buyRows.scrollTop = 0
            this.$refs.buyRows.style = ''
          }
          // console.log('this.$refs.sellRows', this.$refs.sellRows);
          if (this.$refs.sellRows) {
            let marginTop = Math.floor(
              this.rowsFullHeight - this.rteRows * this.rowHeight
            )
            let height = this.rteRows * this.rowHeight
            if (this.rowsFullHeight - height < 0) {
              height = this.rowsFullHeight
            }
            if (marginTop < 0) {
              marginTop = 0
            }
            this.$refs.sellRows.style = `height: ${height}px; margin-top: ${marginTop}px`
          }
        })
      } else {
        this.$nextTick(() => {
          if (this.$refs.sellRows) {
            this.$refs.sellRows.scrollTop = 0
            this.$refs.sellRows.style = ''
          }
          if (this.$refs.buyRows) {
            this.$refs.buyRows.scrollTop = 0
            let height = this.rteRows * this.rowHeight
            if (this.rowsFullHeight - height < 0) {
              height = this.rowsFullHeight
            }
            this.$refs.buyRows.style = `height: ${height}px`
          }
        })
      }
    },
    // 请求RTE数据
    async getOrderBookByDigits() {
      const func = async () => {
        const orderBook = await CybexDotClient.getOrderBook(
          CybexDotClient.TradePairHash
        )

        this.orderSellRows = orderBook[0].map((o) => {
          return {
            price: o.price / 10 ** 8,
            amount: o.sell_amount,
            total: o.buy_amount
          }
        })
        this.orderBuyRows = orderBook[1].map((o) => {
          return {
            price: o.price / 10 ** 8,
            amount: o.buy_amount,
            total: o.sell_amount
          }
        })
      }

      await func()
      if (!this.intervalRTE) {
        this.intervalRTE = setInterval(async () => {
          await func()
        }, this.refreshRate)
      }
    },

    async getRTEDataByDigits() {
      if (!(this.base_id && this.quote_id)) {
        return
      }
      const func = async () => {
        // 监听网络状态
        const v = this.cybexjs.all_status()
        this.$store.commit('exchange/SET_NETSTATUS', v)

        const singleEle = this.rowHeight
        if (this.$refs.container) {
          let h
          if (this.order === 'all') {
            h = Math.floor(this.rowsFullHeight / singleEle)
            this.rteRows = Math.ceil(h / 2)
          } else if (this.order === 'buy') {
            h = Math.floor(this.rowsFullHeight / singleEle)
            this.rteRows = h
          } else {
            h = Math.floor(this.rowsFullHeight / singleEle)
            this.rteRows = h
          }
          const sellRows = []
          const buyRows = []
          const emptyItem = {
            price: null,
            amount: null,
            total: null
          }
          // console.log(
          //   "rte参数",
          //   this.base_id,
          //   this.quote_id,
          //   this.currentGroupDecimal,
          //   this.rteRows
          // );
          const rteData = await this.cybexjs.getDepth(
            this.base_id,
            this.quote_id,
            this.currentGroupDecimal,
            this.rteRows
          )
          if (rteData !== null && rteData !== {}) {
            // sell - ask
            // buy - bid
            // console.log('rteData.price', rteData.price);
            if (Object.prototype.hasOwnProperty.call(rteData, 'price')) {
              const currentOrderPrice = rteData.price ? rteData.price : 0
              const currentOrderLegalPrice = null
              // 如果是自定义交易对
              // 不需要显示法币价格

              this.$store.commit('exchange/SET_CURRENT_RTE_PRICE', {
                price: currentOrderPrice,
                legalPrice: currentOrderLegalPrice
              })
            } else {
              this.$store.commit('exchange/SET_CURRENT_RTE_PRICE', {
                price: 0,
                legalPrice: 0
              })
            }
            if (rteData.asks && rteData.asks.length) {
              for (let i = this.rteRows - 1; i >= 0; i--) {
                const ask = rteData.asks[i]
                if (ask) {
                  sellRows[i] = {
                    price: parseFloat(ask[0]),
                    amount: parseFloat(ask[1]),
                    total: parseFloat(ask[2])
                  }
                } else {
                  sellRows[i] = emptyItem
                }
              }
            }
            if (rteData.bids && rteData.bids.length) {
              for (let i = 0; i < this.rteRows; i++) {
                const bid = rteData.bids[i]
                if (bid) {
                  buyRows[i] = {
                    price: parseFloat(bid[0]),
                    amount: parseFloat(bid[1]),
                    total: parseFloat(bid[2])
                  }
                } else {
                  buyRows[i] = emptyItem
                }
              }
            }
            this.orderBuyRows = buyRows
            this.orderSellRows = reverse(sellRows)
            this.calculatePosition(buyRows, sellRows)
          }
        }
      }
      await func()
      if (!this.intervalRTE) {
        this.intervalRTE = setInterval(async () => {
          await func()
        }, 500)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/style/_fonts/_font_mixin';
@import '~/assets/style/_vars/_colors';

.hidden {
  display: none !important;
}

.status-tips {
  padding: 16px;
  background-color: rgba(17, 22, 33, 0.92);
  border-radius: 4px;
}

.status-tips-item {
  min-width: 160px;
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;

  > span {
    display: flex;
    flex: 1 1 auto;
  }

  .s-icon {
    flex: 0 0 auto;
    border-radius: 50%;
    border: white 1px solid;
    width: 7px;
    height: 7px;
    box-shadow: inset 0 0 0 0px white, 0px 0px 0px 4px rgba(255, 255, 255, 0.1);
    margin: 10px;
    background: #417505;

    &.delay {
      background: $exchange-sell;
    }

    margin: -3px 16px 0 0;
  }

  .s-name {
    color: $white-opacity-80;
  }

  .s-status {
    justify-content: flex-end;
  }
}

.exchange-block-container {
  padding: 0px;
  overflow: hidden;

  > *:not(.info-row-container) {
    padding: 0 8px;
  }
}

.exchange-block-title {
  align-items: center;
}

.order-choosen {
  justify-content: space-between;
  flex: 0 0 88px !important;

  > span {
    flex: 0 0 24px !important;
    display: flex;
    height: 24px;
    justify-content: center;
    border: 1px solid rgba(131, 138, 160, 0.2);
    border-radius: 4px;
    transition: transform 0.2s;

    &.active,
    &:hover {
      // background-color: #293246;
      border: 1px solid rgba(131, 138, 160, 1);
    }

    &:hover:not(.active) {
      transform: scale(1.1);
    }
  }
}

.exchange-list-head {
  line-height: 1;

  > span {
    display: inline-flex;
    flex: 1 1 33% !important;
    white-space: nowrap;
    word-break: keep-all;

    &.amount {
      text-align: right;
      justify-content: flex-end;
    }

    &.total {
      text-align: right;
      justify-content: flex-end;
      flex: 1 1 42% !important;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0 !important;
    display: none !important;
    visibility: hidden !important;
  }

  to {
    opacity: 1;
    display: block;
    visibility: visible;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0 !important;
    display: none !important;
    visibility: hidden !important;
  }

  to {
    opacity: 1;
    display: block;
    visibility: visible;
  }
}

.hidden {
  // display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  transition: opacity 200ms, visibility 200ms;

  .table & {
    display: none !important;
  }
}

.info-row-container {
  /* height: calc(((100% - 28px - 15px - 40px) / 2)); */
  line-height: 1.67;
  overflow-y: hidden;
  transition: height 0.2s, opacity 0.1s;

  &.sell-rows {
    height: 200px;
    padding-top: 2px;
  }

  &:not(.close) {
    min-height: 72px; // 至少显示3条
  }

  &.full {
    transition: height 0.2s, opacity 0.1s ease-in-out;
    height: calc(100% - 28px - 32px - 40px);
    overflow-y: auto;
  }

  &.close {
    height: 0 !important;
    transition: height 0.2s, opacity 0.1s ease-in-out;
    opacity: 0;
  }

  .handicap {
    position: relative;
    padding: 0 8px;

    .info-row {
      flex: 1 1 33% !important;
      z-index: 1;
      // opacity: 0.8;
      user-select: none;
      -moz-user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
      cursor: pointer;
      line-height: 1.67;
      @include f-cybex-style(heavy, medium);

      &:hover {
        opacity: 0.7;
      }

      &.amount {
        text-align: right;
        color: rgba(255, 255, 255, 0.8);
      }

      &.total {
        text-align: right;
        flex: 1 1 42% !important;
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .groups-value {
      &.sell {
        background: rgba(80, 45, 45, 0.8);
      }

      &.buy {
        background: rgba(45, 65, 52, 0.8);
      }

      position: absolute;
      right: 0;
      height: 20px;
      display: inline-block;
      z-index: 0;
      // width: 180px;
    }
  }
}

.current-order {
  height: 28px;
  margin: 5px 0;
  background-color: rgba(255, 255, 255, 0.04);
  color: $white-opacity-80;
  // opacity: 0.8;
  font-size: 14px;
  @include f-cybex-style(heavy);

  > span {
    &:hover {
      opacity: 1;
    }

    display: flex;
    align-items: center;
    position: relative;
    padding-top: 2px;

    &.netstatus {
      justify-content: flex-end;
      flex: 0 0 auto !important;
    }

    &.up {
      color: $exchange-buy;

      .ic-arrow_up {
        font-size: 24px;
        display: flex;
        top: -2px;
        position: relative;

        &:before {
          color: $exchange-buy;
        }
      }
    }

    &.down {
      color: $exchange-sell;

      .ic-arrow_drop_down {
        font-size: 24px;
        display: flex;
        top: 0px;
        position: relative;

        &:before {
          color: $exchange-sell;
        }
      }
    }

    flex: 1 1 33% !important;
    cursor: pointer;

    &.amount {
      text-align: right;
      color: #ff9143;
      display: block;
    }

    &.total {
      flex: 1 1 42% !important;
    }

    &.current-amount {
      margin-left: 4px;
    }

    &.current-price {
      flex: 1 1 auto !important;
    }
  }
}

.group-order {
  height: 28px;
  display: flex;
  align-items: center;
  flex: 0 0 auto !important;

  .current-group {
    color: $white-opacity-80;
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    @include f-cybex-style('black', heavy);

    .selected-val {
      display: flex;
      align-items: center;
      color: map-get($main, grey);

      &:hover,
      &.active {
        color: $exchange-highlight;

        .icon:before {
          color: $exchange-highlight;
        }
      }

      .icon {
        top: -1px;
        right: -3px;
        position: relative;
        font-size: 16px;
      }
    }

    .decimal-selection {
      position: absolute;
      z-index: 3;
      min-width: 78px;
      line-height: 1;
      border-radius: 4px;
      box-shadow: 0 8px 10px 0 rgba(0, 0, 0, 0.2),
        0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 16px 24px 2px rgba(0, 0, 0, 0.14);
      background-color: #212939;
      padding: 8px 0;
      top: 16px;

      .selection-item {
        text-align: center;
        display: block;
        line-height: 32px;
        height: 32px;
        padding: 0 8px;

        &:hover {
          color: white;
          background-color: rgba(255, 255, 255, 0.04);
        }
      }
    }
  }
}
</style>
