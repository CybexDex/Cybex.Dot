<template>
  <v-flex class="login-bg"> </v-flex>
</template>

<script>
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
  watch: {},

  mounted() {
    window.jumpTo = this.$i18n.jumpTo
  },
  head() {
    return {
      title: this.$t('title.login')
    }
  }
}
</script>
