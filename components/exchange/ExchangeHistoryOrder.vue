<template>
  <div
    class="orders-table-container"
    :class="{
      empty: !rowsData || rowsData.length == 0,
      'elevation-1': mode === 'full'
    }"
  >
    <v-flex
      ref="fixHeader"
      d-flex
      class="fixed-header"
      :class="{ hidden: !showFixedHeader }"
    >
      <div
        v-for="(header, idx) of headers"
        :key="idx"
        :class="{
          'text-left': header.align == 'left',
          'text-center': header.align == 'center',
          'text-right': header.align == 'right'
        }"
      >
        <div class="col-header" :class="'col-field-' + header.value">
          {{ header.text }}
        </div>
      </div>
    </v-flex>
    <perfect-scrollbar ref="scrollEle" :options="{ minScrollbarLength: 20 }">
      <v-data-table
        :loading="isLoading"
        :loading-text="loadingText"
        :headers="headers"
        :items="rowsData"
        dense
        hide-default-footer
        class="middle-size-table"
        :class="{ 'empty-table': !rowsData || rowsData.length == 0 }"
      >
        <template v-slot:header="props">
          <thead>
            <tr v-for="header in props.headers" :key="header.text">
              <th>
                <template v-if="header.text">{{ header.text }}</template>
              </th>
            </tr>
          </thead>
        </template>
        <template v-slot:item="{ item }">
          <tr
            class="table-middle"
            :class="{
              'c-cancel-order': item.status.toLowerCase() == 'canceled'
            }"
          >
            <td class="col-date">
              {{ item.time | date('DD/MM HH:mm:ss') }}
            </td>
            <td class="text-xs-left">
              <asset-pairs
                :max-width="limitAssetSize ? '100px' : null"
                :max-quote-width="limitAssetSize ? '40px' : null"
                :color-opacity="
                  item.status.toLowerCase() == 'canceled' ? 0.5 : 1
                "
                :quote-id="item.market.quote"
                :spacer="false"
                :base-id="item.market.base"
              />
            </td>
            <td
              class="text-xs-left text-uppercase"
              :class="{
                'c-buy': item.tradetype == 'buy',
                'c-sell': item.tradetype == 'sell'
              }"
            >
              {{ $t('exchange.content.' + item.tradetype.toLowerCase()) }}
            </td>
            <!-- <td class="text-xs-left">
              {{
                item.average
                  | roundDigits(item.asset_digit_price, null, '--')
                  | shortenPrice
              }}
            </td> -->
            <td class="text-xs-left">{{ item.price }}</td>
            <td class="text-xs-left">
              {{ item.filled | roundDigits(item.asset_digit_amount) }}
            </td>
            <td class="text-xs-left">
              {{ item.amount | roundDigits(item.asset_digit_amount) }}
            </td>
            <td class="text-xs-right">
              {{ item.total | roundDigits(item.asset_digit_base) }}
            </td>
            <td class="text-xs-right">
              {{
                $t(
                  'exchange.order-table.order-status-' +
                    item.status.toLowerCase()
                )
              }}
            </td>
          </tr>
        </template>

        <template slot="no-data">
          <div class="no-data">
            {{ $t('exchange.order-table.no-close-data') }}
          </div>
        </template>
      </v-data-table>
    </perfect-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { map } from 'lodash'
import moment from 'moment'

import utils from '~/components/mixins/utils'
import CybexDotClient from '~/lib/CybexDotClient.js'

