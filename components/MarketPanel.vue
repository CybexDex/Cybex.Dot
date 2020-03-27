<template>
  <v-menu
    v-model="showMarket"
    offset-y
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
      <!-- 自定义 / 固定资产切换tab -->
      <v-flex class="tab-title-wrapper">
        <span
          class="tab-title"
          :class="{ active: currentMarketTab == 'market' }"
          @click="currentMarketTab = 'market'"
          >{{ $t('tab_label.mainlist') }}</span
        >
      </v-flex>
      <!-- 固定资产tab内容开始 -->
      <!-- 此处有bug tabs在menu中 slider线看不到 @see https://github.com/vuetifyjs/vuetify/issues/1978 -->
      <v-tabs
        v-model="activeBase"
        dark
        class="content-tab"
        slider-color="cybex"
        :class="{ hidden: currentMarketTab != 'market' }"
      >
        <v-tab
          v-for="(item, index) in tabItems"
          :key="index"
          :ripple="false"
          @click="onBaseChanged(index)"
        >
          <asset-pairs v-if="item && item.asset_id" :asset-id="item.asset_id" />
          <template v-else>
            <!-- 中英文调整行高 -->
            <span v-if="locale !== 'en'" class="pb-1 pt-0">
              <v-icon
                v-if="!onBookmarkTab"
                class="small"
                :class="{ 'mb-1': locale == 'en' }"
                >ic-star</v-icon
              >
              <v-icon v-else class="small" :class="{ 'mb-1': locale == 'en' }"
                >ic-star_active</v-icon
              >
              {{ $t('tab_label.subscribed') }}
            </span>
            <template v-else>
              <v-icon v-if="!onBookmarkTab" class="small mb-1">ic-star</v-icon>
              <v-icon v-else class="small mb-1">ic-star_active</v-icon>
              {{ $t('tab_label.subscribed') }}
            </template>
          </template>
        </v-tab>
        <v-tab-item
          v-for="(item, idx) in tabItems"
          :key="idx"
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
            <v-data-table
              class="middle-size-table"
              :class="{ 'empty-table': marketDatas.length === 0 }"
              :headers="marketHeaders"
              :items="marketDatas"
              :is-fixed-header-table="true"
              hide-default-footer
              header-props.sort-icon="'ic-arrow_up'"
              :must-sort="true"
            >
              <template slot="items" slot-scope="props">
                <tr
                  :class="
                    props.item.quote === quote_id && props.item.base === base_id
                      ? 'current-row'
                      : 'select-row'
                  "
                  @click="onPairSelected($event, props.item)"
                >
                  <!-- bookmark + name-->
                  <td class="text-xs-left">
                    <v-flex
                      d-flex
                      align-end
                      just-space-around
                      class="col-bookmark"
                    >
                      <v-icon
                        size="16"
                        class="mr-2 marked-icon"
                        @click="
                          onBookmark($event, props.item.quote, props.item.base)
                        "
                        >{{
                          markedQuote[`${props.item.quote}_${props.item.base}`]
                            ? 'ic-star_active small'
                            : 'ic-star'
                        }}</v-icon
                      >
                      <v-flex
                        v-if="idx == baseList.length"
                        d-flex
                        :grow="0"
                        align-end
                      >
                        <asset-pairs
                          :base-id="props.item.base"
                          :quote-id="props.item.quote"
                        />
                      </v-flex>
                      <v-flex v-else d-flex :grow="0" align-end>
                        <asset-pairs :asset-id="props.item.quotename" />
                      </v-flex>
                    </v-flex>
                  </td>
                  <!-- volume -->
                  <td class="text-xs-right">
                    {{
                      props.item.base_volume
                        | shortenVolume(props.item.asset_digits_volume)
                    }}
                  </td>
                  <!-- price -->
                  <td class="text-xs-right">
                    {{
                      parseFloat(props.item.latest)
                        | roundDigits(props.item.asset_digits_price)
                    }}
                  </td>
                  <!-- change -->
                  <td class="text-xs-right col-change">
                    <v-flex d-flex :grow="0">
                      <span
                        class="price-change"
                        :class="
                          !parseFloat(props.item.percent_change)
                            ? 'c-grey'
                            : parseFloat(props.item.percent_change) > 0
                            ? 'c-buy'
                            : 'c-sell'
                        "
                      >
                        <v-icon
                          v-if="!!parseFloat(props.item.percent_change)"
                          size="14"
                          :class="
                            props.item.percent_change > 0 ? 'c-buy' : 'c-sell'
                          "
                          >{{
                            props.item.percent_change > 0
                              ? 'ic-arrow_up_green'
                              : 'ic-arrow_down_red'
                          }}</v-icon
                        >
                        {{ props.item.percent_change | priceChange }}%
                      </span>
                    </v-flex>
                  </td>
                </tr>
              </template>
              <template slot="no-data">
                <h4 class="text-center">{{ $t('info.no_available_pair') }}</h4>
              </template>
            </v-data-table>
          </div>
        </v-tab-item>
      </v-tabs>
    </div>
  </v-menu>
