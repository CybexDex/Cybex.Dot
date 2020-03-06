<template>
  <div>
    <v-app-bar class="cybex-nav">
      <v-snackbar
        v-model="isShowMsg"
        :class="`msg-${msgType || 'normal'}`"
        :timeout="msgDelay"
        bottom
        absolute
      >
        <div class="content">
          <span
            class="icon"
            :class="{
              'ic-correct': msgType != 'error',
              'ic-cancel': msgType == 'error'
            }"
          />
          <span class="msg">{{ message }}</span>
        </div>
      </v-snackbar>

      <div class="logo-banner">
        <router-link :to="$i18n.path('/')">
          <img
            src="~assets/svg/cybex-logo.svg"
            alt="Cybex Dashboard"
            data-radium="true"
          />
        </router-link>
      </div>

      <div
        class="exchange-tab"
        :class="{ 'fill-height': $route.path.indexOf('/exchange') > -1 }"
      >
        <nuxt-link
          :to="$i18n.path(defaultExchangePath)"
          :class="getLinkClass('/exchange')"
          >{{ $t('nav.exchange') }}</nuxt-link
        >
      </div>
      <v-spacer></v-spacer>

      <v-menu
        v-if="username"
        content-class="nav-menu"
        class="pl-0 ml-5 nav-menu-wrapper column"
        :transition="'fade-transition'"
        offset-y
        auto
        open-on-hover
      >
        <div
          slot="activator"
          class="full-width"
          :class="getLinkClass('/fund')"
          dark
        >
          {{ $t('nav.funds') }}
        </div>
        <v-list class="asset-menu">
          <v-list-tile
            v-for="(item, index) in funditems"
            :key="index"
            :class="getLinkClass(item.path)"
            @click="$i18n.jumpTo(item.path)"
          >
            <v-list-tile-title>{{ $t(item.title) }}</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
      <nuxt-link v-else :class="getLinkClass('/')" :to="toLoginPath">{{
        $t('nav.login')
      }}</nuxt-link>
      <div class="divider" />

      <v-menu offset-y transition="'fade-transition'">
        <template v-slot:activator="{ on }">
          <v-btn
            active-class="v-menu__activator--active"
            class="info--text"
            color="cybexGrey"
            dark
            text
            :ripple="false"
            v-on="on"
          >
            {{ $i18n.label() }}
            <span class="ic-arrow_drop_down" />
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            v-for="(lang, index) in langs"
            :key="index"
            @click="switchLang(lang.code)"
          >
            <v-list-item-title>{{ lang.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import utils from '~/components/mixins/utils'

export default {
  name: 'AppNavgation',
  components: {},
  mixins: [utils],
  props: {
    height: {
      type: Number,
      default: 60
    }
  },
  data() {
    return {
      cybexDotName: '',
      title: this.$t('title.name'),
      openLanMenu: false,
      currentTab: 0
    }
  },
  computed: {
    ...mapGetters({
      username: 'auth/username',
      langs: 'i18n/locales',
      showMsg: 'showMsg',
      message: 'msgContent',
      msgType: 'msgType',
      msgDelay: 'msgDelay'
    }),
    langTitles: {
      get() {
        return this.langs.map((v) => {
          return v.title
        })
      },
      set() {}
    },
    defaultExchangePath() {
      return this.$route.params.currency
        ? `/exchange/${this.$route.params.currency}`
        : '/exchange'
    },
    isShowMsg: {
      get() {
        return this.showMsg
      },
      set(value) {
        this.$store.commit('CLOSE_MSG')
      }
    },
    toLoginPath() {
      const isLoginPage =
        this.$route.matched.length === 1 &&
        this.$route.matched[0].path === '/:lang'
      return !isLoginPage
        ? this.$i18n.path('/' + '?from=' + this.$route.path)
        : this.$i18n.path('/')
    }
  },
  watch: {},
  mounted() {},
  beforeDestroy() {},
  methods: {
    getLinkClass(path) {
      let isActive = this.$route.path.includes(path)
      if (path === '/') {
        isActive = this.$route.path.endsWith(`/${this.$route.params.lang}/`)
      }

      const showExchangeBottom = path === '/exchange' && isActive
      return {
        'btn-jump': true,
        'active-link': isActive,
        'exchange-link': showExchangeBottom,
        'exchange-link-small': showExchangeBottom && this.height === 40
      }
    },
    switchLang(lang) {
      this.openLanMenu = false
      this.$router.push(this.$route.fullPath.replace(/^\/[^/]+/, '/' + lang))
    }
  }
}
</script>

<style lang="scss">
@import '~/assets/style/_vars/_colors';
@import '~/assets/style/_fonts/_font_mixin';

.v-menu__content {
  margin-left: 12px;
}

.v-list {
  padding: 0;
}
.cybex-nav {
  .v-tabs-bar__content {
    background: map-get($main, lead);
  }

  .v-toolbar__content {
    padding: 0;
    word-break: keep-all;
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    background: map-get($main, lead);
    box-shadow: inset -1px 0 0 0 map-get($main, noir);
    align-items: center;

    .v-tabs {
      height: 100%;
      display: flex;
      .v-tabs-bar {
        height: 100%;
      }
    }
    .logo-banner {
      height: 100%;
      width: 100%;
      display: flex;
      padding: 0 20px;
      align-items: center;
      flex: 0 0 0;
      a {
        display: flex;
      }
      img {
        filter: brightness(1.3);
        margin: 0px 0px 0px 6px;
        height: 20px;
      }
    }

    .divider {
      box-shadow: inset -1px 0 0 0 map-get($main, noir);
      height: 100%;
      width: 2px;
    }

    .btn-jump {
      &.full-width {
        width: 100%;
      }

      @include f-cybex-style('black');
      color: map-get($main, grey);
      margin: 0 16px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-around;
      position: relative;

      &.active-link {
        color: map-get($main, orange);

        &.exchange-link {
          height: 21px;
          display: block;
          position: static;

          &:after {
            content: '';
            display: block;
            width: calc(100% - 32px);
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
            background-image: map-get($gradients, goldex);
            height: 4px;
            border: none;
            position: absolute;
            bottom: 0;
          }
        }
      }
    }

    .exchange-tab {
      position: relative;
      display: flex;
      align-items: center;
      padding: 0;
      flex-direction: column;
      justify-content: center;
      flex: 0 0 0;
    }

    .v-btn__content {
      @include f-cybex-style('black');
    }
    .lang-select {
      width: 93px;
      text-align: right;
      color: map-get($main, grey);
      padding: 0 4px 0 16px;
      font-size: 12px;
      @include f-cybex-style('black');

      &.border-left {
        border-left: 1px solid map-get($main, noir);
      }

      .lang-item {
        color: rgba(map-get($main, white), 0.8);
        font-size: 12px;
        line-height: 1.33;
        @include f-cybex-style(heavy);
      }

      .ic-arrow_up,
      .ic-arrow_drop_down {
        font-size: 24px;
      }

      .v-menu__activator--active {
        color: map-get($main, orange);

        .ic-arrow_up:before {
          color: map-get($main, orange);
        }

        .ic-arrow_drop_down:before {
          color: map-get($main, orange);
        }
      }
    }
  }

  .v-size--default.v-btn {
    height: 100%;
  }
}
</style>
