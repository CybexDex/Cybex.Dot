<template>
  <v-layout row wrap class="transfer-form-wrapper">
    <template>
      <v-form ref="form">
        <v-flex xs12 class="form-field">
          <v-text-field
            v-model="account"
            :label="$t('form_label.transfer_account')"
            no-message
            :placeholder="$t('placeholder.enter_to')"
            class="field-addr mt-1"
            :append-label="accountId"
            clearable
            solo
            middle
            dark
            dense
            @input="onAccountChanged"
          />
          <p class="error-msg ml-1">
            {{
              !isAccountValid && accountChecked
                ? $t(`validation.${accountErr}`)
                : ''
            }}
          </p>
        </v-flex>
        <v-flex xs12 class="form-field">
          <!-- <span class="form-label">{{  }}</span> -->
          <!-- <span class="balance"><v-icon class="mr-2">ic-wallet_address</v-icon>{{ balance | roundDigits(precision) }} {{ cointype }}</span> -->
          <v-text-field
            v-model="amount"
            :label="$t('form_label.amount')"
            clearable
            middle
            no-message
            solo
            dark
            dense
            @input="onAmountChanged"
          >
            <template v-slot:append-label>
              <v-icon class="mr-2" size="16">ic-wallet_address</v-icon>
              {{ balance | roundDigits(precision) }}
              <asset-pairs :asset-id="cointype" />
            </template>
            <template v-slot:action>
              <div @click="transferAll">{{ $t('button.all') }}</div>
            </template>
          </v-text-field>
          <p class="error-msg">
            {{
              !isAmountValid &&
              amountChecked &&
              amount &&
              parseFloat(amount) > 0
                ? $t('validation.not_enough_balance')
                : ''
            }}
          </p>
        </v-flex>
        <v-flex xs12 class="form-field">
          <span class="form-label">{{ $t('form_label.memo') }}</span>
          <v-textarea
            v-model="memo"
            class="field-memo mt-2"
            no-message
            no-resize
            :rows="3"
            solo
            @input="onMemoChanged"
          />
        </v-flex>
        <v-flex xs12 class="show-fee">
          <p>
            <span class="fee-label">{{ $t('form_label.transfer_fee') }}</span>
            <span class="fee-amount"
              >{{ cybexfee.amount | roundDigits(cybexPrecision) }}
              {{ cybexfee.asset_id }}</span
            >
          </p>
        </v-flex>
        <v-flex xs12 class="mt-2">
          <cybex-btn
            block
            middle
            :disabled="!canTransfer"
            @click="onWithdrawClicked"
            >{{ $t('button.send') }}</cybex-btn
          >
        </v-flex>
      </v-form>
      <v-dialog
        v-model="showConfirm"
        content-class="confirm-panel-transfer"
        width="402px"
        transition="slide-y-transition"
      >
        <a class="btn-close" icon @click="showConfirm = false">
          <v-icon>ic-close</v-icon>
        </a>
        <v-layout row wrap fluid class="mb-4" align-content-center>
          <v-flex xs12 class="header">{{
            $t('sub_title.transfer_detail')
          }}</v-flex>
        </v-layout>
        <v-form ref="form" lazy-validation>
          <v-layout row wrap fluid align-content-center class="content">
            <v-flex class="mb-2" xs12>
              <span class="left-label"
                >{{ $t('form_label.transfer_account') }}:</span
              >
              <span class="confirm-num">&nbsp;{{ account }}</span>
            </v-flex>
            <v-flex xs12 class="mb-2">
              <span class="left-label">{{ $t('form_label.amount') }}:</span>
              <span class="confirm-num"
                >&nbsp;{{ amount | roundDigits(precision) }}
                {{ coinname }}</span
              >
            </v-flex>
            <v-flex xs12 class="mb-2">
              <span class="left-label">{{
                $t('form_label.transfer_fee')
              }}</span>
              <span class="confirm-num"
                >&nbsp;{{ cybexfee.amount | roundDigits(cybexPrecision) }}
                {{ cybexfee.asset_id }}</span
              >
            </v-flex>
            <v-flex v-if="!!memo && memo !== 0" xs12>
              <span class="left-label">{{ $t('form_label.memo') }}:</span>
              <div class="confirm-addr">
                <perfect-scrollbar :options="{ wheelPropogation: false }">
                  <p>{{ memo }}</p>
                </perfect-scrollbar>
              </div>
            </v-flex>
            <v-flex xs12 class="footer mt-4">
              <cybex-btn small block :disabled="inSendTx" @click="sendTx">{{
                $t('button.send')
              }}</cybex-btn>
            </v-flex>
          </v-layout>
        </v-form>
      </v-dialog>
    </template>
  </v-layout>