export default {
  components: {
    // BaseQuoteSelector: () => import('~/components/BaseQuoteSelector.vue'),
    // CustomBaseQuoteSelector: () =>
    //   import('~/components/CustomBaseQuoteSelector.vue'),
    // ContestBaseQuoteSelector: () =>
    //   import('~/components/ContestBaseQuoteSelector.vue')
  },
  mixins: [utils],

  props: {
    mode: {
      type: String,
      default: 'exchange' // exchange | game | full
    },
    enableInterval: {
      type: Boolean,
      default: false
    },
    orderFilter: {
      type: Object,
      default: () => {}
    },
    whiteFlag: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loadingText: '',
      showFixedHeader: false,
      intervalRefresh: null,
      rowsData: [],
      isLoading: this.username !== '' && this.username !== null,
      bindPageEvent: false, // 是否绑定过翻页函数
      nextpage: false, // 是否在读取下一页
      startMenu: false, // 控制日历控件开关
      endMenu: false, // 控制日历控件开关
      limitDate: new Date(new Date().setMonth(new Date().getMonth() - 3))
        .toISOString()
        .substr(0, 10),
      today: new Date().toISOString().substr(0, 10),
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 3))
        .toISOString()
        .substr(0, 10),
      endDate: new Date().toISOString().substr(0, 10),
      // 表格数据 header设定
      headers: [
        {
          text: this.$t('exchange.order-table.column.date'),
          align: 'left',
          sortable: false,
          value: 'date'
        },
        {
          text: this.$t('exchange.order-table.column.pair'),
          align: 'left',
          sortable: false,
          value: 'market'
        },
        {
          text: this.$t('exchange.order-table.column.side'),
          align: 'left',
          sortable: false,
          value: 'tradetype'
        },
        // {
        //   text: this.$t('exchange.order-table.column.average'),
        //   align: 'left',
        //   sortable: false,
        //   value: 'average'
        // },
        {
          text: this.$t('exchange.order-table.column.price'),
          align: 'left',
          sortable: false,
          value: 'price'
        },
        {
          text: this.$t('exchange.order-table.column.fillamount'),
          align: 'left',
          sortable: false,
          value: 'filled'
        },
        {
          text: this.$t('exchange.order-table.column.amount'),
          align: 'left',
          sortable: false,
          value: 'amount'
        },
        {
          text: this.$t('exchange.order-table.column.total'),
          align: 'left',
          sortable: false,
          value: 'total'
        },
        {
          text: this.$t('exchange.order-table.column.status'),
          align: 'left',
          sortable: false,
          value: 'status'
        }
      ],
      page: 0,
      limit: 20,
      // 搜索框
      selectedPair: { base_id: '', quote_id: '' },
      // 当前使用的filter
      currentFilter: null
    }
  },
  computed: {
    ...mapGetters({
      bases: 'user/bases',
      coinMap: 'user/coins',
      coinsInvert: 'user/coinsInvert',
      username: 'auth/username',
      baseCurrency: 'exchange/base',
      quoteCurrency: 'exchange/quote',
      // base_id: 'exchange/base_id',
      // quote_id: 'exchange/quote_id',
      refreshRate: 'exchange/tradesRefreshRate',
      locale: 'i18n/locale',
      innerWidth: 'exchange/innerWidth'
    }),
    limitAssetSize() {
      return this.mode === 'exchange' && this.innerWidth <= 1680
    },
    couldSearchHistory() {
      if (this.whiteFlag !== 'custom') return false
      return !(
        (this.selectedPair.base_id === '' &&
          this.selectedPair.quote_id === '') ||
        (this.selectedPair &&
          this.selectedPair.base_id &&
          this.selectedPair.quote_id)
      )
    },
    filter() {
      return Object.assign({}, this.orderFilter, {
        start: null,
        end: null,
        base_id:
          this.mode === 'exchange'
            ? this.orderFilter.base_id
            : this.selectedPair.base_id
            ? this.selectedPair.base_id
            : null,
        quote_id:
          this.mode === 'exchange'
            ? this.orderFilter.quote_id
            : this.selectedPair.quote_id
            ? this.selectedPair.quote_id
            : null,
        white_flag: this.whiteFlag
      })
    },
    enddateDisplayFormatted() {
      return this.formatDate(this.endDate, this.dateDisplayFormat)
    },
    startdateDisplayFormatted() {
      return this.formatDate(this.startDate, this.dateDisplayFormat)
    }
  },
  watch: {
    async enableInterval(val) {
      if (val === true && this.mode === 'exchange') {
        // console.log('可以轮询 open order');
        await this.initData(false, true)
      } else {
        this.removeInterval()
      }
    },
    // 用户名变化时 重新拉取数据
    async username() {
      this.removeInterval()
      await this.initData()
    },
    rowsData(newVal) {
      if (newVal.length) {
        this.$nextTick(() => {
          if (!this.bindPageEvent) {
            this.bindPageEvent = true
            if (this.$refs.scrollEle) {
              this.$refs.scrollEle.$el.addEventListener(
                'ps-y-reach-start',
                () => {
                  this.showFixedHeader = false
                }
              )
              this.$refs.scrollEle.$el.addEventListener(
                'ps-scroll-y',
                this.onFixedHeader
              )
              this.$refs.scrollEle.$el.addEventListener(
                'ps-scroll-x',
                this.onFixedHeader
              )
              this.$refs.scrollEle.$el.addEventListener(
                'ps-y-reach-end',
                this.onScroll
              )
            }
          }
        })
      } else {
        // 取消滚动条绑定事件防止读取完数据后触发onscroll事件
        this.bindPageEvent = false
        this.showFixedHeader = false
        if (this.$refs.scrollEle) {
          this.$refs.scrollEle.$el.removeEventListener(
            'ps-y-reach-end',
            this.onScroll
          )
          this.$refs.scrollEle.$el.removeEventListener(
            'ps-y-reach-start',
            () => {
              this.showFixedHeader = false
            }
          )
          this.$refs.scrollEle.$el.removeEventListener(
            'ps-scroll-y',
            this.onFixedHeader
          )
          this.$refs.scrollEle.$el.removeEventListener(
            'ps-scroll-x',
            this.onFixedHeader
          )
          this.$nextTick(() => {
            this.$refs.scrollEle.$el.scrollTop = 0
          })
        }
      }
    }
  },
  async bindIntervalEvent() {
    if (document.visibilityState === 'hidden') {
      this.removeInterval()
    } else if (document.visibilityState === 'visible') {
      await this.initData(false, false)
    }
  },
  async mounted() {
    if (this.mode === 'exchange') {
      this.startDate = new Date(new Date().setDate(new Date().getDate() - 7))
        .toISOString()
        .substr(0, 10)
    }
    await this.initData()
    document.addEventListener('visibilitychange', this.bindIntervalEvent)
  },
  beforeDestroy() {
    this.removeInterval()
    document.removeEventListener('visibilitychange', this.bindIntervalEvent)
  },
  methods: {
    removeInterval() {
      if (this.intervalRefresh) {
        clearInterval(this.intervalRefresh)
        this.intervalRefresh = null
      }
    },
    onFixedHeader() {
      if (this.$refs.scrollEle.$el && this.$refs.fixHeader) {
        const cols = this.$refs.scrollEle.$el.querySelectorAll(
          "[role='columnheader']"
        )
        const headers = this.$refs.fixHeader.querySelectorAll('.col-header')
        headers.forEach((ele, idx) => {
          headers[idx].style.width = cols[idx].clientWidth + 'px'
        })
        this.showFixedHeader = true
      }
    },

    async initData(cleanRows = true, showLoading = true) {
      let times = 5
      let stop = false
      while (times > 0 && !stop) {
        await this.$eventHandle(() =>
          this.fetchOrderHistory(cleanRows, showLoading)
        )
          .then(() => {
            stop = true
            times = 0
            this.$store.commit('exchange/SET_CONNECT_STATUS', {
              orderConnect: true
            })
          })
          .catch((e) => {
            this.$store.commit('exchange/SET_CONNECT_STATUS', {
              orderConnect: false
            })
            times--
            this.$eventHandle(() =>
              this.fetchOrderHistory(cleanRows, showLoading)
            )
          })
      }
      if (times !== 0) {
        this.$store.commit('exchange/SET_CONNECT_STATUS', {
          orderConnect: false
        })
      }
    },
    onScroll(event) {},
    digitsPrice(item) {
      const base =
        item && item.market
          ? this.coinName(item.market.base, this.coinMap)
          : this.baseCurrency
      const quote =
        item && item.market
          ? this.coinName(item.market.quote, this.coinMap)
          : this.quoteCurrency
      const defaultDigits = this.isCustomPair(
        item.market.base,
        item.market.quote
      )
        ? 8
        : 5
      return this.getPairConfig(
        base,
        quote,
        'book',
        'last_price',
        defaultDigits
      )
    },
    digitsAmount(item) {
      const base =
        item && item.market
          ? this.coinName(item.market.base, this.coinMap)
          : this.baseCurrency
      const quote =
        item && item.market
          ? this.coinName(item.market.quote, this.coinMap)
          : this.quoteCurrency
      const defaultDigits = this.isCustomPair(
        item.market.base,
        item.market.quote
      )
        ? item.asset_digit_quote
        : 5
      return this.getPairConfig(base, quote, 'book', 'amount', defaultDigits)
    },
    digitsTotal(item) {
      const base =
        item && item.market
          ? this.coinName(item.market.base, this.coinMap)
          : this.baseCurrency
      const quote =
        item && item.market
          ? this.coinName(item.market.quote, this.coinMap)
          : this.quoteCurrency
      return this.getPairConfig(base, quote, 'book', 'total', 3)
    },
    calcFilterByDate(date) {
      let start, end
      let reset = true
      end = moment()
        .hour(23)
        .minute(59)
        .second(59)
        .utc()
        .format(this.dateXHRFormat)
      switch (date) {
        case 'week':
          start = moment()
            .hour(0)
            .minute(0)
            .second(1)
            .utc()
            .subtract(7, 'days')
            .format(this.dateXHRFormat)
          break
        case 'month':
          start = moment()
            .hour(0)
            .minute(0)
            .second(1)
            .utc()
            .subtract(1, 'month')
            .format(this.dateXHRFormat)
          break
        case '3 months':
          start = moment()
            .hour(0)
            .minute(0)
            .second(1)
            .utc()
            .subtract(3, 'month')
            .format(this.dateXHRFormat)
          break
        case 'day':
          start = moment()
            .hour(0)
            .minute(0)
            .second(1)
            .utc()
            // .subtract(1, "days")
            .format(this.dateXHRFormat)
          break
        default:
          start = moment(this.startDate)
            .hour(0)
            .minute(0)
            .second(1)
            .utc()
            .format(this.dateXHRFormat)
          end = moment(this.endDate)
            .hour(23)
            .minute(59)
            .second(59)
            .utc()
            .format(this.dateXHRFormat)
          reset = false
          break
      }
      // clone moment object
      const filter = {
        start,
        end,
        lastid: null
      }
      // 更新 startDate endDate
      if (reset) {
        this.startDate = moment(moment.utc(start).toDate()).format(
          this.datepickerFormat
        )
        this.endDate = moment(moment.utc(end).toDate()).format(
          this.datepickerFormat
        )
      }
      return filter
    },

    async mapRowAssetDigits(rows) {
      // 增加资产精度
      await Promise.all(
        map(rows, async (item, idx) => {
          const k = 'asset-' + item.market.base
          const k2 = 'asset-' + item.market.quote
          if (!this.staticDigits[k]) {
            const r = await this.cybexjs.queryAsset(item.market.base)
            this.staticDigits[k] = r.precision
          }
          if (!this.staticDigits[k2]) {
            const r = await this.cybexjs.queryAsset(item.market.quote)
            this.staticDigits[k2] = r.precision
          }
          rows[idx].asset_digit_base = this.staticDigits[k]
          rows[idx].asset_digit_quote = this.staticDigits[k2]
          // price精度
          const dp = this.digitsPrice(item)
          rows[idx].asset_digit_price = dp
          // amount精度
          const da = this.digitsAmount(item)
          rows[idx].asset_digit_amount = da
        })
      )
    },
    async fetchOrderHistory(cleanRows = true, showLoading = false) {
      if (!this.username) {
        this.rowsData = []
        this.isLoading = false
        return
      }
      const func = async (needCleanData = false, needShowLoading = false) => {
        if (needCleanData) {
          this.rowsData = []
        }
        if (needShowLoading) {
          this.isLoading = true
        }

        // console.log(
        //   "fetchOrderHistory filter ",
        //   filter
        // );
        // closed orders
        const closedRows = await CybexDotClient.getOrders(
          CybexDotClient.TradePairHash,
          CybexDotClient.AccountId,
          false
        )
        this.isLoading = false

        this.rowsData = closedRows
          ? closedRows.map((v) => {
              return {
                id: v.hash,
                time: v.datetime,
                tradetype: v.otype === 0 ? 'buy' : 'sell',
                price: v.price / 10 ** 8,
                amount: v.otype === 0 ? v.buy_amount : v.sell_amount,
                market: {
                  base:
                    v.base === CybexDotClient.baseTokenHash ? '1.3.27' : v.base,
                  quote:
                    v.quote === CybexDotClient.quoteTokenHash
                      ? '1.3.0'
                      : v.quote
                },
                base_id:
                  v.base === CybexDotClient.baseTokenHash ? '1.3.27' : v.base,
                quote_id:
                  v.quote === CybexDotClient.quoteTokenHash ? '1.3.0' : v.quote,
                filled:
                  v.otype === 0
                    ? v.buy_amount - v.remained_buy_amount
                    : v.sell_amount - v.remained_sell_amount,
                total: v.otype === 0 ? v.sell_amount : v.buy_amount,
                average: null,
                status: v.status === 2 ? 'Filled' : 'Canceled'
              }
            })
          : []
      }
      await func(cleanRows, showLoading)
      if (!this.intervalRefresh && this.enableInterval) {
        this.intervalRefresh = setInterval(async () => {
          await func()
          // }
        }, this.refreshRate)
      }
    },

    resetSelectContent() {
      this.selectedPair = { base_id: '', quote_id: '' }
      this.startDate = new Date(this.limitDate).toISOString().substring(0, 10)
      this.endDate = new Date(this.today).toISOString().substring(0, 10)
    },
    querySelections(v) {
      this.loadingPair = true
      // Simulated ajax query
      setTimeout(() => {
        this.itemsPair = this.statesPair.filter((e) => {
          return (e.text || '').toLowerCase().includes((v || '').toLowerCase())
        })
        this.loadingPair = false
      }, 100)
    }
  }
}
</script>
<style lang="scss">
.table-middle {
  height: 32px;
  font-size: 12px;
  color: rgba(map-get($main, white), 0.8);
  padding: 2px 8px 0;
}

.theme--dark.v-data-table
  tbody
  tr:not(:last-child)
  td:not(.v-data-table__mobile-row) {
  border-bottom: 0;
}

.theme--dark.v-data-table thead tr:last-child th {
  border-bottom: 0;
}
</style>