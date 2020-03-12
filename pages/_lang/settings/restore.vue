<template>
  <div class="content-container-inner">
    <div class="page-head-title">{{ $t('wallet.restore_wallet') }}</div>
    <v-flex class="setting-desc">{{
      restoreByPhrase
        ? $t('wallet.restore_desc_phrase')
        : $t('wallet.restore_desc_key')
    }}</v-flex>

    <v-form
      ref="form"
      v-model="formIsValid"
      @submit.prevent
      @submit="createNewWallet"
    >
      <div class="select-label">{{ $t('wallet.phrase') }}</div>

      <v-textarea
        v-model="restoreObj"
        filled
        dark
        background-color="#212939"
        class="restore-ctrl"
        large
        :rows="3"
        no-resize
        multi-text
        :placeholder="
          $t('placeholder.enter_field', {
            field: restoreByPhrase ? $t('wallet.phrase') : $t('wallet.key')
          })
        "
        :error-messages="invalidRestoreObjMessages"
        @blur="validateRestoreObj"
      />
      <v-text-field
        v-model="name"
        class="restore-ctrl"
        filled
        dark
        background-color="#212939"
        large
        prepend-inner-icon="ic-avatar"
        required
        clearable
        :placeholder="$t('placeholder.enter_account')"
        :label="$t('form_label.account_name')"
        :rules="nameRules"
      />
      <v-text-field
        v-model="password"
        filled
        dark
        background-color="#212939"
        large
        class="restore-ctrl"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="ic-lock_outline"
        :append-icon="showPassword ? 'ic-visibility_off' : 'ic-visibility_on'"
        :label="$t('form_label.restore-password')"
        :placeholder="$t('placeholder.create_password')"
        :rules="passwordRules"
        @click:append="showPassword = !showPassword"
      />
      <v-text-field
        v-model="confirmPassword"
        filled
        dark
        background-color="#212939"
        large
        class="restore-ctrl"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="ic-lock_outline"
        :append-icon="showPassword ? 'ic-visibility_off' : 'ic-visibility_on'"
        :label="$t('form_label.restore-password-repeat')"
        :placeholder="$t('placeholder.enter_pwdrepeat')"
        :rules="repeatPasswordRules"
        @click:append="showPassword = !showPassword"
      />
      <cybex-btn type="submit" large :disabled="!couldCreateWallet" major>{{
        $t('button.create-wallet')
      }}</cybex-btn>
    </v-form>
  </div>
</template>

<script>
import { mnemonicValidate } from '@polkadot/util-crypto'
import userValid from '~/components/mixins/user-valid.js'

const RESTORE_METHOD_PHRASE = 0
const RESTORE_METHOD_KEY = 1
export default {
  components: {},
  mixins: [userValid],

  data() {
    return {
      // form字段
      formIsValid: false,
      password: '',
      name: '',
      isAccountValid: true,

      confirmPassword: '',
      restoreObj: '',
      showPassword: false,
      showSuccessPage: false,
      restoreMethodCtrl: RESTORE_METHOD_PHRASE,
      restoreMethodItems: [
        { value: RESTORE_METHOD_PHRASE, text: this.$t('wallet.phrase') },
        { value: RESTORE_METHOD_KEY, text: this.$t('wallet.key') }
      ],
      nameRules: [
        (value) =>
          !this.isAccountValid ||
          !!value ||
          this.$t('validation.account_required')
      ],
      // 验证规则
      passwordRules: [
        (value) => !!value || this.$t('validation.pwd_required'),
        (value) =>
          this.checkPasswordLength(value, 8) ||
          this.$t('validation.pwd_too_short', { len: 8 }),
        (value) =>
          this.checkPasswordComplexSimpler(value) ||
          this.$t('validation.pwd_number_simple'),
        (value) =>
          this.checkPasswordInvalid(value) || this.$t('validation.pwd_wrong')
      ],
      repeatPasswordRules: [
        (value) => !!value || this.$t('validation.pwd_repeat'),
        (value) =>
          (!!value && value === this.password) ||
          this.$t('validation.pwd_unmatched')
      ],
      invalidRestoreObjMessages: []
    }
  },
  computed: {
    // 恢复模式是否是助记词
    restoreByPhrase() {
      return this.restoreMethodCtrl === RESTORE_METHOD_PHRASE
    },
    // 根据恢复模式显示助记词/私钥
    restoreObjField() {
      return this.restoreByPhrase
        ? this.$t('wallet.phrase')
        : this.$t('wallet.key')
    },
    // 是否能够创建钱包文件
    couldCreateWallet() {
      return this.formIsValid
    }
  },
  watch: {
    // 切换模式时候重新验证表单
    restoreMethodCtrl(val) {
      this.$nextTick(() => {
        this.invalidRestoreObjMessages = []
        this.$refs.form.resetValidation()
      })
    },
    password(val) {
      if (val) {
        // rawlog('confirmPassword == val?', this.confirmPassword === val);
        this.$refs.form.validate()
      }
    }
  },

  methods: {
    validateRestoreObj(ev) {
      const val = ev.target.value
      const checkValid = mnemonicValidate(val)

      if (!val) {
        this.formIsValid = false
        this.invalidRestoreObjMessages = [
          this.$t('validation.field_required', { field: this.restoreObjField })
        ]
      } else if (!checkValid) {
        this.formIsValid = false
        this.invalidRestoreObjMessages = [
          this.$t('validation.field_invalid', { field: this.restoreObjField })
        ]
      } else {
        this.invalidRestoreObjMessages = []
      }
    },
    async createNewWallet() {
      if (!this.formIsValid) {
        return
      }
      try {
        const result = await this.$store.dispatch('auth/register', {
          username: this.name,
          password: this.password,
          mnemonic: this.restoreObj
        })
        if (result) {
          console.log(
            'redirect to ',
            this.$i18n.path('/settings/success/restore')
          )
          this.$router.push(this.$i18n.path('/settings/success/restore'))
        }
      } catch (e) {
        this.formIsValid = false
        const errmsg = e.msg
          ? e.msg
              .split('.')
              .slice(1)
              .join('_')
          : e.message
        this.invalidRestoreObjMessages = [this.$t('error.' + errmsg)]
      }
    }
  },
  head() {
    return {
      title: this.$t('title.restore')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~assets/style/_vars/_colors';
@import '~assets/style/_vars/_colors';

.theme--dark.v-label {
  @include f-cybex-style(medium);
  color: rgba(map-get($main, grey), 0.5);
  font-size: 14px !important;
}

.page-head-title {
  margin-bottom: 10px;
}

.setting-desc {
  padding-bottom: 32px;
}

.choose-method {
  max-width: 194px;
}

.restore-ctrl {
  max-width: 455px;
}
</style>
