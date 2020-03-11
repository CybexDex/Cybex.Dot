<template>
  <v-dialog
    v-model="isShowUnlock"
    persistent
    :content-class="'unlock-panel is-local'"
    width="464"
  >
    <v-icon
      class="btn-close"
      style="width: auto;"
      size="24"
      @click="isShowUnlock = false"
      >ic-close</v-icon
    >
    <h2 class="unlock-title">{{ $t('title.unlock') }}</h2>
    <v-form ref="form" lazy-validation @submit.prevent="onUnlockClicked">
      <v-layout row wrap>
        <v-flex xs12 class="mb-2">
          <h4 class="unlock-label">{{ $t('placeholder.password') }}</h4>
        </v-flex>
        <v-flex xs12 class="password">
          <v-text-field
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="ic-lock_outline"
            :append-icon="
              showPassword ? 'ic-visibility_off' : 'ic-visibility_on'
            "
            :rules="passwordRules"
            :placeholder="$t('placeholder.enter_password')"
            required
            @click:append="showPassword = !showPassword"
          />
        </v-flex>
      </v-layout>
      <cybex-btn
        block
        middle
        class="text-capitalize"
        :disabled="!password || unlocking"
        @click="onUnlockClicked"
        >{{ $t('button.unlock') }}</cybex-btn
      >
    </v-form>
  </v-dialog>
</template>

<style lang="scss">
@import '~assets/style/_fonts/_font_mixin';
@import '~assets/style/_vars/_colors';

.unlock-panel {
  overflow: hidden;
  background: map-get($main, lead);
  padding: 10px 20px;
  width: 464px;
  height: 418px;
  padding: 42px 32px !important;
  &.is-local {
    height: 330px;
  }

  .usrname-ic {
    flex: 0 0 24px !important;
    font-size: 30px;
    opacity: 0.5;
    margin: 0 12px;
  }

  .usrname {
    @include f-cybex-style(heavy);
    color: rgba(map-get($main, white), 0.3);
    font-size: 14px;
    text-overflow: ellipsis;
    overflow: hidden;
    padding-top: 3px;
  }

  .v-text-field {
    &.v-text-field--solo {
      .v-input__icon--prepend-inner {
        margin-right: 10px;
        margin-left: 7px;
      }
    }

    .v-input__slot {
      background: map-get($main, independence) !important;

      input {
        @include f-cybex-style(heavy);
      }
    }
  }

  .unlock-title {
    @include f-cybex-style('black');
    font-size: 24px;
    color: map-get($main, white);
    line-height: 48px;
    height: 48px;
    margin-bottom: 28px;
  }

  .unlock-label {
    font-size: 12px;
    @include f-cybex-style(heavy);
    line-height: 2;
    height: 24px;
  }
}
</style>

<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      showPassword: false,
      someErr: null,
      password: '',
      nameRules: [(value) => !!value || this.$t('validation.account_required')],
      passwordRules: [(value) => this.checkPwd(value)],
      unlocking: false
    }
  },
  computed: {
    ...mapGetters({
      username: 'auth/username',
      showUnlock: 'showUnlock'
    }),
    isShowUnlock: {
      get() {
        return this.showUnlock
      },
      set(value) {
        this.$toggleLock()
      }
    }
  },
  watch: {
    isShowUnlock() {
      const form = this.$refs.form
      if (form) {
        form.reset()
      }
      this.showPassword = false
      this.someErr = null
      this.password = ''
    }
  },
  methods: {
    async onUnlockClicked() {
      this.unlocking = true
      await this.$store
        .dispatch('auth/unlock', { password: this.password })
        .then((res) => {
          if (res) {
            this.$nextTick(() => {
              this.$message({
                message: this.$t('message.unlock_succ')
              })
            })
          } else {
            this.someErr = true
            this.$refs.form.validate()
          }
        })
        .catch((e) => {
          this.someErr = true
          this.$refs.form.validate()
        })
        .finally(() => {
          this.unlocking = false
        })
    },
    checkPwd(value) {
      if (this.someErr) {
        this.someErr = false
        return this.$t('error.UB_fail_unlock')
      }
      return !!value || this.$t('validation.pwd_required')
    }
  }
}
</script>
