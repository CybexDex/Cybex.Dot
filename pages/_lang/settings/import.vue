<template>
  <div class="content-container-inner">
    <div class="page-head-title">{{ $t('sub_title.import_wallet') }}</div>
    <div class="setting-desc">{{ $t('info.import_wallet') }}</div>
    <v-form
      ref="form"
      v-model="isValid"
      @submit.prevent
      @submit="importPrivateKeyIntoWallet"
    >
      <v-text-field
        v-model="privateKey"
        filled
        dark
        background-color="#212939"
        large
        class="import-key-input"
        :label="$t('wallet.key')"
        :placeholder="
          $t('placeholder.enter_field', { field: $t('wallet.key') })
        "
        :rules="[rules.requiredKey]"
      />
      <v-text-field
        v-model="walletPass"
        large
        solo
        class="import-key-pass"
        :label="$t('form_label.password')"
        :type="showPassword ? 'text' : 'password'"
        :append-icon="showPassword ? 'ic-visibility_off' : 'ic-visibility_on'"
        :placeholder="
          $t('placeholder.enter_field', { field: $t('form_label.password') })
        "
        :rules="[rules.requiredPass]"
        :error-messages="invalidMessage"
        @click:append="showPassword = !showPassword"
      />
      <cybex-btn type="submit" :disabled="!couldSubmit" large major>{{
        $t('button.submit')
      }}</cybex-btn>
    </v-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      rules: {
        requiredKey: (value) =>
          !!value ||
          this.$t('validation.field_required', {
            field: this.$t('wallet.key')
          }),
        requiredPass: (value) =>
          !!value ||
          this.$t('validation.field_required', {
            field: this.$t('form_label.password')
          })
      },
      isValid: false, // 字段是否合法
      isCheckingKey: false, // 是否在校验key的准确性
      walletPass: '',
      privateKey: '',
      invalidMessage: [],
      showPassword: false
    }
  },
  computed: {
    ...mapGetters({
      username: 'auth/username'
    }),
    couldSubmit() {
      return this.isValid && !this.isCheckingKey
    }
  },

  watch: {
    // 校验private key值是否符合规则
    async privateKey(val) {
      this.$refs.form.resetValidation()
      this.isCheckingKey = true
      await this.checkKeyIsValid(val)
        .then((res) => {
          // console.log('result', res);
          this.howToCheck = true
          this.invalidMessage = []
        })
        .catch((e) => {
          this.howToCheck = false
          this.invalidMessage = [e.message]
        })
        .finally(() => {
          this.isCheckingKey = false
        })
    },
    walletPass(val) {
      this.resetForm()
    }
  },
  mounted() {},
  methods: {
    resetForm() {
      this.invalidMessage = []
      this.$refs.form.resetValidation()
      this.isCheckingKey = false
    },
    timeout(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },
    checkKeyIsValid(value) {
      return new Promise((resolve, reject) => {
        let checkResult = false
        this.timeout(500)
          .then((v) => {
            checkResult = true
            if (checkResult) {
              resolve(value)
            } else {
              reject(
                new Error(
                  this.$t('validation.field_invalid', {
                    field: this.$t('wallet.key')
                  })
                )
              )
            }
          })
          .catch(reject)
        // TODO: how to check
      })
    },
    importPrivateKeyIntoWallet() {
      this.$eventHandle(
        () => {
          return this.$store.dispatch('auth/importPrivateKey', {
            password: this.walletPass,
            key: this.privateKey
          })
          // TODO 导入
        },
        [],
        { user: false }
      )
        .then((res) => {
          this.$router.push(this.$i18n.path('/settings/success/import'))
        })
        .catch((e) => {
          const errmsg = e.msg
            ? e.msg
                .split('.')
                .slice(1)
                .join('_')
            : e.message
          this.invalidMessage = [this.$t('error.' + errmsg)]
        })
    }
  },
  head() {
    return {
      title: this.$t('title.import')
    }
  }
}
</script>

<style lang="scss" scoped>
.setting-desc {
  padding: 16px 0 30px;
}
.theme--dark.v-label {
  @include f-cybex-style(medium);
  color: rgba(map-get($main, grey), 0.5);
  font-size: 14px !important;
}
</style>
