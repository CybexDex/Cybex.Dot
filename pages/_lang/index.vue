<template>
  <v-flex class="login-bg">
    <div class="login-wrapper">
      <div class="main_tlt text-left mt-0">{{ $t('title.welcome') }}</div>
      <div
        class="sub_tlt text-left"
        v-html="$t('sub_title.jump_to_reg', { url: '/register' })"
      />
      <div class="login_tlt text-left">
        {{ $t('button.wallet_login', { mode: $t('wallet.Local') }) }}
      </div>
      <v-form
        ref="form"
        class="cybex large"
        lazy-validation
        @submit="login"
        @submit.prevent
      >
        <!-- 本地钱包 json文件 -->
        <cybex-file-upload :file-accept="'.json'" @file-changed="fileChanged" />
        <v-text-field
          v-model="password"
          filled
          dark
          background-color="#212939"
          :class="pwdClass"
          :type="showPassword ? 'text' : 'password'"
          :error-messages="passwordRules"
          :label="$t('placeholder.password')"
          prepend-inner-icon="ic-lock_outline"
          :append-icon="showPassword ? 'ic-visibility_off' : 'ic-visibility_on'"
          @click:append="showPassword = !showPassword"
        ></v-text-field>

        <div v-if="someErr" class="login-error text-left mt-2">
          {{ $t('validation.account_not_exists') }}
        </div>
        <cybex-btn
          block
          middle
          type="submit"
          class="login-btn text-capitalize"
          :disabled="!couldLogin"
          >{{ $t('button.login') }}</cybex-btn
        >
      </v-form>

      <div class="toggle-login restore" @click="redirectToStorePage">
        {{ $t('wallet.restore_wallet') }}
      </div>
    </div>
  </v-flex>
</template>

<script>
import { isHex, isObject, u8aToString } from '@polkadot/util'
import keyring from '@polkadot/ui-keyring'
import utils from '~/components/mixins/utils'

export default {
  mixins: [utils],

  data() {
    return {
      hasSubmitted: false,
      name: '',
      message: '',
      password: '',
      showPassword: false,
      showLogined: false,
      someErr: false,
      errCheckTimes: 0,
      inLogin: false,
      loginMode: null,
      file: null
    }
  },
  computed: {
    pwdClass() {
      return {
        'pwd-input': true,
        'pwd-visited': !!this.password
      }
    },
    passwordRules() {
      return this.hasSubmitted && !this.checkPwd()
        ? this.$t('validation.pwd_required')
        : ''
    },

    couldLogin() {
      const checkCondition = this.file && this.password

      return checkCondition && !this.inLogin
    }
  },
  watch: {},

  mounted() {
    window.jumpTo = this.$i18n.jumpTo
  },
  methods: {
    redirectToStorePage() {
      this.$router.push(this.$i18n.path('/settings/restore'))
    },
    checkPwd() {
      this.errCheckTimes++
      if (this.errCheckTimes > 1) {
        this.someErr = false
        this.errCheckTimes = 0
      }
      return !!this.password
    },
    fileChanged(file) {
      this.readJsonFile(file)
    },
    readJsonFile(file) {
      if (!file) {
        this.file = null
        return
      }

      const reader = new FileReader()
      const NOOP = () => undefined

      reader.onabort = NOOP
      reader.onerror = NOOP
      reader.onload = ({ target }) => {
        if (target && target.result) {
          try {
            const json = JSON.parse(u8aToString(new Uint8Array(target.result)))
            const publicKey = keyring.decodeAddress(json.address, true)
            keyring.encodeAddress(publicKey)
            const isFileValid =
              publicKey.length === 32 &&
              isHex(json.encoded) &&
              isObject(json.meta) &&
              (Array.isArray(json.encoding.content)
                ? json.encoding.content[0] === 'pkcs8'
                : json.encoding.content === 'pkcs8')
            if (isFileValid) {
              this.file = json
            }
          } catch {}
        }
      }
      reader.readAsArrayBuffer(file)
    },
    authLoginSuccessDeal() {
      this.$message({
        message: this.$t('message.login_succ')
      })

      // url跳转
      const fromUrl = this.$route.query.from
      // 云钱包跳转到登录前页面或者交易所
      const url = fromUrl ?? this.$i18n.path('/exchange')

      console.log('redirect to ', url)
      this.$router.push(url)
    },
    async login(event) {
      if (!this.couldLogin) {
        return false
      }
      this.inLogin = true
      this.hasSubmitted = true
      // try {
      // console.log(" this.file ", this.file);
      try {
        const result = await this.$store.dispatch('auth/login', {
          json: this.file,
          password: this.password
        })
        if (result) {
          this.someErr = false
          this.authLoginSuccessDeal()
        }
      } catch {
        this.someErr = true
        this.errCheckTimes = 0
        this.$refs.form.validate()
      } finally {
        this.inLogin = false
      }
    }
  },
  head() {
    return {
      title: this.$t('title.login')
    }
  }
}
</script>

