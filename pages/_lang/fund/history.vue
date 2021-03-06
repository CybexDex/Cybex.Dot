<template>
  <div class="transfer-history">
    <h1>{{ $t('title.history') }}</h1>
    <div v-if="islocked" class="desc-wrap">
      <cybex-btn small class="text-capitalize mt-2" @click="onUnlockClicked">{{
        $t('button.unlock_view')
      }}</cybex-btn>
    </div>
    <div v-else class="history-bg">
      <v-toolbar>
        <label class="label-input">{{ $t('form_label.asset') }}</label>
        <div class="select-wrap ml-2 mr-4">
          <v-select v-model="asset" :items="usedAssets" solo>
            <template slot="selection" slot-scope="{ item }">
              <div class="selected-item">
                <p v-if="item">{{ item | shorten }}</p>
                <p v-else>{{ $t('selection.all') }}</p>
              </div>
            </template>
            <div slot="item" slot-scope="{ item }" class="selection">
              <p v-if="item">{{ item | shorten }}</p>
              <p v-else>{{ $t('selection.all') }}</p>
            </div>
          </v-select>
        </div>
        <label class="label-input">{{ $t('form_label.type') }}</label>
        <div class="select-wrap ml-2">
          <v-select v-model="fundtype" :items="types" solo>
            <template slot="selection" slot-scope="{ item }">
              <div class="selected-item">
                <p v-if="item">{{ $t(`title.${item.toLowerCase()}`) }}</p>
                <p v-else>{{ $t('selection.all') }}</p>
              </div>
            </template>
            <div slot="item" slot-scope="{ item }" class="selection">
              <p v-if="item">{{ $t(`title.${item.toLowerCase()}`) }}</p>
              <p v-else>{{ $t('selection.all') }}</p>
            </div>
          </v-select>
        </div>
      </v-toolbar>
      <history-list :fundtype="fundtype" :asset="asset" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  components: {
    HistoryList: () => import('~/components/HistoryList.vue')
  },

  data() {
    return {
      itemlist: [],
      selected: null,
      datas: [],
      fundtype: null,
      asset: null,
      types: [null, 'DEPOSIT', 'WITHDRAW'],
      usedAssets: [null]
    }
  },
  layout: 'history',
  computed: {
    ...mapGetters({
      islocked: 'auth/islocked',
      username: 'auth/username'
    })
  },
  watch: {
    async islocked(newval, oldval) {
      if (!newval && oldval) {
        await this.loadUsedAssets()
      }
    }
  },

  async mounted() {
    if (!this.islocked) {
      await this.loadUsedAssets()
    }
  },
  methods: {
    onUnlockClicked() {
      this.$toggleLock()
    },
    loadUsedAssets() {
      // try {
    }
  },
  head() {
    return {
      title: this.$t('title.history')
    }
  }
}
</script>

<style lang="scss">
@import '~assets/style/_fonts/_font_mixin';
@import '~assets/style/_vars/_colors';

.history {
  .v-menu__content {
    margin-left: 0;
    margin-top: 26px;
  }
  .v-select-list.v-card {
    overflow-y: hidden;
    margin-top: 26px;

    .v-list.theme--dark {
      // padding: 0;
      background: #212939 !important;

      .v-list__tile {
        height: 32px !important;
        padding: 0;

        &:hover {
          background-color: rgba(255, 255, 255, 0.04);
        }
      }
    }
  }

  .primary--text.v-list-item {
    color: map-get($main, anchor) !important;
    .selection p {
      color: #ff9143;
    }
  }

  .select-wrap {
    width: 95px;
    .v-input__control .v-input__slot {
      cursor: pointer;
    }
  }

  .v-input--is-focused {
    font-size: 12px;
    @include f-cybex-style('black');
    color: map-get($main, grey);
  }

  .selection {
    width: 95px;
    /* background-color: #212939; */
    width: 100%;
    line-height: 32px;
    font-size: 12px;
    @include f-cybex-style(medium);
    height: 32px;
    text-align: center;
    opacity: 0.8;

    &:hover {
      background-color: rgba(255, 255, 255, 0.04) !important;
    }
  }

  .v-select--is-menu-active .selected-item {
    color: rgba(143, 154, 185, 1);
  }

  .selected-item {
    width: 100%;
    height: 24px;
    line-height: 24px;
    border-radius: 4px;
    background-color: #212939;
    font-size: 12px;
    @include f-cybex-style('black');
    color: rgba(143, 154, 185, 0.5);
    white-space: nowrap;

    &:visited {
      color: rgba(143, 154, 185, 1);
    }
  }
}

.transfer-history {
  width: 1136px;
  margin: 0 auto;

  .desc-wrap {
    margin: 0 auto;
    width: 1136px;
    height: 408px;
    padding-top: 80px;
    background-color: #1b2230;
    text-align: center;

    .v-btn {
      height: 32px;
      border-radius: 4px;
      padding: 0;
      margin: 0;
      background-image: linear-gradient(111deg, #ffc478, #ff9143);

      .v-btn__content {
        font-size: 12px;
        color: white;
        text-transform: capitalize;
        padding: 0 18px;
      }
    }
  }

  h1 {
    margin-top: 39px;
    margin-bottom: 29px;
    margin-left: 24px;
  }

  .history-bg {
    background: #1b2230;
    padding: 0 24px 0 16px;

    .label-input {
      opacity: 0.3;
      font-size: 12px;
      @include f-cybex-style(medium);
      line-height: 1.33;
      color: white;
    }

    .theme--dark.v-toolbar {
      box-shadow: initial !important;

      .v-toolbar__content {
        background: #1b2230;
        height: 64px;
        padding-left: 8px;
      }
    }
  }

  .v-list.theme--dark .v-list__tile {
    height: 32px !important;
  }

  .v-select.v-text-field.v-text-field--solo .v-input__control {
    height: 24px;
    min-height: 24px;
  }
}
</style>
