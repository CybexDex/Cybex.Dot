<template>
  <v-menu
    v-if="inited"
    v-model="showMarket"
    offset-y
    eager
    :max-width="maxWidth"
    :min-width="minWidth"
    :open-on-click="false"
    :close-on-content-click="false"
  >
    <!-- 交易对名字显示开始 -->
    <template
      v-slot:activator="{ on }"
      :grow="1"
      :shrink="1"
      d-flex
      align-center
      class="control-item favorite"
    >
      <!-- 预加载ic-star_active防止初次读取卡顿 -->
      <div style="cursor: pointer;" v-on="on" @click="showPanelHandler">
        <span class="current-pairs mt-1">
          <asset-pairs
            :max-width="limitAssetSize ? '180px' : null"
            :max-quote-width="limitAssetSize ? '70%' : null"
            :base-name="baseName"
            :quote-name="quoteName"
          />
        </span>
        <v-icon class="arrow-icon ml-2" style="display: inline">{{
          showMarket ? 'ic-arrow_up' : 'ic-arrow_drop_down'
        }}</v-icon>
      </div>
    </template>

    <!-- 交易对名字显示结束 -->
    <!-- 下拉菜单内容开始 -->
    <div class="market-panel">
      <v-flex class="tab-title-wrapper">
        <span class="tab-title active">{{ $t('tab_label.mainlist') }}</span>
      </v-flex>
      <!-- 固定资产tab内容开始 -->

      <v-tabs
        v-model="activeBaseIndex"
        dark
        dense
        class="content-tab"
        slider-color="cybex"
      >
        <v-tab
          v-for="(item, index) in baseList"
          :key="index"
          :ripple="false"
          @click="onBaseChanged(index)"
        >
          <asset-pairs :asset-name="item" />
        </v-tab>

        <v-tab-item
          v-for="(base, idx) in baseList"
          :key="idx"
          ref="list"
          eager
          class="content-tab-item"
          align-center
        >
          <v-text-field
            v-model="querystr"
            prepend-inner-icon="ic-search"
            small
            clearable
            no-message
            :placeholder="$t('placeholder.market_filter')"
          />
          <div class="table-wrapper mt-2">
            <v-flex
              ref="fixHeader"
              d-flex
              class="fixed-header"
              :class="{ hidden: !showFixedHeader[idx] }"
            >
              <div
                v-for="(header, index) of marketHeaders"
                :key="index"
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
              </div>
            </v-flex>

            <perfect-scrollbar
              ref="scrollEle"
              :options="{ minScrollbarLength: 30, useBothWheelAxes: true }"
            >
              <v-data-table
                class="middle-size-table"
                :class="{ 'empty-table': marketDatas.length === 0 }"
                :headers="marketHeaders"
                :items="marketDatas"
                dense
                hide-default-footer
                header-props.sort-icon="'ic-arrow_up'"
                :must-sort="true"
              >
                <template v-slot:header="props">
                  <thead>
                    <tr v-for="header in props.headers" :key="header.text">
                      <th>
                        <template v-if="header.text">{{
                          header.text
                        }}</template>
                      </th>
                    </tr>
                  </thead>
                </template>
                <template v-slot:item="{ item }">
                  <tr
                    :key="item.name"
                    class="table-middle"
                    :class="
                      item.quotename === quoteName && item.basename === baseName
                        ? 'current-row'
                        : 'select-row'
                    "
                    @click="onPairSelected($event, item)"
                  >
                    <td>
                      <v-flex
                        d-flex
                        align-end
                        just-space-around
                        class="col-bookmark"
                      >
                        <v-flex d-flex :grow="0" align-end>
                          <asset-pairs :asset-name="item.quotename" />
                        </v-flex>
                      </v-flex>
                    </td>
                    <!-- volume -->
                    <td>
                      {{
                        item.quotevol | roundDigits(item.asset_digits_volume)
                      }}
                    </td>
                    <!-- price -->
                    <td class="text-right">
                      {{
                        parseFloat(item.latest)
                          | roundDigits(item.asset_digits_price)
                      }}
                    </td>
                    <!-- change -->
                    <td class="text-right col-change">
                      <span
                        class="price-change"
                        :class="
                          !parseFloat(item.percent_change)
                            ? 'c-grey'
                            : parseFloat(item.percent_change) > 0
                            ? 'c-buy'
                            : 'c-sell'
                        "
                      >
                        <!-- {{ mitem.percent_change | priceChange }} -->
                        {{ '--' }}
                      </span>
                    </td>
                  </tr>
                </template>
                <template v-slot:no-data>
                  <h4 class="text-center">
                    {{ $t('info.no_available_pair') }}
                  </h4>
                </template>
              </v-data-table>
            </perfect-scrollbar>
          </div>
        </v-tab-item>
      </v-tabs>
    </div>
  </v-menu>