<style lang="scss">
@import '~assets/style/_fonts/_font_mixin';
@import '~assets/style/_vars/_colors';

.v-text-field > .v-input__control > .v-input__slot:after {
  border: none;
}

.theme--dark.v-text-field > .v-input__control > .v-input__slot:before {
  visibility: hidden;
}

.v-text-field .v-input__control {
  border-radius: 4px;
  input,
  input::placeholder {
    @include f-cybex-style(medium);
    color: rgba(map-get($main, grey), 0.5);
    font-size: 14px !important;
  }
  input {
    color: white;
  }
  .theme--dark.v-label {
    @include f-cybex-style(medium);
    color: rgba(map-get($main, grey), 0.5);
    font-size: 14px !important;
  }
}

.v-textarea .v-input__control {
  border-radius: 4px;
  textarea,
  textarea::placeholder {
    @include f-cybex-style(medium);
    color: rgba(map-get($main, grey), 0.5);
    font-size: 14px !important;
  }
  textarea {
    color: white;
  }
}

.v-messages__message {
  line-height: 1.33;
  font-size: 14px;
}

.v-text-field.v-text-field--enclosed .v-text-field__details {
  margin-top: 8px;
}

.toggle-login {
  cursor: pointer;
  position: absolute;
  bottom: 10px;
  height: 24px;
  width: 171px;
  margin: 0 auto;
  line-height: 1.33;
  color: map-get($main, grey);
  @include f-cybex-style(heavy);
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  .arrow {
    position: relative;
    top: -2px;
    left: 4px;
    transform: rotate(180deg);

    &:before {
      color: map-get($main, grey);
    }
  }

  &.restore {
    right: 32px;
    justify-content: flex-end;
  }
}

.login-bg {
  width: 100%;
  height: 100%;
  min-width: 800px;
  text-align: center;
  background: url('~assets/images/index.jpg') center center repeat-y;
  background-size: cover;
  // align center vertically;
  display: flex;
  flex-direction: column;
  justify-content: space-around;

  .login-wrapper {
    position: relative;
    margin: 0 auto;
    padding: 40px 32px;
    background: map-get($main, lead);
    border-radius: 4px;
    height: 491px;
    width: 464px;

    .main_tlt {
      font-size: 28px;
      @include f-cybex-style('black', heavy);
      line-height: 1.71;
    }

    .sub_tlt {
      font-size: 14px;
      line-height: 1.71;
      color: map-get($main, white80);

      a {
        @include f-cybex-style(heavy);
        color: map-get($main, grey) !important;
      }
    }

    .login_tlt {
      font-size: 16px;
      line-height: 1.5;
      margin: 47px 0 26px;
      @include f-cybex-style(heavy);
      color: white;
    }

    .login-error {
      font-size: 12px;
      position: absolute;
      color: map-get($main, crimson);
    }

    .login-btn {
      margin-top: 32px;
    }

    .login-account {
      .v-input__control {
        .v-input__icon--prepend-inner {
          border-radius: 50%;
          width: 32px;
          height: 32px;
          margin: 0 12px 0 0 !important;
          background-image: linear-gradient(
            312deg,
            rgba(120, 129, 154, 0.1),
            rgba(map-get($main, grey), 0.3)
          );
        }
      }
    }
  }
}
</style>
