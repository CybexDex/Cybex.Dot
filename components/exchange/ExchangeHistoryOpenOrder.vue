<template>
  <div
    class="orders-table-container"
    :class="{
      empty: !rowsData || rowsData.length == 0,
      'full-mode': mode === 'full',
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
        <div
          v-if="header.text"
          class="col-header"
          :class="'col-field-' + header.value"
        >
          {{ header.text }}
        </div>
        <div
          v-if="header.action"
          class="col-header"
          :class="'col-field-' + header.value"
        >
          <cybex-btn
            tiny
            color="minor"
            :disabled="rowsData.length === 0"
            @click="confirmCancelAllOrder"
            >{{ $t('exchange.order-table.column.cancel') }}</cybex-btn
          >
        </div>
      </div>
    </v-flex>
    <perfect-scrollbar
      ref="scrollEle"
      :options="{ minScrollbarLength: 30, useBothWheelAxes: true }"
    >
      <v-data-table
        :loading="isLoading"
        :loading-text="loadingText"
        :headers="headers"
        :items="rowsData"
        dense
        hide-default-footer
      >
        <template v-slot:header="props">
          <thead>
            <tr v-for="header in props.headers" :key="header.text">
              <th>
                <template v-if="header.text">{{ header.text }}</template>
                <template v-if="header.action">
                  <cybex-btn
                    tiny
                    color="minor"
                    class="cancel-all"
                    :disabled="rowsData.length === 0"
                    @click="confirmCancelAllOrder"
                    >{{ $t('exchange.order-table.column.cancel') }}</cybex-btn
                  >
                </template>
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
            <!-- 卖单向上取整，买单向下取整 -->
            <template v-if="item.tradetype == 'buy'">
              <td class="text-xs-center text-uppercase c-buy">
                {{ $t('exchange.content.' + item.tradetype.toLowerCase()) }}
              </td>
              <td class="text-xs-center">{{ item.price }}</td>
              <td class="text-xs-center">
                {{ item.amount | floorDigits(item.asset_digit_amount) }}
              </td>
              <td class="text-xs-center">
                {{ (item.filled * 100) | floorDigits(2) }}%
              </td>
              <td class="text-xs-right">
                {{ item.total | floorDigits(item.asset_digit_total) }}
              </td>
            </template>
            <template v-else>
              <td class="text-xs-center text-uppercase c-sell">
                {{ $t('exchange.content.' + item.tradetype.toLowerCase()) }}
              </td>
              <td class="text-xs-center">{{ item.price }}</td>
              <td class="text-xs-center">
                {{ item.amount | ceilDigits(item.asset_digit_amount) }}
              </td>
              <td class="text-xs-center">
                {{ (item.filled * 100) | floorDigits(2) }}%
              </td>
              <td class="text-xs-right">
                {{ item.total | ceilDigits(item.asset_digit_total) }}
              </td>
            </template>
            <td align="left">
              <v-icon small class="mr-2" @click="confirmCancelOrder(item)">
                ic-cancel
              </v-icon>
            </td>
          </tr>
        </template>
        <template v-slot:no-data>
          <div class="no-data pt-2">
            {{ $t('exchange.order-table.no-open-data') }}
          </div>
        </template>
      </v-data-table>
    </perfect-scrollbar>
    <!-- 确认取消订单-->
    <v-dialog v-model="confirmDialog" width="400" dark>
      <v-card>
        <v-card-title class="headline">{{
          $t('exchange.dialog.confirm-cancel')
        }}</v-card-title>
        <v-card-actions>
          <v-flex d-flex justify-space-between>
            <v-flex d-flex class="actions m-l">
              <cybex-btn
                small
                class="cancel"
                color="pre-minor"
                @click="confirmDialog = false"
                >{{ $t('exchange.dialog.Cancel') }}</cybex-btn
              >
            </v-flex>
            <v-flex d-flex class="actions">
              <cybex-btn
                small
                color="major"
                :disabled="isCanceling"
                @click="clickCancelOrder"
                >{{ $t('exchange.dialog.OK') }}</cybex-btn
              >
            </v-flex>
          </v-flex>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 确认取消所有订单-->
    <v-dialog v-model="confirmCancelAllDialog" width="400" dark>
      <v-card>
        <v-card-title class="headline">{{
          $t('exchange.dialog.confirm-cancel-all')
        }}</v-card-title>
        <v-card-actions>
          <v-flex d-flex justify-space-between>
            <v-flex d-flex class="actions m-l">
              <cybex-btn
                small
                class="cancel"
                color="pre-minor"
                @click="confirmCancelAllDialog = false"
                >{{ $t('exchange.dialog.Cancel') }}</cybex-btn
              >
            </v-flex>
            <v-flex d-flex class="actions">
              <cybex-btn
                small
                color="major"
                :disabled="isCanceling"
                @click="clickCancelOrder"
                >{{ $t('exchange.dialog.OK') }}</cybex-btn
              >
            </v-flex>
          </v-flex>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import utils from '~/components/mixins/utils'
