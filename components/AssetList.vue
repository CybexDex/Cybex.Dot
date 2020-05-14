<template>
  <div class="account index-wrap">
    <div class="head-line ml-4 mr-5">
      <v-text-field
        v-model="querystr"
        middle
        no-message
        clearable
        prepend-inner-icon="ic-search"
        :placeholder="$t('placeholder.search_asset')"
      />
      <v-checkbox
        v-model="hideSmall"
        class="ml-3"
        small
        height="40"
        align-items-center
        :ripple="false"
      >
        <div slot="label" class="check-label">
          {{ $t('form_label.hide_small') }}
          <notice-tip
            slot="label"
            class="ml-2"
            :content="$t('tooltip.small_asset', { smallAmount })"
            :offset="120"
          />
        </div>
      </v-checkbox>
    </div>
    <v-layout fluid row wrap>
      <v-flex xs12 fluid>
        <div class="table-wrapper">
          <v-data-table
            :headers="tbItems"
            :items="itemDatas"
            :loading="!assetsData"
            hide-default-footer
            :dark="false"
          >
            <template v-slot:header="props">
              <thead>
                <tr v-for="header in props.headers" :key="header.text">
                  <th>
                    <a
                      v-if="props.header.canSort"
                      class="table-tlt"
                      @click="onSortClick(props)"
                    >
                      {{ props.header.text }}
                      <v-icon>{{
                        props.header.value === sortBase
                          ? sortMap[props.header.value] === 'asc'
                            ? 'ic-sort_up'
                            : 'ic-sort_down'
                          : 'ic-sort'
                      }}</v-icon>
                    </a>
                    <span v-else class="table-tlt">{{
                      props.header.text
                    }}</span>
                  </th>
                </tr>
              </thead>
            </template>
            <template v-slot:item="{ item }">
              <tr :class="item.name === endTopItem.name ? 'top-end' : ''">
                <td class="text-xs-left">
                  <div class="coin-icon-wrap d-flex">
                    <!-- <v-img
                      class="coin-icon ml-4"
                    /> -->
                    {{ item.name }}
                  </div>
                </td>
                <td class="text-xs-right">
                  {{ item.balance | floorDigits(item.precision || 6) }}
                </td>
                <td class="text-xs-right">
                  {{
                    (item.frozenBalance || 0) | floorDigits(item.precision || 6)
                  }}
                </td>

                <td class="text-xs-right op">
                  <div class="op-wrap">
                    <template v-if="item.name !== 'CYB'">
                      <a
                        v-if="item.depositSwitch"
                        class="op-item border"
                        @click="$i18n.jumpTo(`/fund/deposit/${item.name}`)"
                        >{{ $t('button.deposit') }}</a
                      >
                      <template v-else>
                        <v-tooltip
                          v-if="(item.whyNotDeposit || {})[`${localeShort}Msg`]"
                          :class="{
                            unopen: !item.depositSwitch,
                            border: true
                          }"
                          content-class="why-forbid-tip"
                          top
                        >
                          <template v-slot:activator="{ on }">
                            <span class="op-item" v-on="on">{{
                              $t('button.pause')
                            }}</span>
                          </template>

                          <span>{{
                            (item.whyNotDeposit || {})[`${localeShort}Msg`]
                          }}</span>
                        </v-tooltip>
                        <span v-else class="op-item unopen border">{{
                          $t('button.pause')
                        }}</span>
                      </template>
                      <a
                        v-if="item.withdrawSwitch"
                        class="op-item border"
                        @click="$i18n.jumpTo(`/fund/withdraw/${item.name}`)"
                        >{{ $t('button.withdraw') }}</a
                      >
                      <template v-else>
                        <v-tooltip
                          v-if="
                            (item.whyNotWithdraw || {})[`${localeShort}Msg`]
                          "
                          :class="{
                            unopen: !item.depositSwitch,
                            border: true
                          }"
                          content-class="why-forbid-tip"
                          top
                        >
                          <template v-slot:activator="{ on }">
                            <span class="op-item" v-on="on">{{
                              $t('button.pause')
                            }}</span>
                          </template>

                          <span>{{
                            (item.whyNotWithdraw || {})[`${localeShort}Msg`]
                          }}</span>
                        </v-tooltip>
                        <span v-else class="op-item unopen border">{{
                          $t('button.pause')
                        }}</span>
                      </template>
                    </template>
                    <div v-else style="width: 168px;" />
                    <v-menu
                      v-if="(quoteList[item.name] || []).length > 0"
                      bottom
                      width="42"
                      :nudge-bottom="20"
                    >
                      <template v-slot:activator="{ on }">
                        <a
                          class="op-item last"
                          v-on="on"
                          @click="onExchangeClicked"
                          >{{ $t('button.exchange') }}</a
                        >
                      </template>

                      <div class="switch-exchange">
                        <v-list>
                          <v-list-item
                            v-for="(base, index) in quoteList[item.name]"
                            :key="index"
                            @click="
                              $i18n.jumpTo(`/exchange/${item.name}_${base}`)
                            "
                          >
                            <v-list-item-title
                              >{{ item.name }}/{{ base }}</v-list-item-title
                            >
                          </v-list-item>
                        </v-list>
                      </div>
                    </v-menu>
                    <span v-else class="op-item unopen last">{{
                      $t('button.exchange')
                    }}</span>
                  </div>
                </td>
              </tr>
            </template>
            <template v-slot:no-data>
              <h4 class="text-center">{{ $t('info.no_data') }}</h4>
            </template>
          </v-data-table>
        </div>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import { filter, orderBy } from 'lodash'