</template>
<script>
import { mapGetters } from 'vuex'
import PerfectScrollbar from 'perfect-scrollbar'
import { filter, keys } from 'lodash'

import CybexDotClient from '~/lib/CybexDotClient.js'
import config from '~/lib/config/config.js'

import utils from '~/components/mixins/utils'
let loopFlag

export default {
  components: {},
  filters: {
    headClass(index, headers) {
      return {
        'header-first': index === 0,
        'header-last': index === headers.length - 1,
        'header-normal': index > 0 && index < headers.length - 1,
        'volume-col': headers[index].value === 'quotevol'
      }
    }
  },
  mixins: [utils],

  data() {
    return {
      showFixedHeader: [],

      maxWidth: 394,
      minWidth: 364,
      querystr: '',
      showMarket: false,
      activityDatas: {},
      isLoading: false,
      search: null,
      pagination: {
        sortBy: 'quotevol',
        descending: true,
        rowsPerPage: -1
      },
      marketHeaders: [
        {
          text: this.$t('table_title.coin'),
          value: 'quotename',
          sortable: false,
          align: 'left',
          width: '100px'
        },
        {
          text: this.$t('table_title.volume'),
          value: 'quotevol',
          sortable: true,
          descending: true,
          align: 'left'
          // style: "width: 60px;",
        },
        {
          text: this.$t('table_title.price'),
          value: 'latest',
          sortable: false,
          align: 'right'
          // style: "width: 120px;"
        },
        {
          text: this.$t('table_title.change'),
          value: 'percent_change',
          sortable: false,
          align: 'right'
          // style: "width: 100px;"
        }
      ],
      datas: [],
      precisions: null,
      scrollhash: [],
      activeBaseIndex: 0,
      inited: false
    }
  },

  computed: {
    ...mapGetters({
      locale: 'i18n/locale',
      username: 'auth/username',
      tradesRefreshRate: 'exchange/tradesRefreshRate'
    }),

    limitAssetSize() {
      return this.mode === 'exchange' && this.innerWidth <= 1440
    },
    innerWidth() {
      return window ? window.innerWidth : 0
    },

    baseList() {
      const basekeys = keys(this.datas)
      return basekeys
    },

    // 经过排序、过滤后的交易对数据
    marketDatas() {
      const baseName = this.baseList[this.activeBaseIndex]

      const datas = this.datas[baseName] || []
      const filtered = this.querystr
        ? filter(datas, (item) => {
            return item.quotename.includes(this.querystr.toUpperCase())
          })
        : datas
      // 精度
      filtered.map((item) => {
        item.asset_digits_price = item.choose.last_price || 6
        item.asset_digits_volume = item.choose.volume || 6
        return item
      })
      return filtered
    },

    routeLeaved() {
      return !this.$route.path.includes('exchange')
    }
  },
  watch: {
    async activeBaseIndex(val) {
      await this.refreshDatas()
      this.showFixedHeader = Array(this.baseList.length).fill(false)

      if (this.showFixedHeader[this.activeBaseIndex]) {
        this.$set(this.showFixedHeader, this.activeBaseIndex, false)
      }
    },
    search(val) {
      if (this.isLoading) return
      this.isLoading = true
      // remote search
    },
    showMarket(value) {
      if (!value) {
        this.showAddCustomMarket = false
      } else {
        this.activeBaseIndex = this.baseList.indexOf(this.baseName)
        this.refreshDatas()
      }
    },

    username() {}
  },
  async mounted() {
    await this.confData()
    loopFlag = setInterval(this.refreshDatas, this.tradesRefreshRate)

    this.$nextTick(() => {
      this.showFixedHeader = Array(this.baseList.length).fill(false)

      for (let i = 0; i < this.baseList.length; i++) {
        this.$refs.scrollEle[i].$el.addEventListener('ps-y-reach-start', () => {
          if (this.showFixedHeader[this.activeBaseIndex]) {
            this.$set(this.showFixedHeader, this.activeBaseIndex, false)
          }
        })
        this.$refs.scrollEle[i].$el.addEventListener('ps-scroll-y', () => {
          this.onFixedHeader(i)
        })
      }
    })
  },

  beforeDestroy() {
    for (let i = 0; i < this.baseList.length; i++) {
      this.$refs.scrollEle[i].$el.removeEventListener(
        'ps-y-reach-start',
        () => {
          if (this.showFixedHeader[this.activeBaseIndex]) {
            this.$set(this.showFixedHeader, this.activeBaseIndex, false)
          }
        }
      )
      this.$refs.scrollEle[i].$el.removeEventListener('ps-scroll-y', () => {
        this.onFixedHeader(i)
      })
    }
    if (loopFlag) {
      clearInterval(loopFlag)
      loopFlag = null
    }

    if (this.scrollhash) {
      this.scrollhash.forEach((ps) => (ps.destroy ? ps.destroy() : null))
    }
  },
  methods: {
    onFixedHeader(i) {
      if (this.$refs.scrollEle[i].$el && this.$refs.fixHeader[i]) {
        const cols = this.$refs.scrollEle[i].$el.querySelectorAll(
          "[role='columnheader']"
        )
        const headers = this.$refs.fixHeader[i].querySelectorAll('.col-header')
        headers.forEach((ele, idx) => {
          headers[idx].style.width = cols[idx].clientWidth - 16 + 'px'
        })
        this.$set(this.showFixedHeader, i, true)
      }
    },
    searchModelChange([type, val]) {
      if (type === 'base') {
        this.customAssetBase = val
      }
      if (type === 'quote') {
        this.customAssetQuote = val
      }
    },
    searchCustomAssetEnd(type) {
      this.resetScrollbar(`.asset-dropdown.ps-dropdown-${type} .v-select-list`)
    },
    showPanelHandler() {
      this.showMarket = !this.showMarket
    },
    resetScrollbar(key) {
      if (this.scrollhash[key]) {
        this.scrollhash[key].update()
      } else {
        this.scrollhash[key] = new PerfectScrollbar(key)
        this.$nextTick(() => {
          this.scrollhash[key].update()
        })
      }
    },
    onPairSelected($event, item) {
      if (
        item.quote.name === this.quoteName &&
        item.base.name === this.baseName
      ) {
        $event.stopPropagation()
        return
      }
      this.showMarket = false

      this.$i18n.jumpTo(`/exchange/${item.quote.name}_${item.base.name}`)
    },
    onBaseChanged(value) {
      this.activeBaseIndex = value
    },
    refreshDatas() {
      if (!this.showMarket) return
      if (this.routeLeaved) {
        clearInterval(loopFlag)
        loopFlag = null
        return
      }

      this.confData()
    },
    async confData() {
      const items = {}

      const promises = []
      for (const pair of this.pairs) {
        promises.push(CybexDotClient.getTicker(pair.id))
      }

      const data = await Promise.all(promises)

      for (const index in this.pairs) {
        const pair = this.pairs[index]

        const ticker = data[index]
        pair.quotevol = ticker.one_day_trade_volume / 10 ** pair.quote.precision
        pair.latest =
          (ticker.latest_matched_price *
            10 ** (pair.quote.precision - pair.base.precision)) /
          config.pricePrecision
        pair.percent_change = 0
        pair.quotename = pair.quote.name
        pair.basename = pair.base.name

        const item = items[pair.base.name]
        if (item) {
          items[pair.base.name].push(pair)
        } else {
          items[pair.base.name] = [pair]
        }
      }

      this.datas = items

      this.$nextTick(() => {
        this.inited = true
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/style/_vars/_colors';
@import '~/assets/style/_fonts/_font_mixin';

.market-panel ::v-deep .v-data-table.theme--dark th,
td {
  padding: 2px 8px 0;
}

.market-panel .fixed-header {
  font-size: 0.75rem;
  line-height: 1.5;
  height: 48px;
  font-weight: 700;
  width: 340px;

  > div {
    padding: 17px 8px 8px;
  }
}

.market-panel ::v-deep .v-text-field {
  height: 40px;
}
.v-menu__content {
  margin-left: 0;
}

.current-pairs {
  font-size: 14px;

  @include f-cybex-style('black', heavy);
  flex: 0 1 auto !important;
}

.content-tab,
.content-tab-item {
  background-color: map-get($main, lead) !important;
}
.content-tab ::v-deep .v-tabs-bar {
  background-color: map-get($main, lead) !important;
  height: 24px;
  .v-tab {
    padding: 0;
    min-width: 45px;
  }
}

.content-tab-item ::v-deep .v-input__slot {
  padding: 0 8px;
  border-radius: 4px;
  background-color: map-get($main, anchor) !important;
  input,
  input::placeholder {
    font-size: 12px !important;
  }
  .v-icon[class*=' ic-'] {
    font-size: 20px;
  }
}
</style>
