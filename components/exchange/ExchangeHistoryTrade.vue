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
    <perfect-scrollbar
      ref="scrollEle"
      :options="{ minScrollbarLength: 30, useBothWheelAxes: true }"
    >
      <v-data-table
        ref="scrollTable"
        :loading="isLoading"
        :loading-text="loadingText"
        :headers="headers"
        :items="rowsData"
        dense
        hide-default-footer
        class="has_filter middle-size-table"
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
          <tr class="table-middle">
            <td class="text-xs-left col-date">
              {{ item.time | date('DD/MM HH:mm:ss') }}
            </td>
            <td class="text-xs-left">
              <asset-pairs
                :max-width="limitAssetSize ? '100px' : null"
                :max-quote-width="limitAssetSize ? '50px' : null"
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
            <td class="text-xs-left">{{ item.price }}</td>
            <td class="text-xs-left">
              {{ item.quote_amount | roundDigits(item.asset_digit_amount) }}
            </td>
            <!-- 手续费精度 卖出看base币 买入看quote币-->
            <!-- <td v-if="item.tradetype == 'buy'" class="text-xs-left keep-inline">
              {{
                item.fee.amount | roundDigits(item.asset_digit_quote, 0, '--')
              }}
              <asset-pairs
                v-if="item.fee.amount != 0"
                :max-width="limitAssetSize ? '50%' : null"
                :asset-id="item.fee.asset_id"
              />
            </td>
            <td v-else class="text-xs-left keep-inline">
              {{
                item.fee.amount | roundDigits(item.asset_digit_base, 0, '--')
              }}
              <asset-pairs
                v-if="item.fee.amount != 0"
                :max-width="limitAssetSize ? '50%' : null"
                :asset-id="item.fee.asset_id"
              />
            </td> -->
            <!-- 成交总金额 根据base币资产精度-->
            <td class="text-xs-right keep-inline">
              {{ item.base_amount | roundDigits(item.asset_digit_base) }}
              <asset-pairs
                :max-width="limitAssetSize ? '50%' : null"
                :asset-id="item.market.base"
              />
            </td>
          </tr>
        </template>
        <template slot="no-data">
          <div class="no-data">
            {{ $t('exchange.order-table.no-trade-data') }}
          </div>
        </template>
      </v-data-table>
    </perfect-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import utils from '~/components/mixins/utils'
import CybexDotClient from '~/lib/CybexDotClient.js'

export default {
  components: {
    // BaseQuoteSelector: () => import('~/components/BaseQuoteSelector.vue'),
    // CustomBaseQuoteSelector: () =>
    //   import('~/components/CustomBaseQuoteSelector.vue'),
    // ContestBaseQuoteSelector: () =>
    //   import('~/components/ContestBaseQuoteSelector.vue'),
  },
  mixins: [utils],
  props: {
    enableInterval: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'exchange'
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
      ps: null,
      loadingText: '',
      intervalRefresh: null,
      rowsData: [],
      isLoading: false,
      nextpage: false,
      bindPageEvent: false,
      dateDisplayFormat: 'YYYY/MM/DD',
      dateXHRFormat: 'YYYY-MM-DDTHH:mm:ss',
      datepickerFormat: 'YYYY-MM-DD',
      startMenu: false,
      endMenu: false,

      showFixedHeader: false,
      headers: [
        {
          text: this.$t('exchange.order-table.column.time'),
          align: 'left',
          sortable: false,
          value: 'time'
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
          value: 'quote_amount'
        },
        // {
        //   text: this.$t('exchange.order-table.column.fee'),
        //   align: 'left',
        //   sortable: false,
        //   value: 'fee'
        // },
        {
          text: this.$t('exchange.order-table.column.total'),
          align: 'left',
          sortable: false,
          value: 'base_amount'
        }
      ],
      // 搜索框
      selectedPair: { base_id: '', quote_id: '' },
      currentFilter: null,
      page: 0,
      limit: 10
    }
  },
  computed: {
    ...mapGetters({
      username: 'auth/username',
      accountId: 'auth/address',
      refreshRate: 'exchange/tradesRefreshRate',
      innerWidth: 'exchange/innerWidth'
    }),
    limitAssetSize() {
      return this.mode === 'exchange' && this.innerWidth <= 1440
    },

    filter: () => {
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
    username: async () => {
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
                'ps-y-reach-end',
                this.onScroll
              )
            }
          }
        })
      } else {
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
          this.$nextTick(() => {
            this.$refs.scrollEle.$el.scrollTop = 0
          })
        }
      }
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
    if (this.intervalRefresh) {
      clearInterval(this.intervalRefresh)
    }
    document.removeEventListener('visibilitychange', this.bindIntervalEvent)
  },
  methods: {
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
      let times = 3
      let stop = false
      while (times > 0 && !stop) {
        await this.$eventHandle(() => this.fetchTrades(cleanRows, showLoading))
          .then(() => {
            times = 0
            stop = true
          })
          .catch((e) => {
            times--
            this.$eventHandle(() => this.fetchTrades(cleanRows, showLoading))
          })
      }
    },
    delaySetLoading(time = 1000) {
      setTimeout(() => {
        this.isLoading = false
      }, time)
    },

    digitsPrice(item) {
      const base =
        item && item.market
          ? this.coinName(item.market.base, this.coinMap)
          : this.baseName
      const quote =
        item && item.market
          ? this.coinName(item.market.quote, this.coinMap)
          : this.quoteName
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
          : this.baseName
      const quote =
        item && item.market
          ? this.coinName(item.market.quote, this.coinMap)
          : this.quoteName
      const defaultDigits = this.isCustomPair(
        item.market.base,
        item.market.quote
      )
        ? item.asset_digit_quote
        : 5
      return this.getPairConfig(base, quote, 'book', 'amount', defaultDigits)
    },
    onScroll(event) {
      // this.offsetTop = e.target.scrollTop;
      // 提早一行loading
    },

    async fetchTrades(cleanRows = true, showLoading = false) {
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

        // console.log('fetch trade history', this.username,
        //   filter.start,
        //   filter.end,
        //   this.page,
        //   this.limit,
        //   filter.base_id,
        //   filter.quote_id,
        //   filter.white_flag)

        let tradeRows = await CybexDotClient.getTrades(20, this.accountId)
        this.isLoading = false
        tradeRows = tradeRows.map((v) => {
          return {
            time: v.datetime,
            tradetype: v.otype === 0 ? 'buy' : 'sell',
            price: v.price / 10 ** 8,
            base_amount: v.base_amount,
            quote_amount: v.quote_amount,
            fee: {
              amount: 0,
              asset_id: '1.3.0'
            },
            market: {
              base: v.base === CybexDotClient.baseTokenHash ? '1.3.27' : v.base,
              quote:
                v.quote === CybexDotClient.quoteTokenHash ? '1.3.0' : v.quote
            }
          }
        })

        this.rowsData = tradeRows
        // console.log(this.rowsData);
      }

      await func(cleanRows, showLoading) // 检查是否定期更新数据
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
    },
    removeInterval() {
      if (this.intervalRefresh) {
        clearInterval(this.intervalRefresh)
        this.intervalRefresh = null
      }
    },
    async bindIntervalEvent() {
      if (document.visibilityState === 'hidden') {
        this.removeInterval()
      } else if (document.visibilityState === 'visible') {
        await this.initData(false, false)
      }
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