import { mapGetters } from 'vuex'
import utils from '~/components/mixins/utils'
import config from '~/lib/config/config.js'
import CybexDotClient from '~/lib/CybexDotClient'

export default {
  components: {
    NoticeTip: () => import('~/components/NoticeTip.vue')
  },
  mixins: [utils],

  data() {
    return {
      assetsData: null,
      hideSmall: false,
      querystr: '',
      tbItems: [
        {
          text: this.$t('table_title.coin'),
          value: 'name',
          align: 'left',
          sortable: false,
          canSort: true
        },
        {
          text: this.$t('table_title.avaliable_balance'),
          value: 'balance',
          align: 'left',
          sortable: false,
          canSort: true
        },
        {
          text: this.$t('table_title.frozen'),
          value: 'frozenBalance',
          align: 'left',
          sortable: false,
          canSort: true
        },

        {
          text: this.$t('table_title.operation'),
          align: 'right',
          class: 'op-tlt',
          sortable: false
        }
      ],
      smallAmount: config.smallCYBAmount,
      sortMap: {
        name: 'asc',
        balance: 'desc',
        frozen: 'desc',
        cybValue: 'desc'
      },
      values: [],
      sortBase: null
    }
  },

  computed: {
    ...mapGetters({
      username: 'auth/username',
      locale: 'i18n/locale',
      localeShort: 'i18n/shortcut',
      symbol: 'i18n/symbol',
      accountId: 'auth/address',
      assetConfigBySymbol: 'gateway/assetConfigBySymbol'
    }),

    itemDatas() {
      const filteredList = filter(this.assetsData || [], (item) => {
        return (
          (!this.querystr || item.name.includes(this.querystr.toUpperCase())) &&
          (!this.hideSmall || item.cybValue >= this.smallAmount)
        )
      })

      return filteredList
    },
    endTopItem() {
      return this.itemDatas.find((i) => !i.isTop) || {}
    },
    quoteList() {
      const result = {}

      this.assetsData.forEach((item) => {
        for (const [key, value] of Object.entries(this.marketPairData)) {
          const filters = value.filter((i) => i.quote.name === item.name)

          if (filters.length) {
            const old = result[item.name] || []
            if (old) {
              old.push(key)
            }
            result[item.name] = old
          }
        }
      })

      return result
    }
  },
  watch: {
    async assetList() {
      try {
        await this.setupAssetList()
      } catch (e) {}
    }
  },
  async mounted() {
    await this.setupAssetList()
  },
  methods: {
    onSortClick(data) {
      const header = data.header
      const sort = this.sortMap[header.value] === 'desc' ? 'asc' : 'desc'
      this.sortBase = header.value
      this.sortMap[header.value] = sort
      this.assetsData = orderBy(
        this.assetsData,
        ['isTop', header.value],
        ['desc', sort]
      )
    },
    onExchangeClicked() {},
    async setupAssetList() {
      const balances = await CybexDotClient.getAllBalance(this.accountId)
      const list = this.assets.map((asset) => {
        const gwConfig = this.assetConfigBySymbol[asset.name] || {}
        const data = {
          isTop: 0,
          depositSwitch: gwConfig.depositSwitch,
          withdrawSwitch: gwConfig.withdrawSwitch,
          whyNotWithdraw: null,
          whyNotDeposit: null,
          balance: null,
          frozenBalance: null
        }
        data.balance = balances[asset.id].freeBalance / 10 ** asset.precision
        data.frozenBalance =
          balances[asset.id].freezedBalance / 10 ** asset.precision

        return { ...data, ...asset }
      })

      this.assetsData = list
    },
    createAsset() {
      window.open(
        `${config.links.oldSite}/account/${this.username}/create-asset/`
      )
    }
  }
}
</script>

<style lang="scss">
@import '~assets/style/_fonts/_font_mixin';
@import '~assets/style/_vars/_colors';

.why-forbid-tip {
  width: 232px;
  padding: 12px 16px;
  background-color: rgba(17, 22, 33, 0.92);
  opacity: 0.8;
  font-size: 14px;
  @include f-cybex-style(medium);
  line-height: 1.29;
  text-align: center;

  strong {
    color: map-get($main, orange);
  }

  span {
    text-align: center;
  }
}

