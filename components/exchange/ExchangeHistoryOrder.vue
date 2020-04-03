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
                :quote-name="item.market.quote"
                :spacer="false"
                :base-name="item.market.base"
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
            <td class="text-xs-left">
              {{ item.price | floorDigits(digitsPrice) | shortenPrice }}
            </td>
            <td class="text-xs-left">
              {{ item.filled | roundDigits(digitsAmount) }}
            </td>
            <td class="text-xs-left">
              {{ item.amount | roundDigits(digitsAmount) }}
            </td>
            <td class="text-xs-right">
              {{ item.total | roundDigits(digitsTotal) }}
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
import moment from 'moment'

import utils from '~/components/mixins/utils'
import CybexDotClient from '~/lib/CybexDotClient.js'
import config from '~/lib/config/config'
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
      username: 'auth/username',
      accountId: 'auth/address',

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
    },
    digitsPrice() {
      return this.pair.book.last_price || 5
    },
    digitsAmount() {
      return this.pair.book.amount || 5
    },
    digitsTotal() {
      return this.pair.book.total || 5
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
          })
          .catch((e) => {
            times--
            this.$eventHandle(() =>
              this.fetchOrderHistory(cleanRows, showLoading)
            )
          })
      }
    },
    onScroll(event) {},

    calcFilterByDate(date) {
      let start, end
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
          break
      }
      // clone moment object
      const filter = {
        start,
        end,
        lastid: null
      }
      // 更新 startDate endDate

      return filter
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
        const closedRows = await CybexDotClient.getOrders(this.accountId, false)
        this.isLoading = false

        this.rowsData = closedRows
          ? closedRows.map((v) => {
              return {
                id: v.hash,
                time: v.datetime,
                tradetype: v.otype === 0 ? 'buy' : 'sell',
                price:
                  (v.price * 10 ** this.priceMatchedPrecision) /
                  config.pricePrecision,
                amount:
                  v.otype === 0
                    ? v.buy_amount / 10 ** this.quotePrecision
                    : v.sell_amount / 10 ** this.quotePrecision,
                market: {
                  base: this.baseName,
                  quote: this.quoteName
                },
                base_id: this.baseName,
                quote_id: this.quoteName,
                filled:
                  v.otype === 0
                    ? (v.buy_amount - v.remained_buy_amount) /
                      10 ** this.quotePrecision
                    : (v.sell_amount - v.remained_sell_amount) /
                      10 ** this.quotePrecision,
                total:
                  v.otype === 0
                    ? v.sell_amount / 10 ** this.basePrecision
                    : v.buy_amount / 10 ** this.basePrecision,
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
