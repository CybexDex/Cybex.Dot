<template>
  <div>
    <v-flex v-if="size == 'middle'" d-flex grow
      ><div class="input-label">{{ $t('custom.quote-label') }}</div></v-flex
    >
    <v-flex d-flex :class="['size-' + size, size == 'middle' ? 'mb-4' : '']">
      <label v-if="size == 'small'" class="c-white-30 mr-2"
        >{{ $t(label) }}:</label
      >
      <v-flex column shrink class="selector-item">
        <v-autocomplete
          v-model="customAssetQuote"
          :clearable="size != 'small'"
          :cache-items="false"
          :attach="'.search-for-quote'"
          :return-masked-value="false"
          class="search-for-quote"
          :class="size + '-size'"
          dont-fill-mask-blanks
          :menu-props="{
            maxWidth: maxWidth > 0 ? maxWidth / 2 : '',
            contentClass: 'asset-dropdown ps-dropdown-quote',
            'offset-y': true,
            nudgeBottom: 8,
            'max-height': 300
          }"
          :items="searchAssetQuoteItemsComputed"
          :search-input.sync="searchAssetQuote"
          :loading="isLoadingSearchAssetQuote"
          no-message
          item-text="symbol"
          item-value="id"
          :placeholder="$t('custom.search-placeholder')"
          solo
        >
          <template slot="no-data">
            <v-list-item>
              <v-list-item-title v-if="!searchAssetQuote">{{
                $t('custom.search-placeholder')
              }}</v-list-item-title>
              <v-list-item-title v-else-if="!isLoadingSearchAssetQuote">{{
                $t('custom.no-result')
              }}</v-list-item-title>
            </v-list-item>
          </template>
          <template slot="item" slot-scope="{ item }">
            <v-list-item-content>
              <v-list-item-title :title="item.symbol">
                <asset-pairs :asset-id="item.symbol" />
              </v-list-item-title>
            </v-list-item-content>
          </template>
        </v-autocomplete>
      </v-flex>
      <span class="spacer ml-1 mr-1 pt-1">/</span>
      <v-flex column shrink class="selector-item">
        <v-autocomplete
          v-model="customAssetBase"
          :clearable="size != 'small'"
          :cache-items="false"
          :return-masked-value="true"
          dont-fill-mask-blanks
          :attach="'.search-for-base'"
          class="search-for-base"
          :class="size + '-size'"
          :menu-props="{
            maxWidth: maxWidth > 0 ? maxWidth / 2 : '',
            contentClass: 'asset-dropdown ps-dropdown-base',
            'offset-y': true,
            nudgeBottom: 8,
            'max-height': 300
          }"
          :items="searchAssetBaseItemsComputed"
          :search-input.sync="searchAssetBase"
          :loading="isLoadingSearchAssetBase"
          no-message
          item-text="symbol"
          item-value="id"
          :placeholder="$t('custom.search-placeholder')"
          solo
        >
          <template slot="no-data">
            <v-list-item>
              <v-list-item-title v-if="!searchAssetBase">{{
                $t('custom.search-placeholder')
              }}</v-list-item-title>
              <v-list-item-title v-else-if="!isLoadingSearchAssetBase">{{
                $t('custom.no-result')
              }}</v-list-item-title>
            </v-list-item>
          </template>
          <template slot="item" slot-scope="{ item }">
            <v-list-item-content>
              <v-list-item-title :title="item.symbol">
                <asset-pairs :asset-id="item.symbol" />
              </v-list-item-title>
            </v-list-item-content>
          </template>
        </v-autocomplete>
      </v-flex>
    </v-flex>
  </div>
</template>

<script>
import { filter } from 'lodash'
export default {
  model: {
    prop: 'selectedPair',
    event: 'update-pair'
  },
  props: {
    label: {
      type: String,
      default: 'exchange.order-table.filter.pairs'
    },
    maxWidth: {
      type: Number,
      default: 0
    },
    size: {
      type: String,
      default: 'middle'
    },
    selectedPair: {
      type: Object,
      default: () => {}
    },
    excludeRule: {
      type: RegExp,
      default: null
    }
  },

  data() {
    return {
      searchAssetQuoteItems: [], // 搜索用用户自定义资产列表
      searchAssetBaseItems: [], // 搜索用用户自定义资产列表
      searchAssetQuote: '', // 输入值
      searchAssetBase: '', // 输入值
      isLoadingSearchAssetQuote: false,
      isLoadingSearchAssetBase: false
    }
  },
  computed: {
    customAssetQuote: {
      get() {
        const v = Object.prototype.hasOwnProperty.call(
          this.selectedPair,
          'quote_id'
        )
          ? this.selectedPair.quote_id
          : ''
        return v
      },
      set(v) {
        this.$emit('update-pair', {
          quote_id: v,
          base_id: this.customAssetBase
        })
      }
    },
    customAssetBase: {
      get() {
        const v = Object.prototype.hasOwnProperty.call(
          this.selectedPair,
          'base_id'
        )
          ? this.selectedPair.base_id
          : ''
        return v
      },
      set(v) {
        this.$emit('update-pair', {
          base_id: v,
          quote_id: this.customAssetQuote
        })
      }
    },
    searchAssetQuoteItemsComputed() {
      let items = this.searchAssetQuoteItems
      if (this.customAssetBase !== null) {
        items = filter(items, (i) => {
          return i.id !== this.customAssetBase
        })
      }
      return items
    },
    searchAssetBaseItemsComputed() {
      let items = this.searchAssetBaseItems
      if (this.customAssetQuote !== null) {
        items = filter(items, (i) => {
          return i.id !== this.customAssetQuote
        })
      }
      return items
    }
  },
  watch: {
    customAssetQuote(val) {
      this.$emit('model-change', ['quote', val])
    },
    customAssetBase(val) {
      this.$emit('model-change', ['base', val])
    }
  },
  methods: {
    // 搜索自定义交易对
  }
}
</script>

<style lang="scss">
.size-small {
  flex: 0 1 315px !important;
  margin-right: 32px;
  .v-text-field__details {
    display: none;
    margin: 0;
  }
  .selector-item {
    max-width: 120px;
  }
}
</style>
