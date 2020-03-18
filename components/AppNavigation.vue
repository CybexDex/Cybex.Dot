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

      <!-- funds menu -->
      <v-menu
        v-if="username || cookieName"
        content-class="nav-menu"
        class="pl-0 ml-5 nav-menu-wrapper column"
        :transition="'fade-transition'"
        offset-y
        auto
        open-on-hover
      >
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
            {{ $t('nav.funds') }}
          </v-btn>
        </template>
        <v-list class="asset-menu">
          <v-list-item
            v-for="(item, index) in funditems"
            :key="index"
            :class="getLinkClass(item.path)"
            @click="$i18n.jumpTo(item.path)"
          >
            <v-list-item-title>{{ $t(item.title) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <nuxt-link v-else :class="getLinkClass('/')" :to="toLoginPath">{{
        $t('nav.login')
      }}</nuxt-link>

      <!-- order menu -->
      <v-menu
        v-if="username || cookieName"
        class="nav-menu-wrapper column"
        content-class="nav-menu"
        offset-y
        auto
        open-on-hover
        :transition="'fade-transition'"
      >
        <template v-slot:activator="{ on }">
          <v-btn
            active-class="v-menu__activator--active"
            class="info--text"
            :class="getLinkClass('/orders')"
            color="cybexGrey"
            dark
            text
            :ripple="false"
            v-on="on"
          >
            {{ $t('nav.orders') }}
          </v-btn>
        </template>
        <v-list class="asset-menu">
          <v-list-item
            v-for="(item, index) in orderitems"
            :key="index"
            :class="getLinkClass(item.path)"
            @click="$i18n.jumpTo(item.path)"
          >
            <v-list-item-title>{{ $t(item.title) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <template v-else>
        <nuxt-link
          :class="getLinkClass('/register')"
          :to="$i18n.path('/register')"
          >{{ $t('nav.register') }}</nuxt-link
        >
      </template>

      <div v-if="username || cookieName" class="portrait-link">
        <div class="toggle-user-wrapper">
          <!-- 头像  -->
          <UserPortrait :username="username || cookieName" size="64" />
          <!-- 用户名 -->
          <div class="pl-3 overflow-username" :title="username || cookieName">
            {{ username }}
          </div>
        </div>
      </div>
      <div class="divider" />

      <v-flex v-if="username || cookieName" class="nav-icons">
        <!-- 解锁 -->
        <div class="link-btn text-center">
          <v-btn icon @click="onUnlockClicked">
            <v-icon>{{ islocked ? 'ic-lock_tab' : 'ic-unlock_tab' }}</v-icon>
          </v-btn>
          <unlock-dialog />
        </div>
        <!-- 设置 -->
        <v-menu
          class="nav-menu-wrapper icon column"
          content-class="pl-0 nav-menu icon"
          offset-y
          auto
          bottom
          center
          :transition="'fade-transition'"
        >
          <template
            v-slot:activator="{ on }"
            class="link-btn text-center settings"
          >
            <v-btn icon v-on="on">
              <v-icon>ic-settings</v-icon>
            </v-btn>
            <logout-dialog />
          </template>
          <v-list class="asset-menu">
            <template v-for="(item, index) in settingItems">
              <!-- 菜单跳转 -->
              <v-list-item
                v-if="item.path"
                :key="index"
                :class="getLinkClass(item.path)"
                @click="$i18n.jumpTo(item.path)"
              >
                <v-list-item-title>{{ $t(item.title) }}</v-list-item-title>
              </v-list-item>
              <!-- 弹窗事件 -->
            </template>
          </v-list>
        </v-menu>
        <!-- 登出 -->
        <div class="link-btn text-center">
          <v-btn icon @click="onLogoutClick">
            <v-icon>ic-logout</v-icon>
          </v-btn>
          <logout-dialog />
        </div>
      </v-flex>
      <!-- language select -->
      <v-menu
        content-class="nav-menu"
        transition="'fade-transition'"
        offset-y
        auto
        open-on-hover
      >
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
  components: {
    UserPortrait: () => import('~/components/UserPortrait.vue'),
    UnlockDialog: () => import('~/components/UnlockDialog.vue'),
    LogoutDialog: () => import('~/components/LogoutDialog.vue')
  },
  mixins: [utils],
  props: {
    height: {
      type: Number,
      default: 60
    }
  },
  data() {
    return {
      settingItems: [],
      title: this.$t('title.name'),
      openLanMenu: false,
      currentTab: 0,
      orderitems: [
        {
          title: 'nav.open_order',
          path: '/orders/open-order'
        },
        {
          title: 'nav.order_history',
          path: `/orders/order-history`
        },
        {
          title: 'nav.trade_history',
          path: `/orders/trade-history`
        }
      ]
    }
  },
  computed: {
    ...mapGetters({
      islocked: 'auth/islocked',
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
    },
    cointype() {
      return this.$route.params.cointype
    },
    funditems() {
      return [
        {
          title: 'nav.assets',
          path: '/fund/assets'
        },
        {
          title: 'nav.deposit',
          path: `/fund/deposit/${this.cointype}`
        },
        {
          title: 'nav.withdraw',
          path: `/fund/withdraw/${this.cointype}`
        },
        {
          title: 'nav.transfer_history',
          path: '/fund/history'
        }
      ]
    }
  },
  watch: {},
  mounted() {
    this.settingItems = this.getSettingItems()
  },
  beforeDestroy() {},
  methods: {
    onLogoutClick() {
      this.$toggleLogout()
    },
    getSettingItems() {
      if (!this.username) {
        return []
      }
      const items = [
        {
          title: 'nav.settings.general',
          path: '',
          clickEvt: this.showSettingDialog
        },
        {
          title: 'nav.settings.backup',
          path: `/settings/backup`
        }
      ]
      return items
    },
    async onUnlockClicked() {
      const locked = await this.$store.dispatch('auth/toggleLock')

      if (locked) {
        this.$message({
          message: this.$t('message.locked_succ')
        })
      }
    },
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
.v-menu__content.theme--dark .theme--dark.v-sheet {
  background-color: map-get($main, anchor) !important;
  padding: 8px auto !important;

  .v-list-item {
    padding: 0px;
    min-height: 32px;
    text-align: center;
    .v-list-item__title {
      font-size: 12px;
    }
  }
}
.theme--dark.v-list-item--active:hover::before,
.theme--dark.v-list-item--active::before {
  opacity: 1;
}
.theme--dark.v-text-field > .v-input__control > .v-input__slot:before,
.theme--dark.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none;
  visibility: hidden;
}
.theme--dark.v-text-field > .v-input__control > .v-input__slot {
  background-color: map-get($main, anchor) !important;
  box-shadow: none;
}

.v-text-field.v-text-field--solo:not(.v-text-field--solo-flat)
  > .v-input__control
  > .v-input__slot {
  box-shadow: none;
}

.theme--dark.v-input--checkbox
  > .v-input__control
  > .v-input__slot
  > .theme--dark.v-label {
  font-size: 12px;
}

.theme--dark.v-text-field
  > .v-input__control
  > .v-input__slot
  > .v-text-field__slot {
  .v-label {
    font-size: 12px;
  }
  font-size: 12px;
}

.nav-menu.v-menu__content {
  margin-left: 12px;
  margin-top: 0px;
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

    // 切换用户头像
    .toggle-user-wrapper {
      display: flex;
      align-items: center;
      height: 100%;
    }

    // 用户头像 名字
    .portrait-link {
      height: 100%;
      color: map-get($main, white);
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 0 16px;
      border-left: 1px solid map-get($main, noir);

      p {
        margin-bottom: 0px !important;
        line-height: 64px;
        margin-left: 16px;
      }

      .link-btn {
        width: 100%;

        &.settings {
          height: 100%;
          display: inline-flex;
          align-items: center;
        }
      }

      button {
        width: 36px;
        height: 36px;
        margin: 0;
      }
    }

    // 图标集合
    .nav-icons {
      height: 100%;
      align-items: center;
      border-left: 1px solid map-get($main, noir);
      display: flex;
      flex: 0 1 auto;
      padding-left: 8px;
    }

    // 覆写toolbal
    .theme--dark.v-toolbar {
      background: map-get($main, lead);
      overflow-x: auto;
      word-break: keep-all;
      white-space: nowrap;
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
