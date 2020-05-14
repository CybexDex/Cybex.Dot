<template>
  <v-layout row wrap class="transfer-form-wrapper">
    <template v-if="assetInfo.withdrawSwitch">
      <v-form ref="form">
        <v-flex xs12 class="form-field">
          <p class="balance d-flex justify-space-between">
            <span class="label">{{ $t('form_label.withdraw_addr') }}</span>
            <span>
              <v-icon size="16" class="mr-2">ic-balance_wallet</v-icon>
              {{ balance | roundDigits(precision) }} {{ coinname }}</span
            >
          </p>
          <v-text-field
            v-model="withdrawAddress"
            solo
            :placeholder="$t('placeholder.enter_address')"
            :error-messages="errors"
            clearable
            append-icon="fa-map-marker-alt"
            @click:clear="errors = ''"
          >
            <!-- <div v-slot:append bottom>
              <v-menu>
                <template v-slot:activator="{ on }">
                  <div class="input-address" v-on="on">
                    <v-icon></v-icon>
                    <span>{{ $t('button.address') }}</span>
                  </div>
                </template>

                <v-list>
                  <v-list-item
                    v-for="(addr, index) in addrs"
                    :key="index"
                    @click="selectAddress(addr)"
                  >
                    <v-list-item-title>{{ addr }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div> -->
          </v-text-field>
        </v-flex>
        <v-flex v-if="needShowMemo" xs12 class="form-field">
          <v-text-field
            v-model="memo"
            no-message
            solo
            clearable
            @input="onMemoChanged"
          >
            <div slot="label" class="fixed-label">
              {{ $t('form_label.memo') }}
              <notice-tip :content="$t('tooltip.memo_notice')" :offset="120" />
            </div>
          </v-text-field>
          <p class="error-msg">
            {{
              !isMemoValid && memoChecked
                ? $t(`validation.invalid_memo_XRP`)
                : ''
            }}
          </p>
        </v-flex>
        <v-flex xs12 class="form-field">
          <v-text-field
            v-model="amount"
            middle
            no-message
            :label="$t('form_label.amount')"
            clearable
            :placeholder="$t('placeholder.min_amount', { minAmount, coinname })"
            solo
            @input="onAmountChanged"
          >
            <div slot="action" class="all-amount" bottom>
              <div @click="withdrawAll">{{ $t('button.all') }}</div>
            </div>
          </v-text-field>
          <p class="error-msg">
            {{ !isAmountValid && amountChecked ? amountErrMsg : '' }}
          </p>
        </v-flex>
        <v-flex xs12 class="show-fee">
          <p>
            <span class="fee-label">{{ $t('form_label.transfer_fee') }}</span>
            <span class="fee-amount"
              >{{ cybexfee.amount | roundDigits(cybexPrecision) }}
              {{ cybexfee.asset_id }}</span
            >
          </p>
          <p class="mb-3">
            <span class="fee-label">{{ $t('form_label.gateway_fee') }}</span>
            <span class="fee-amount"
              >{{ gatewayfee.amount | roundDigits(precision) }}
              {{ gatewayfee.asset_id | shorten }}</span
            >
          </p>
          <p>
            <span class="fee-label large"
              >{{ $t('form_label.receive_amount') }}&nbsp;</span
            >
            <span class="fee-amount large"
              >{{ realAmount | roundDigits(precision) }}
              {{ gatewayfee.asset_id | shorten }}</span
            >
          </p>
        </v-flex>
        <v-flex xs12 class="pt-3">
          <cybex-btn
            middle
            block
            class="text-capitalize"
            :disabled="!canWithdraw"
            @click="onWithdrawClicked"
            >{{ $t('button.withdraw') }}</cybex-btn
          >
        </v-flex>
      </v-form>
      <v-dialog
        v-model="showConfirm"
        content-class="confirm-panel"
        width="402px"
        transition="slide-y-transition"
      >
        <a class="btn-close" icon @click="showConfirm = false">
          <v-icon>ic-close</v-icon>
        </a>
        <v-layout row wrap fluid class="mb-4" align-content-center>
          <v-flex xs12 class="header">{{
            $t('sub_title.confirmation')
          }}</v-flex>
        </v-layout>
        <v-form ref="form" lazy-validation>
          <v-layout row wrap fluid align-content-center class="content">
            <v-flex xs12>
              <span class="left-label"
                >{{ $t('form_label.withdraw_addr') }}:</span
              >
              <p class="confirm-addr">{{ address }}</p>
            </v-flex>
            <v-flex v-if="needShowMemo && memo" xs12>
              <span class="left-label">{{ $t('form_label.memo') }}:</span>
              <span class="confirm-num">&nbsp;{{ memo }}</span>
            </v-flex>
            <v-flex xs12 class="mb-2">
              <span class="left-label">{{ $t('form_label.amount') }}:</span>
              <span class="confirm-num"
                >&nbsp;{{ amount | roundDigits(precision) }}
                {{ coinname }}</span
              >
            </v-flex>
            <v-flex xs12 class="mt-2">
              <span class="left-label">{{
                $t('form_label.transfer_fee')
              }}</span>
              <span class="confirm-num"
                >&nbsp;{{ cybexfee.amount | roundDigits(cybexPrecision) }}
                {{ cybexfee.asset_id }}</span
              >
            </v-flex>
            <v-flex xs12>
              <span class="left-label">{{ $t('form_label.gateway_fee') }}</span>
              <span class="confirm-num"
                >&nbsp;{{ assetInfo.withdrawFee | roundDigits(precision) }}
                {{ gatewayfee.asset_id | shorten }}</span
              >
            </v-flex>
            <v-flex xs12 class="receive-amount mt-3">
              <span class="left-label">{{
                $t('form_label.receive_amount')
              }}</span>
              <span class="confirm-num"
                >&nbsp;{{ realAmount | roundDigits(precision) }}
                {{ coinname }}</span
              >
            </v-flex>
            <v-flex xs12 class="footer mt-4">
              <cybex-btn
                small
                block
                class="text-capitalize"
                :disabled="inSendTx"
                @click="sendTx"
                >{{ $t('button.ok') }}</cybex-btn
              >
            </v-flex>
          </v-layout>
        </v-form>
      </v-dialog>
    </template>
    <p v-else class="forbid-info">
      {{ assetInfo ? assetInfo[`${localeShort}Msg`] : '' }}
    </p>
  </v-layout>
</template>

<script>
import { mapGetters } from 'vuex'
import { debounce } from 'lodash'
import utils from '~/components/mixins/utils'
import { verifyAddress } from '~/lib/gateway-client'
import CybexDotClient from '~/lib/CybexDotClient.js'

export default {
  components: {
    NoticeTip: () => import('~/components/NoticeTip.vue')
  },
  mixins: [utils],

  asyncData({ params, store }) {
    return {
      cointype: params.cointype || '',
      isAddressValid: false,
      address: ''
    }
  },
  layout: 'transfer',

  data() {
    return {
      showConfirm: false,
      amount: null,
      cybexfee: {},
      realAmount: 0,
      gatewayfee: {},
      withdrawAmount: 0,
      balance: 0,
      // minAmount: 0,
      addrs: [],
      addressChecked: false,
      readyToSend: false,
      amountChecked: false,
      inSendTx: false,
      amountErrMsg: null,
      memo: '',
      memoChecked: false,
      precision: 0,
      cybexPrecision: 0,
      isMemoValid: false,
      errors: '',
      withdrawAddress: null
    }
  },
  computed: {
    ...mapGetters({
      username: 'auth/username',
      accountId: 'auth/address',
      assetConfig: 'gateway/assetConfigBySymbol',

      islocked: 'auth/islocked',
      showUnlock: 'showUnlock',
      localeShort: 'i18n/shortcut'
    }),
    canWithdraw() {
      return (
        this.addressChecked &&
        this.isAddressValid &&
        this.withdrawAddress &&
        this.amountChecked &&
        this.isAmountValid &&
        (!this.memo || this.memoChecked)
      )
    },
    minAmount() {
      return parseFloat(this.assetInfo.minWithdraw)
    },
    isAmountValid() {
      return this.amount >= this.minAmount && this.amount <= this.balance
    },
    needShowMemo() {
      return this.assetInfo.useMemo
    },
    finalAddress() {
      return this.needShowMemo
        ? `${this.withdrawAddress}[${this.memo}]`
        : this.withdrawAddress
    },
    assetInfo() {
      return this.assetConfig[this.cointype] || {}
    },
    coinname() {
      return this.assetInfo.name
    }
  },
  watch: {
    withdrawAddress(v) {
      if (v && v.length > 0) {
        this.onAddressChanged()
      } else {
        this.errors = ''
      }
    },
    async username(val) {
      if (!val) return
      this.withdrawAddress = ''
      // this.showConfirm = false;
      this.resetFee()
      // await this.checkEnable();
      this.fetchBalance(this.cointype)
      // await this.fetchMinAmount(this.cointype);
      await this.calFee(0, this.cointype)
    },
    showUnlock(newval, oldval) {
      if (!newval) {
        if (this.readyToSend && !this.islocked) {
          this.showConfirm = true
        }
        this.readyToSend = false
      }
    },
    $route(route) {
      // await this.checkEnable();
      this.fetchBalance(route.params.cointype)
      // await this.fetchMinAmount(route.params.cointype);
    },
    async cointype(cointype) {
      await this.calFee(0, cointype)
    }
  },
  async mounted() {
    // await this.checkEnable();
    this.fetchBalance(this.cointype)
    // await this.fetchMinAmount(this.cointype);
    await this.calFee(0, this.cointype)
  },
  methods: {
    onAddressChanged: debounce(function() {
      this.addressChecked = false
      this.validateAddress()
    }, 300),
    onAmountChanged: debounce(function() {
      this.amountChecked = false
      this.validateFee()
    }, 350),
    onMemoChanged: debounce(function() {
      this.memoChecked = false
      this.validateMemo()
    }, 300),
    onWithdrawClicked() {
      if (!this.islocked) {
        this.showConfirm = true
      } else {
        this.readyToSend = true
        this.$toggleLock(true)
      }
    },
    resetFee() {
      this.amount = null
      this.gatewayfee = {}
      this.cybexfee = {}
      this.memo = null
      this.realAmount = 0
      this.withdrawAmount = 0
      this.memoChecked = false
      this.amountChecked = false
      this.addressChecked = false
      this.inSendTx = false
    },
    async validateFee() {
      const value = parseFloat(this.amount)
      this.amountChecked = false
      if (isNaN(value) || (!value && value !== 0)) {
        this.amount = null
      } else {
        const newval = this.toNonExponential(this.amount, this.precision)
        const valstr = (newval.match(/^\d+(\.\d+)?/g) || [])[0]
        const idx = newval.indexOf('.')
        const formatted =
          idx > 0
            ? [
                valstr.slice(0, idx),
                valstr.slice(idx + 1, idx + 1 + this.precision)
              ].join('.')
            : value
        if (/^\d+\.$/g.test(valstr)) {
          this.amount = newval
        } else {
          this.amount = formatted
          this.amountChecked = true
          if (value < this.minAmount) {
            this.realAmount = 0
            this.amountErrMsg = this.$t('validation.too_low_amount', {
              cointype: this.coinname,
              minAmount: this.minAmount
            })
          } else if (value > this.balance) {
            this.realAmount = 0
            this.amountErrMsg = this.$t('validation.too_high_amount')
          } else {
            await this.calFee(this.amount, this.cointype)
          }
        }
      }
    },
    calFee(amount, cointype) {
      this.realAmount = amount

      this.precision = this.assetInfo.precision
      this.withdrawAmount = amount * 10 ** this.assetInfo.precision
    },
    async validateMemo() {
      this.memo = this.memo.trim()
      if (this.coinname === 'XRP') {
        if (this.memo && !isNaN(this.memo)) {
          this.memo = parseInt(this.memo)
        }
        this.isMemoValid =
          !this.memo || (!isNaN(this.memo) && this.memo <= 4294967295)
      } else {
        this.isMemoValid = true
      }
      this.memoChecked = true
      await this.calFee(this.amount, this.cointype)
    },
    async fetchBalance(cointype) {
      try {
        const balance = await CybexDotClient.getBalance(
          this.assetInfo.cybid,
          this.accountId
        )
        this.precision = this.assetInfo.precision
        this.balance = balance
          ? balance.freeBalance / 10 ** this.assetInfo.precision
          : null
      } catch (e) {
        // console.log('some error when fetch balance')
      }
    },
    async validateAddress() {
      this.addressChecked = false
      try {
        const result = await verifyAddress(
          this.assetInfo.name,
          this.withdrawAddress
        )

        this.isAddressValid = result.valid
      } catch (e) {
        this.isAddressValid = false
      }
      this.addressChecked = true

      this.errors =
        this.withdrawAddress && !this.isAddressValid && this.addressChecked
          ? this.$t('validation.invalid_address', { cointype: this.coinname })
          : ''
    },
    async sendTx() {
      try {
        this.inSendTx = true
        const memo = `${this.assetInfo.withdrawPrefix}:${this.finalAddress}`

        const ret = await CybexDotClient.transfer(
          this.assetInfo.cybid,
          this.assetInfo.gatewayAccount,
          this.withdrawAmount,
          memo
        )

        // console.log('==== send tx result: ', ret, this.finalAddress)
        if (ret) {
          this.$message({
            message: this.$t('message.withdraw_succ')
          })
          this.$nextTick(async () => {
            this.showConfirm = false
            this.withdrawAddress = ''
            this.resetFee()
            await this.fetchBalance(this.cointype)
            // this.inSendTx = false;
          })
        }
      } catch (e) {
        // console.log(e)
      }
      this.inSendTx = false
    },
    async fetchNotice() {},
    checkAmount(value) {
      return this.$t('validation.not_enough_balance', {
        cointype: this.cointype
      })
    },
    async withdrawAll() {
      // 全部金额提现
      this.amount = this.balance.toString()
      await this.validateFee()
    }
  },

  head() {
    return {
      title: this.$t('title.withdraw')
    }
  }
}
</script>

<style lang="scss">
@import '~assets/style/_fonts/_font_mixin';
@import '~assets/style/_vars/_colors';

.v-messages__message {
  line-height: normal !important;
}
.theme--dark.v-text-field:hover > .v-input__control > .v-input__slot,
.theme--dark.v-text-field.v-input--is-focused
  > .v-input__control
  > .v-input__slot {
  background-color: #293246 !important;
}

.v-form .label {
  @include f-cybex-style(heavy);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.v-form .balance {
  @include f-cybex-style(heavy);
  font-size: 14px;
  color: #78819a;
  line-height: 14px;
}

.confirm-panel {
  // width: 402px;
  // height: 367px;
  padding: 32px;
  border-radius: 4px;
  // box-shadow: 0 8px 10px 0 rgba(0, 0, 0, 0.2), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 16px 24px 2px rgba(0, 0, 0, 0.14);
  background-color: #212939;
  line-height: 1.83;
  overflow-y: hidden;

  .header {
    font-size: 18px;
    @include f-cybex-style('black', medium);
  }

  .receive-amount {
    box-shadow: inset 0 -1px 0 0 rgba(255, 255, 255, 0.08),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.08);
    height: 40px;
    line-height: 40px;
  }

  .left-label {
    font-size: 12px;
    color: rgba(map-get($main, white), 0.4);
  }

  .confirm-num {
    font-size: 12px;
    line-height: 1.83;
    color: rgba(map-get($main, white), 0.8);
    margin-bottom: initial;
    word-break: break-word;
    @include f-cybex-style(heavy);
  }

  .confirm-addr {
    font-size: 12px;
    color: rgba(map-get($main, white), 0.8);
  }

  .cl-6 {
    margin-top: 20px;
  }
}
</style>
