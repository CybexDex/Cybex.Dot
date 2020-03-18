<template>
  <v-app dark class="cybex transfer-layout">
    <!-- top navigator -->
    <appNav />
    <!-- end top navigator -->
    <!-- content start -->
    <perfect-scrollbar :options="{ swipeEasing: false }">
      <div>
        <v-content class="pb-5 min-width">
          <v-container fluid class="pa-0">
            <nuxt />
          </v-container>
        </v-content>
      </div>
    </perfect-scrollbar>
    <!-- content end -->
    <!-- footer start -->
    <appFooter :float="false" />
    <!-- footer end -->
  </v-app>
</template>

<script>
export default {
  components: {
    appNav: () => import('~/components/AppNavigation.vue'),
    appFooter: () => import('~/components/AppFooter.vue')
  }
  // middleware: ['init-asset']
}
</script>

<style lang="scss">
@import '~assets/style/_fonts/_font_mixin';
@import '~assets/style/_vars/_colors';

.transfer-layout .container {
  max-width: 1280px !important;
}

.transfer-form-wrapper {
  padding: 27px 0px 33px 32px;
  font-size: 12px;

  .v-form {
    width: 100%;
  }

  .form-field {
    margin-bottom: 8px;
  }

  .error-msg {
    color: map-get($main, error) !important;
    padding: 8px 0 12px;
    min-height: 32px;
    margin: 0;
  }

  .forbid-info {
    margin-top: 80px;
    margin-bottom: 80px;
    text-align: center;
    color: map-get($main, orange);
    width: 100%;
  }

  .show-fee {
    color: rgba(map-get($main, white), 0.5);

    .fee-label {
      color: rgba(map-get($main, white), 0.5);

      &.large {
        font-size: 14px;
        color: rgba(map-get($main, white), 0.8);
      }
    }

    .fee-amount {
      @include f-cybex-style(heavy);
      color: map-get($main, grey);

      &.large {
        font-size: 14px;
        color: map-get($main, white);
      }
    }
  }
}
</style>
