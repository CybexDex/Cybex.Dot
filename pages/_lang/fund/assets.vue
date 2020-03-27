<template>
  <div class="account">
    <v-layout row wrap class="title-line mb-2">
      <div class="left-tlt">
        <span>{{ $t('sub_title.hello') }},</span>

        <h1 class="whole-name-tip" :title="username">
          {{ username }}
        </h1>
        <span v-if="address" class="userinfo-id">{{
          'Address: ' + address
        }}</span>
      </div>
      <v-spacer />
      <v-layout row wrap class="right-column">
        <v-flex xs6 offset-xs1>
          <v-spacer />
          <div class="text-right balance pr-5">
            <span class="b-label">{{ $t('sub_title.cur_balance') }}</span>
            <notice-tip
              slot="append"
              :content="$t('tooltip.balance_all')"
              :offset="120"
            />
            <h2>{{ total.balance | floorDigits(5) }} CYB</h2>
            <p class="in-cny mt-1">≈{{ total.value | legalDigits(symbol) }}</p>
          </div>
        </v-flex>
        <v-flex xs5>
          <div class="right-nav">
            <v-layout row wrap>
              <v-flex xs6>
                <v-card
                  dark
                  class="jump-btn transfer-btn"
                  @click.native="$i18n.jumpTo(`/fund/transfer/CYB`)"
                >
                  <v-icon>ic-send</v-icon>
                  <h3>{{ $t('button.transfer') }}</h3>
                </v-card>
              </v-flex>
              <v-flex xs6>
                <v-card
                  dark
                  class="jump-btn"
                  @click.native="$i18n.jumpTo('/fund/history')"
                >
                  <v-icon>ic-records</v-icon>
                  <h3>{{ $t('button.history') }}</h3>
                </v-card>
              </v-flex>
            </v-layout>
          </div>
        </v-flex>
      </v-layout>
    </v-layout>
    <br />
    <v-layout row wrap>
      <v-flex xs12>
        <v-tabs v-model="activeTab" slider-color="cybex" dark height="40">
          <v-tab
            v-for="(tab, index) in tabItems"
            :key="index"
            :ripple="false"
            >{{ tab }}</v-tab
          >
          <v-tab-item>
            <asset-list />
          </v-tab-item>
        </v-tabs>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import utils from '~/components/mixins/utils'

export default {
  components: {
    NoticeTip: () => import('~/components/NoticeTip.vue'),
    AssetList: () => import('~/components/AssetList.vue')
  },

  mixins: [utils],
  data() {
    return {
      tabs: [
        {
          label: this.$t('tab_label.portfolio'),
          path: 'portfolio'
        }
      ]
    }
  },
  layout: 'transfer',
  computed: {
    ...mapGetters({
      username: 'auth/username',
      address: 'auth/address',

      symbol: 'i18n/symbol',
      locale: 'i18n/locale'
    }),
    tabItems() {
      return this.tabs.map((tab) => tab.label)
    },
    curFundType() {
      return this.tabs[this.activeTab].path
    },
    activeTab: {
      get() {
        return this.tab
      },
      set(value) {}
    }
  },
  watch: {},

  async mounted() {},
  head() {
    return {
      title: this.$t('title.portfolio')
    }
  }
}
</script>

<style lang="scss">
@import '~assets/style/_fonts/_font_mixin';
@import '~assets/style/_vars/_colors';

.userinfo-id {
  display: block;
  padding: 3px 8px 5px;
  min-width: 65px;
  color: map-get($main, grey);
  height: 20px;
  border-radius: 4px;
  background-image: linear-gradient(
    285deg,
    rgba(map-get($main, grey), 0.1),
    rgba(map-get($main, grey), 0.3)
  );
  line-height: 16px;
  position: relative;
}

.coin-age {
  color: map-get($main, grey);
  font-size: 12px;
  margin-top: 8px;
}

.coin-age-tooltip {
  padding: 16px;
  background-color: rgba(17, 22, 33, 0.92);
  border-radius: 4px;
  color: rgba(map-get($main, white), 0.8);
  line-height: 1.5;
  font-size: 12px;

  .l-title {
    color: map-get($main, orange);
  }
}

.right-nav {
  margin-left: 24px;

  .flex {
    padding-left: 2px;
  }

  .jump-btn {
    padding: 10px 15px;
    width: 100%;
    min-height: 64px;
    font-size: 12px;
    @include f-cybex-style('black', medium);
    line-height: 1.33;
    text-decoration: none;
    margin-right: 24px;
    cursor: pointer;
    box-shadow: 0 8px 8px -4px rgba(0, 0, 0, 0.04);
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.04);

    &.transfer-btn {
      right: 8px;
    }

    h3 {
      color: map-get($main, grey);
    }

    &:hover {
      background-color: #3b4250 !important;
    }

    .v-icon {
      font-size: 1.5em !important;
    }
  }
}

.title-line {
  height: 96px;
  padding-top: 25px;

  .left-tlt h1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  h1,
  h2,
  h3 {
    margin-top: 5px;
  }

  h1 {
    font-size: 24px;
    @include f-cybex-style('black');
  }

  span {
    font-size: 12px;
    @include f-cybex-style(medium);
  }
}

.account {
  margin: 0 auto;

  .v-tabs__item {
    @include f-cybex-style(heavy);
  }

  &,
  & > .layout {
    width: 1136px !important;
  }

  .right-column {
    max-width: 640px;
  }

  .balance {
    .b-label {
      font-size: 12px;
      @include f-cybex-style(medium);
      line-height: 1.33;
      opacity: 0.3;
    }

    h2 {
      font-size: 16px;
      @include f-cybex-style('black', medium);
      line-height: 1.5;
      color: white;
      opacity: 1;
    }

    .in-cny {
      font-size: 14px;
      @include f-cybex-style(medium);
      line-height: 1.14;
      color: map-get($main, grey);
    }
  }

  .v-tabs__wrapper {
    background: #171d2a;
    margin-bottom: 24px;
  }
}
</style>
