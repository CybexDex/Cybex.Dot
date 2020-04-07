<template>
  <div class="content-container">
    <div class="page-head-title mb-0">
      {{ $t('exchange.order-table.tab-title.open-order') }} ({{
        titleOrderRowLen
      }})
    </div>
    <v-tabs v-model="active" class="asset-tabs" slider-color="cybex" dark>
      <v-tab v-for="(tabItem, idx) in tabItems" :key="idx">
        {{ tabItem.title }}
      </v-tab>
      <v-tab-item v-for="(tabItem, idx) in tabItems" :key="idx">
        <div class="orders-area order-list">
          <ExchangeOpenOrder
            :white-flag="tabItem.whiteFlag"
            :mode="'full'"
            @update-row-length="(v) => updateRowLen(v, tabItem.whiteFlag)"
          />
        </div>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
export default {
  components: {
    ExchangeOpenOrder: () =>
      import('~/components/exchange/ExchangeHistoryOpenOrder.vue')
  },

  layout: 'orders',
  data() {
    return {
      openOrderRowLen: 0,
      openCustomOrderRowLen: 0,
      openGameOrderRowLen: 0,
      tabItems: [{ title: this.$t('tab_label.main'), whiteFlag: 'white' }]
    }
  },
  computed: {
    titleOrderRowLen() {
      let t
      switch (this.active) {
        case 0:
          t = this.openOrderRowLen
          break
        case 1:
          t = this.openCustomOrderRowLen
          break
        case 2:
          t = this.openGameOrderRowLen
      }
      return t
    },
    active: {
      set(val) {
        if (val === 1) {
          this.$router.push({ hash: 'tab-custom' })
        } else if (val === 2) {
          this.$router.push({ hash: 'tab-game' })
        } else {
          this.$router.push({ hash: null })
        }
      },
      get() {
        const hash = this.$route.hash
        if (!hash) return 0
        return hash === '#tab-custom' ? 1 : 2
      }
    }
  },
  methods: {
    updateRowLen(v, whiteFlag) {
      if (whiteFlag === 'white') {
        this.openOrderRowLen = v
      } else if (whiteFlag === 'game') {
        this.openGameOrderRowLen = v
      } else {
        this.openCustomOrderRowLen = v
      }
    }
  },
  head() {
    return {
      title: this.$t('exchange.order-table.tab-title.open-order')
    }
  }
}
</script>