</template>
<script>
import { mapGetters } from 'vuex'
import PerfectScrollbar from 'perfect-scrollbar'

import { indexOf, filter, has, keys } from 'lodash'
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
        'volume-col': headers[index].value === 'basevol'
      }
    }
  },
  mixins: [utils],

  data() {
    return {
      maxWidth: 394,
      minWidth: 364,
      maxCustomAsset: 20, // 最多允许自定义20条
      currentMarketTab: 'market', // 默认打开market tab 'market' | 'others'
      selectedCustomPair: {
        base: null,
        quote: null
      },
      showAddCustomMarket: false, // 是否显示添加tab
      showMarket: false,
      querystr: '',
      items: [],
      isLoading: false,
      search: null,
      pagination: {
        sortBy: 'basevol',
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
          value: 'basevol',
          sortable: true,
          descending: true,
          align: 'left',
          // style: "width: 60px;",
          class: ['text-right', 'pr-0']
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
      customMarketHeaders: [
        {
          text: '',
          sortable: false,
          align: 'left',
          width: '16px'
        },
        {
          text: this.$t('table_title.coin'),
          value: 'quotename',
          sortable: false,
          align: 'left',
          width: '120px'
        },
        {
          text: this.$t('table_title.volume'),
          value: 'basevol',
          sortable: true,
          descending: true,
          align: 'left',
          // style: "width: 60px;",
          class: ['text-right', 'pr-0']
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
      customData: [],
      precisions: null,
      scrollhash: [],
      activeBase: null,
      inited: false,
      topPairs: []
    }
  },

  computed: {
    ...mapGetters({
      locale: 'i18n/locale',
      username: 'auth/username',
      tradesRefreshRate: 'exchange/tradesRefreshRate',
      priceDigits: 'exchange/priceDigits'
    }),

    limitAssetSize() {
      return this.mode === 'exchange' && this.innerWidth <= 1440
    },
    innerWidth() {
      return window ? window.innerWidth : 0
    },
    customAssetQuote() {
      return this.selectedCustomPair.quote_id
    },
    customAssetBase() {
      return this.selectedCustomPair.base_id
    },
    onBookmarkTab() {
      return this.activeBase === this.baseList.length
    },
    isMarked() {
      const ismarked = false

      return ismarked
    },
    tabItems() {
      const r = []
      const basekeys = keys(this.bases)
      for (const id of basekeys) {
        r.push({
          asset_id: id
        })
      }
      r.push({})
      return r
    },
    baseList() {
      const basekeys = keys(this.bases)
      return basekeys
    },
    curBase() {
      return this.baseList[this.activeBase]
    },
    // 所有收藏的交易对
    bookedItems() {
      return filter(keys(this.markedQuote), (item) => {
        // 收藏交易对是当前配置交易对的子集
        const [quote, base] = item.split('_')
        const isPairActive =
          !!this.bases[base] && this.bases[base].data.includes(quote)
        return isPairActive && this.markedQuote[item]
      })
    },
    // 经过排序、过滤后的交易对数据
    marketDatas() {
      const curBase = this.curBase
      const datas = this.datas[this.activeBase] || []
      const filtered = this.querystr
        ? filter(datas, (item) => {
            // 收藏tab下quote、base都做匹配
            const isQuote = item.quotename.includes(this.querystr.toUpperCase())
            return curBase
              ? isQuote
              : isQuote ||
                  this.coinName(item.base, this.coinMap).includes(
                    this.querystr.toUpperCase()
                  )
          })
        : datas
      // 精度
      filtered.map((item) => {
        // 精度
        const price = this.getPairConfig(
          this.coinName(item.base, this.coinMap),
          this.coinName(item.quote, this.coinMap),
          'choose',
          'last_price',
          6
        )
        const volume = this.getPairConfig(
          this.coinName(item.base, this.coinMap),
          this.coinName(item.quote, this.coinMap),
          'choose',
          'volume',
          2
        )
        item.asset_digits_price = price
        item.asset_digits_volume = volume
        return item
      })
      return filtered
    },
    // 展示用custom market data
    customMarketData() {
      const filtered = this.querystr
        ? filter(this.customData, (item) => {
            return (
              item.quotename.includes(this.querystr.toUpperCase()) ||
              item.basename.includes(this.querystr.toUpperCase())
            )
          })
        : this.customData
      return filtered
    },
    routeLeaved() {
      return !this.$route.path.includes('exchange')
    },
    // base quote是否都选中
    isCustomAssetPairHasValue() {
      return (
        this.customAssetBase !== null &&
        this.customAssetQuote !== null &&
        this.customAssetBase &&
        this.customAssetQuote
      )
    },
    // base quote是否是官方交易对
    isAssetInWhitelist() {
      let check = false
      const base = this.customAssetBase
      const quote = this.customAssetQuote
      if (this.isCustomAssetPairHasValue) {
        // 已存在官方交易对
        if (this.bases[base]) {
          const result = indexOf(this.bases[base].data, quote)
          check = result > -1
        }
        if (!check && this.bases[quote]) {
          const result = indexOf(this.bases[quote].data, base)
          check = result > -1
        }
      }
      return check
    },
    // 或者存在已添加列表
    isCustomAssetPairExist() {
      let c2 = false
      const base = this.customAssetBase
      const quote = this.customAssetQuote
      // 检查是否已添加
      if (this.isCustomAssetPairHasValue) {
        c2 = has(this.addedCustomPair, `${quote}_${base}`)
        if (!c2) {
          c2 = has(this.addedCustomPair, `${base}_${quote}`)
        }
      }
      return c2
    },
    couldAddCustomAssetPair() {
      return (
        this.isCustomAssetPairHasValue &&
        !this.isCustomAssetPairExist &&
        !this.isAssetInWhitelist
      )
    }
  },
  watch: {
    async activeBase(val) {
      await this.refreshDatas()
    },
    search(val) {
      if (this.items.length > 0) return
      if (this.isLoading) return
      this.isLoading = true
      // remote search
    },
    showMarket(value) {
      if (!value) {
        this.showAddCustomMarket = false
      } else {
        this.activeBase = this.baseList.indexOf(this.base_id)
        this.refreshDatas()
      }
    },
    // 切换自定义 / 交易行情tab
    async currentMarketTab(value) {
      if (value === 'others') {
        clearInterval(loopFlag)
        loopFlag = null
      } else {
        loopFlag = setInterval(this.refreshDatas, this.tradesRefreshRate)
        this.activeBase = this.baseList.indexOf(this.base_id)
        await this.refreshDatas()
      }
    },
    username() {}
  },
  async mounted() {
    try {
      Promise.all([await this.loadAllBases()]).then(() => {})
      // await this.loadAllBases();
    } catch (e) {}
    loopFlag = setInterval(this.refreshDatas, this.tradesRefreshRate)
  },

  beforeDestroy() {
    if (loopFlag) {
      clearInterval(loopFlag)
      loopFlag = null
    }

    if (this.scrollhash) {
      this.scrollhash.forEach((ps) => (ps.destroy ? ps.destroy() : null))
    }
  },
  methods: {
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
      if (item.quotename === this.quote_id && item.base === this.base_id) {
        $event.stopPropagation()
        return
      }
      this.showMarket = false

      this.$i18n.jumpTo(`/exchange/${item.quotename}_${item.basename}`)
    },
    onBaseChanged(value) {
      this.activeBase = value
    },
    refreshDatas() {
      if (!this.showMarket) return
      if (this.routeLeaved) {
        clearInterval(loopFlag)
        loopFlag = null
      }
    },
    loadAllBases() {
      const items = []

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
}

.content-tab-item ::v-deep .v-input__slot {
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