</template>

<script>
import { mapGetters } from 'vuex'
import { debounce } from 'lodash'
import utils from '~/components/mixins/utils'

export default {
  layout: 'transfer',
  components: {},
  mixins: [utils],
  asyncData({ params, store }) {
    return {
      cointype: params.cointype || '',
      isAccountValid: false
    }
  },
  data() {
    return {
      account: '',
      accountId: '',
      showConfirm: false,
      amount: null,
      cybexfee: {},
      balance: 0,
      minAmount: 0,
      addrs: [],
      accountChecked: false,
      readyToSend: false,
      amountChecked: false,
      inSendTx: false,
      // amountErrMsg: null,
      memo: '',
      precision: 0,
      cybexPrecision: 0,
      accountErr: ''
    }
  },

  computed: {
    ...mapGetters({
      username: 'auth/username',
      islocked: 'auth/islocked',
      showUnlock: 'showUnlock'
    }),
    canTransfer() {
      return (
        this.accountChecked &&
        this.isAccountValid &&
        this.account &&
        this.amountChecked &&
        this.isAmountValid
      )
    },
    isAmountValid() {
      return (
        parseFloat(this.amount) <= this.balance &&
        parseFloat(this.amount) > 0 &&
        this.cybexfee.amount &&
        (this.cybexfee.asset_id !== this.coinsInvert[this.cointype] ||
          parseFloat(
            (parseFloat(this.amount) + this.cybexfee.amount).toFixed(
              this.precision
            )
          ) <= this.balance)
      )
    },

    coinname() {
      return this.$options.filters.shorten(this.cointype)
    }
  },
  watch: {
    username(val) {
      if (!val) {
        return
      }
      this.account = ''
      this.resetFee()
      this.fetchBalance(this.cointype)
      if (!this.islocked) {
      }
      this.$nextTick(() => {
        if (this.memokey !== 'empty') {
          // PerfectScrollbar('.field-memo textarea')
        }
        if (this.account) {
          this.validateAccount()
        }
      })
    },
    showUnlock(newval, oldval) {
      if (!newval) {
        if (!this.islocked) {
          if (!this.memokey) {
          }
          if (this.readyToSend) {
            if (this.memokey === 'empty') {
              this.memo = null
              this.$message({
                message: this.$t('info.invalid_memokey'),
                type: 'error'
              })
            } else {
              this.showConfirm = true
            }
          }
        }
        this.readyToSend = false
      }
    },
    islocked(newval) {
      if (!newval && !this.memokey) {
      }
    },
    account(newval) {
      this.accountId = ''
    },
    $route(route) {
      this.cointype = route.params.cointype
      this.fetchBalance(route.params.cointype)
      this.$nextTick(() => {
        if (this.account) {
          this.validateAccount()
        }
      })
    }
  },
  mounted() {
    this.fetchBalance(this.cointype)
    if (!this.islocked) {
    }
    this.$nextTick(() => {
      if (this.memokey !== 'empty') {
        // PerfectScrollbar('.field-memo textarea')
      }
      if (this.account) {
        this.validateAccount()
      }
    })
  },
  methods: {
    onAccountChanged: debounce(function() {
      this.accountChecked = false
      this.validateAccount()
    }, 1000),
    onAmountChanged: debounce(function() {
      this.validateAmount()
    }, 1000),
    onMemoChanged: debounce(function() {
      this.validateMemo()
    }, 1000),
    onWithdrawClicked() {
      if (!this.islocked) {
        this.showConfirm = true
      } else {
        this.readyToSend = true
        this.$toggleLock()
      }
    },
    resetFee() {
      this.amount = null
      this.cybexfee = {}
      this.memo = null
      this.amountChecked = false
      this.accountChecked = false
      this.isAccountValid = false
    },
    async validateAmount() {
      const value = parseFloat(this.amount)
      this.amountChecked = false
      if (isNaN(value) || (!value && value !== 0)) {
        this.amount = null
      } else {
        const formatted = this.toNonExponential(this.amount, this.precision)
        if (/^\d+\.$/g.test(this.amount)) {
          // do nothing
        } else {
          this.amount = formatted
          this.amountChecked = true
          if (value > this.balance) {
            // this.realAmount = 0
            // this.amountErrMsg = this.$t('validation.not_enough_balance')
          } else {
            await this.calFee(this.amount, this.cointype)
          }
        }
      }
    },
    calFee(amount, cointype) {
      this.amountChecked = false
      try {
      } catch (e) {
        // console.log('some error when calfee', e)
      }
    },
    validateMemo() {
      this.memo = this.memo.trim()
      this.calFee()
    },
    fetchBalance(cointype) {
      try {
      } catch (e) {
        // console.log('some error when fetch balance')
      }
    },
    validateAccount() {
      this.accountChecked = false
      try {
        if (this.account) {
          if (this.account === this.username) {
            this.accountErr = 'account_not_self'
            this.isAccountValid = false
          } else {
            const accountInfo = null
            if (accountInfo) {
              this.isAccountValid = true
              this.accountId = `#${(accountInfo || { account: {} }).account.id}`
            } else {
              this.isAccountValid = false
              this.accountErr = 'account_not_found'
            }
          }
        } else {
          this.isAccountValid = false
          this.accountErr = 'account_required'
        }
        this.accountChecked = true
      } catch (e) {
        this.isAccountValid = false
        this.accountChecked = true
        this.accountErr = 'account_not_found'
      }
    },
    sendTx() {
      this.inSendTx = true
      const res = null
      if (res) {
        this.$message({
          message: this.$t('message.transfer_succ')
        })
        this.$nextTick(async () => {
          this.showConfirm = false
          this.resetFee()
          await this.validateAccount()
          await this.fetchBalance(this.cointype)
          this.inSendTx = false
        })
      } else {
        this.inSendTx = false
      }
    },
    checkAmount(value) {
      return this.$t('validation.not_enough_balance', {
        cointype: this.coinname
      })
    },
    transferAll() {
      // 全部金额提现
      if (
        this.cybexfee.asset_id === this.coinsInvert[this.cointype] &&
        this.cybexfee.amount
      ) {
        this.amount = (this.balance - this.cybexfee.amount).toString()
      } else {
        this.amount = this.balance.toString()
      }
      this.validateAmount()
    }
  },

  head() {
    return {
      title: this.$t('title.transfer')
    }
  }
}
</script>

<style lang="scss">
@import '~assets/style/_fonts/_font_mixin';
@import '~assets/style/_vars/_colors';

.confirm-panel-transfer {
  // width: 402px;
  // height: 367px;
  padding: 32px 32px;
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
    @include f-cybex-style(medium);
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
    height: 48px;
    overflow-y: hidden;

    .ps {
      background-color: initial;
    }

    p {
      font-size: 12px;
      color: white;
      word-break: break-all;
      @include f-cybex-style(medium);
    }
  }

  .cl-6 {
    margin-top: 20px;
  }

  .v-btn.btn-ok {
    padding: 0;
    margin: 0;
    height: 32px;
    width: 100%;
    background-image: linear-gradient(95deg, #ffc478, #ff9143);
    opacity: initial;
  }
}
</style>