.account {
  .table-tlt {
    font-size: 12px;
    color: rgba(map-get($main, white), 0.4);
    @include f-cybex-style(medium);

    .v-icon {
      font-size: 1.8em;
      margin-right: -6px;
      margin-left: -4px;
      line-height: 0.8;
    }
  }

  &.index-wrap {
    background: map-get($main, lead) !important;
    border-radius: 4px;
  }

  .v-input__control {
    max-height: 40px;
    height: 40px;

    .v-input__slot {
      margin-bottom: 0px !important;
    }
  }

  .v-input__append-outer {
    line-height: 20px;
  }

  .op-tlt {
    padding-right: 48px !important;
  }

  .coin-icon-wrap {
    display: flex;
    align-items: center;
    padding-left: 16px;

    .coin-icon {
      margin-right: 8px;
      width: 20px;
      height: 20px;
      flex: 0 0 20px !important;
    }
  }

  .head-line {
    height: 56px;
    display: flex;
    align-items: center;

    .v-text-field {
      flex: 0 1 384px;
    }

    .create-btn.v-btn {
      height: 31px;
      border-radius: 4px;
      padding: 0 !important;
      margin-right: 42px;
      box-shadow: initial !important;

      &.theme--dark {
        background-color: map-get($main, anchor);

        .v-btn__content {
          // padding: 0 12px 0 8px;
          font-size: 12px;
          @include f-cybex-style('black', medium);
          line-height: 1.33;
          color: map-get($main, grey);
        }

        .add-icon {
          line-height: 1 !important;
          font-size: 1.8em !important;
        }

        .add-label {
          margin-top: 4px;
        }
      }
    }
  }

  .icon-column {
    // line-height: 56px;
    line-height: 56px;
    margin-top: 0;
    margin-bottom: 0;
    min-width: 120px;

    .v-input--checkbox {
      margin-left: 24px !important;
    }
  }

  .theme--dark.v-data-table {
    .top-end {
      padding-top: 30px;
      height: 62px;
      box-shadow: inset 0 6px 0 0 #171d2a;
    }

    tbody td:first-child {
      padding: initial;
    }

    label {
      line-height: 56px;
      margin-left: 8px;
    }

    tr:not(.v-datatable__expand-row),
    td {
      height: 56px;
      line-height: 56px;
      box-shadow: inset 0 -2px 0 0 rgba(23, 29, 42, 1);
    }

    tr {
      color: rgba(map-get($main, white), 0.8);
    }

    tr:hover {
      opacity: 1;
      color: rgba(255, 255, 255, 1);
      background-color: rgba(35, 42, 56, 1) !important;
    }

    thead tr:first-child {
      height: 40px;
      font-size: 12px;
      @include f-cybex-style(medium);
      line-height: 1.33;
      color: map-get($main, white);
      border-bottom: initial !important;
    }

    td {
      @include f-cybex-style('heavy', medium);
      font-size: 12px;
      line-height: 1.33;
      height: 56px;
    }

    td a {
      text-decoration: none;
      color: white;
    }

    .v-btn--icon {
      width: 12px;
      margin-left: -12px;
    }

    .v-divider--vertical {
      min-height: 40%;
      max-height: 40%;
    }

    td.op {
      width: 240px !important;
      padding: 0 !important;

      .op-wrap {
        margin-right: 48px;
        display: flex;

        .op-item,
        .v-tooltip {
          @include f-cybex-style('black', medium);
          padding: 0 !important;
          width: 84px !important;

          font-size: 12px !important;
          line-height: 32px;
          text-align: center;
          color: map-get($main, grey) !important;

          &.border {
            border-right: solid 0.08em map-get($main, 'dark') !important;
          }

          &:hover {
            color: map-get($main, lilac) !important;

            &,
            & .v-btn__content {
              background: map-get($main, initial) !important;
            }
          }
        }

        .op-item.last {
          max-width: 64px !important;
          text-align: right;
          padding-left: 12px !important;
        }

        .v-tooltip.unopen span.op-item {
          color: $white-opacity-30 !important;
        }

        span.op-item.unopen,
        .v-tooltip.unopen {
          color: $white-opacity-30 !important;
          cursor: not-allowed;

          &:hover {
            color: $white-opacity-30 !important;
          }
        }
      }
    }
  }

  .v-input--checkbox {
    .v-input__control {
      height: 40px;
    }
  }

  .value-equal {
    // color:grey !important;
    margin-left: -18px;
    font-size: 12px;
    @include f-cybex-style(medium);
    color: $white-opacity-30;
  }
}

.switch-exchange {
  width: 85px;
  margin-top: 12px;

  .theme--dark.v-list {
    border-radius: 4px;
    box-shadow: 0 8px 10px 0 rgba(0, 0, 0, 0.2),
      0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 16px 24px 2px rgba(0, 0, 0, 0.14);
    background-color: #212939;
  }

  .v-list__tile {
    @include f-cybex-style('black', medium);
    height: 32px !important;
    opacity: 0.8;
    font-size: 12px;
    line-height: 1.33;
    padding: initial;
    color: white;
  }

  .v-list__tile__title {
    text-align: center;
  }
}
</style>
