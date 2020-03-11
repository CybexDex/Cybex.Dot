<template>
  <v-dialog
    v-model="isShowLogout"
    persistent
    content-class="logout-panel"
    width="464"
  >
    <v-icon
      class="btn-close"
      style="width: auto;"
      size="24"
      @click="isShowLogout = false"
      >ic-close</v-icon
    >
    <h2 class="d-title">{{ $t('title.logout') }}</h2>
    <p class="logout desc">
      {{ $t('info.local_logout') }}
    </p>
    <v-flex class="notify-check">
      <!-- 预加载ic-check_box_active防止出现卡顿-->
      <v-icon class="hidden" style="display:none">{{
        'ic-check_box_active'
      }}</v-icon>
      <v-checkbox
        v-model="pwdCheck"
        middle
        class="ma-0 pa-0"
        :size="20"
        :label="$t('checkbox_label.warn_no_forgot_local')"
      />
    </v-flex>
    <v-flex class="notify-check">
      <v-checkbox
        v-model="backupCheck"
        middle
        :label="$t('checkbox_label.warn_backup_local')"
      />
    </v-flex>
    <v-flex class="notify-check">
      <v-checkbox
        v-model="wantCheck"
        middle
        class="ma-0 pa-0"
        :label="$t('checkbox_label.warn_really_logout')"
      />
    </v-flex>
    <cybex-btn
      block
      middle
      class="confirm-logout text-capitalize"
      :disabled="!canLogout"
      @click="onLogoutClick"
      >{{ $t('button.logout') }}</cybex-btn
    >
  </v-dialog>
</template>

<style lang="scss">
@import '~assets/style/_fonts/_font_mixin';
@import '~assets/style/_vars/_colors';

.os-windows {
  .logout-panel {
    line-height: 18px !important;
    .v-input--checkbox .v-label {
      line-height: 18px !important;
    }
  }
}

.logout-panel {
  background: map-get($main, lead);
  width: 464px;
  font-size: 14px;
  color: rgba(map-get($main, white), 0.8);
  padding: 40px 32px 56px !important;
  line-height: 24px;
  position: relative;

  // 标题
  .d-title {
    font-size: 28px;
    @include f-cybex-style('black');
    line-height: 2;
    color: map-get($main, white);
  }

  // 描述
  .desc {
    margin-bottom: 32px;
  }

  // 选项
  .notify-check {
    padding-right: 11px;
    margin-bottom: 12px;
  }
  .confirm-logout {
    margin-top: 32px;
  }
}
</style>

<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      pwdCheck: false,
      wantCheck: false,
      backupCheck: false
    }
  },
  computed: {
    ...mapGetters({
      username: 'auth/username',
      showLogout: 'showLogout'
    }),
    isShowLogout: {
      get() {
        return this.showLogout
      },
      set(value) {
        this.$toggleLogout()
      }
    },
    canLogout() {
      return this.pwdCheck && this.wantCheck && this.backupCheck
    }
  },
  watch: {
    isShowLogout() {
      this.pwdCheck = false
      this.wantCheck = false
      this.backupCheck = false
    }
  },
  methods: {
    async onLogoutClick() {
      const redirect = this.$i18n.path('/')
      await this.$store.dispatch('auth/logout', {
        redirect,
        showLogout: true
      })
    }
  }
}
</script>
