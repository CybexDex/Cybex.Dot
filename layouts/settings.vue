<template>
  <v-app dark class="cybex page-user-setting">
    <!-- top navigator -->
    <appNav />
    <!-- end top navigator -->
    <!-- content start -->
    <v-content>
      <v-container class="content-container">
        <perfect-scrollbar :options="{ swipeEasing: false }">
          <transition name="layout" mode="out-in">
            <nuxt />
          </transition>
        </perfect-scrollbar>
      </v-container>
    </v-content>
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
}
</script>

<style lang="scss">
@import '~assets/style/_vars/_colors';
@import '~assets/style/_fonts/_font_mixin';

.page-user-setting {
  font-size: 1em;

  .container {
    overflow-x: auto;
    height: 100%;
    width: 100%;
    min-height: 532px;
    padding: 0;
  }

  .content-container {
    height: 100%;
    max-width: 1280px !important;
    margin: 0 auto;
    min-width: 1024px;
    transition: all 0.2s;
    padding: 32px 128px;

    .content-container-inner {
      padding: 0 125px;
    }

    &.center {
      padding: 32px 125px;
    }
  }

  .page-head-title {
    font-size: 1.7em;
    color: map-get($main, white);
    letter-spacing: 0.3px;
    line-height: 2;
    @include f-cybex-style(heavy);
  }

  .setting-desc {
    color: rgba(map-get($main, white), 0.8);
    line-height: 1.71;
  }
}
</style>