import CybexDotClient from '~/lib/CybexDotClient.js'

export default {
  components: {},
  mixins: [utils],
  props: {
    mode: {
      type: String,
      default: 'exchange'
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
      showFixedHeader: false,
      currentFilter: {
        base_id: null,
        quote_id: null
      },
      intervalFetchData: null,
      confirmDialog: false,
      confirmCancelAllDialog: false,
      needCancelAllDialog: false,
      needCancelDialog: false,
      cancelIds: [],
      loadingText: '',
      headers: [
        {
          text: this.$t('exchange.order-table.column.date'),
          align: 'left',
          sortable: false,
          value: 'time',
          divider: false
          // width: '104px'
        },
        {
          text: this.$t('exchange.order-table.column.pair'),
          align: 'left',
          sortable: false,
          value: 'market',
          divider: false
        },
        {
          text: this.$t('exchange.order-table.column.side'),
          align: 'left',
          sortable: false,
          value: 'tradetype',
          divider: false

          // width: '42px'
        },
        {
          text: this.$t('exchange.order-table.column.price'),
          align: 'left',
          sortable: false,
          value: 'price',
          divider: false
        },
        {
          text: this.$t('exchange.order-table.column.amount'),
          align: 'left',
          sortable: false,
          value: 'amount',
          divider: false
        },
        {
          text: this.$t('exchange.order-table.column.filled'),
          align: 'left',
          sortable: false,
          value: 'filled',
          divider: false

          // width: '100px'
        },
        {
          text: this.$t('exchange.order-table.column.total'),
          align: 'left',
          sortable: false,
          value: 'total',
          divider: false
        },
        {
          text: this.$t('exchange.order-table.cancel-order'),
          align: 'left',
          sortable: false,
          value: 'cancel',
          divider: false

          // width: '100px'
        }
      ],
      rowsData: [],
      isLoading: this.username !== null && this.username !== '',
      isCanceling: false
    }
  },
  computed: {
    ...mapGetters({
      //   whitelist: 'user/whitelist',
      //   bases: 'user/bases',
      coinMap: 'user/coins',
      //   coinMapInvert: 'user/coinsInvert',
      username: 'auth/username',
      //   baseCurrency: 'exchange/base',
      //   quoteCurrency: 'exchange/quote',
      //   isLocked: 'auth/islocked',
      freshRate: 'exchange/tradesRefreshRate'
      //   innerWidth: 'exchange/innerWidth'
    }),
    limitAssetSize() {
      return this.mode === 'exchange' && this.innerWidth <= 1440
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
    bases(v) {},
    isLocked(v) {
      if (!v && this.needCancelAllDialog) {
        this.confirmCancelAllDialog = true
        this.needCancelAllDialog = false
      }
      if (!v && this.needCancelDialog) {
        this.confirmDialog = true
        this.needCancelDialog = false
      }
    },

    rowsData(v) {
      this.$emit('update-row-length', v.length)
      if (v.length) {
        this.$nextTick(() => {
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
          }
        })
      } else {
        this.showFixedHeader = false
        this.$refs.scrollEle.$el.removeEventListener('ps-y-reach-start', () => {
          this.showFixedHeader = false
        })
        this.$refs.scrollEle.$el.removeEventListener(
          'ps-scroll-y',
          this.onFixedHeader
        )
        this.$nextTick(() => {
          this.$refs.scrollEle.$el.scrollTop = 0
        })
      }
    }
  },

  mounted() {
    this.initData()
    document.addEventListener('visibilitychange', this.bindIntervalEvent)
  },
  beforeDestroy() {
    document.removeEventListener('visibilitychange', this.bindIntervalEvent)
    clearInterval(this.intervalFetchData)
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
    digitsPrice(item) {
      return 5
    },
    digitsAmount(item) {
      return 5
    },
    digitsTotal(item) {
      return 5
    },

    confirmCancelOrder(order) {
      this.cancelIds = [order.id]
      // 检查用户是否已锁
      if (this.isLocked) {
        // 弹出解锁狂
        this.needCancelDialog = true
        this.$toggleLock()
      } else {
        this.confirmDialog = true
      }
    },
    clickCancelOrder() {
      const deal = () => {
        this.confirmDialog = false
        this.confirmCancelAllDialog = false
        setTimeout(() => (this.isCanceling = false), 1000)
      }
      this.isCanceling = true
      this.$eventHandle(this.cancelOrder)
        .then(() => {
          this.$message({
            message: this.$t('message.order_canceled'),
            type: 'success'
          })
          deal()
        })
        .catch((e) => {
          // 多签用户报错使用默认弹窗
          if (!e.user) {
            this.$message({
              message: this.$t('message.order_canceled_failed'),
              type: 'error'
            })
          }
          deal()
        })
    },
    cancelOrder() {
      if (this.cancelIds) {
        return Promise.all(
          this.cancelIds.map((id) => {
            return CybexDotClient.cancelLimitOrder(id)
          })
        )
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
      if (times !== 0) {
        this.$store.commit('exchange/SET_CONNECT_STATUS', {
          orderConnect: false
        })
      } else {
        this.$store.commit('exchange/SET_CONNECT_STATUS', {
          orderConnect: true
        })
      }
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
        // open orders
        // console.log('this.currentFilter', this.currentFilter);

        const openRows = await CybexDotClient.getOrders(
          CybexDotClient.TradePairHash,
          CybexDotClient.AccountId,
          true
        )

        this.isLoading = false
        this.rowsData = openRows
          ? openRows.map((v) => {
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
                filled:
                  v.otype === 0
                    ? (v.buy_amount - v.remained_buy_amount) / v.buy_amount
                    : (v.sell_amount - v.remained_sell_amount) / v.sell_amount,
                total: v.otype === 0 ? v.sell_amount : v.buy_amount
              }
            })
          : []
      }

      await func(cleanRows, showLoading)
      if (!this.intervalFetchData && this.enableInterval) {
        this.intervalFetchData = setInterval(async () => {
          await func()
        }, this.freshRate)
      }
    },

    async bindIntervalEvent() {
      if (document.visibilityState === 'hidden') {
        this.removeInterval()
      } else if (document.visibilityState === 'visible') {
        await this.initData(false, false)
      }
    },
    removeInterval() {
      if (this.intervalFetchData) {
        clearInterval(this.intervalFetchData)
        this.intervalFetchData = null
      }
    }
  }
}
</script>

<style lang="scss">
.v-btn.theme--cybex-dark {
  width: 100%;
}

.table-middle {
  /* height: 32px; */
  font-size: 12px;
  color: rgba(map-get($main, white), 0.8);
  padding: 2px 8px 0;
}

.theme--dark.v-data-table
  tbody
  tr:not(:last-child)
  td:not(.v-data-table__mobile-row) {
  font-size: 12px !important;
  border-bottom: 0;
}

.theme--dark.v-data-table thead tr:last-child th {
  border-bottom: 0;
}
</style>
