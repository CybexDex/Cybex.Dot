<template>
  <div>
    <!-- form -->
    <v-form
      ref="form"
      v-model="valid"
      class="cybex exchange fill-height exchange-block-container"
      lazy-validation
    >
      <!-- balances -->
      <v-flex justify-space-between d-flex class="exchange-block-title">
        <v-flex d-flex grow class="keep-inline b-half">
          {{
            isBuy
              ? $t('exchange.order-form.title.buy')
              : $t('exchange.order-form.title.sell')
          }}
          &nbsp;
          <asset-pairs
            :max-width="'calc(100% - 30px)'"
            :asset-id="quoteCurrency"
          />
        </v-flex>
        <v-flex class="text-lg-right money keep-inline">
          <v-icon size="16" v-text="'ic-balance_wallet'" />
          <span v-if="hideBalance">--</span>
          <span v-else>
            <span v-if="balances" v-text="balances" />
          </span>
          <span class="unit">
            <asset-pairs
              :max-width="'45%'"
              :asset-id="isBuy ? baseCurrency : quoteCurrency"
            />
          </span>
        </v-flex>
      </v-flex>
      <!-- price -->
      <v-layout row>
        <label class="exchange-form-input-label"
          >{{ $t('exchange.order-form.label.price') }}:</label
        >
        <v-layout d-flex column>
          <div class="exchange-form-input-wrapper">
            <input
              ref="priceInput"
              v-model="price"
              :class="{ 'has-error': priceError != '' }"
              type="number"
              :placeholder="1"
              class="d-flex exchange-form-input theme--cybex-dark"
              :step="1"
              @keypress="validUserKeypress($event)"
              @input="validUserInput('price', $event)"
            />
            <span class="exchange-form-input-suffix">
              <asset-pairs
                :color-opacity="0.5"
                :max-width="'60px'"
                :asset-id="baseCurrency"
              />
            </span>
            <span v-if="priceError" class="exchange-form-input-error">{{
              priceError
            }}</span>
          </div>
          <span class="legal-tender c-white-30">
            <template v-if="legalPrice">
              ≈
              <span v-text="legalPrice" />
            </template>
          </span>
        </v-layout>
      </v-layout>
      <!-- amount -->
      <v-layout row>
        <label class="exchange-form-input-label"
          >{{ $t('exchange.order-form.label.amount') }}:</label
        >
        <v-layout d-flex column>
          <div class="exchange-form-input-wrapper">
            <input
              ref="amountInput"
              v-model="amount"
              :class="{ 'has-error': amountError != '' }"
              type="number"
              :placeholder="1"
              class="d-flex exchange-form-input"
              :step="1"
              @keypress="validUserKeypress($event)"
              @input="validUserInput('amount', $event)"
            />
            <span class="exchange-form-input-suffix">
              <asset-pairs
                :color-opacity="0.5"
                :max-width="'60px'"
                :asset-id="quoteCurrency"
              />
            </span>
            <span v-if="amountError" class="exchange-form-input-error">{{
              amountError
            }}</span>
          </div>
          <span class="legal-tender c-white-30"> </span>
          <!-- <v-flex d-flex justify-space-between class="flex-label amount">
            <span
              v-for="(pos, i) in tradingPosition"
              :key="i"
              :class="{ selected: pos.selected }"
              @click="calcTradingPosition(pos.val)"
              >{{ pos.val * 100 }}%</span
            >
          </v-flex> -->
        </v-layout>
      </v-layout>
      <!-- total -->
      <v-layout row>
        <label class="exchange-form-input-label"
          >{{ $t('exchange.order-form.label.total') }}:</label
        >
        <v-flex>
          <div class="exchange-form-input-wrapper">
            <input
              ref="totalInput"
              v-model="total"
              :class="{ 'has-error': totalError != '' }"
              type="number"
              :placeholder="1"
              :step="1"
              class="d-flex exchange-form-input"
              @keypress="validUserKeypress($event)"
              @input="validUserInput('total', $event)"
            />
            <span class="exchange-form-input-suffix">
              <asset-pairs
                :color-opacity="0.5"
                :max-width="'60px'"
                :asset-id="baseCurrency"
              />
            </span>
            <span v-if="totalError" class="exchange-form-input-error">{{
              totalError
            }}</span>
          </div>
        </v-flex>
      </v-layout>
      <div v-if="!username" class="no-login">
        <router-link :to="$i18n.path('/')">{{
          $t('exchange.order-form.button.login')
        }}</router-link>
        {{ $t('exchange.order-form.button.or') }}
        <router-link :to="$i18n.path('/register')">{{
          $t('exchange.order-form.button.register')
        }}</router-link>
        {{ $t('exchange.order-form.button.to-trade') }}
      </div>
      <template v-else>
        <!-- fee -->
        <v-layout class="fee">
          <span class="label mr-2"
            >{{ $t('exchange.order-form.label.fee') }}:</span
          >
          <span v-if="fee.length === 0" class="money" v-text="'--'" />
          <span v-for="(f, i) in fee" v-else :key="i" class="money">
            {{ f.amount }}
            <span class="unit">
              <asset-pairs :asset-id="f.asse" />
            </span>
          </span>
          <v-tooltip
            right
            top
            :nudge-right="100"
            :nudge-top="8"
            :content-class="'cybex-tips'"
          >
            <template v-slot:activator="{ on }">
              <span class="ml-1 desc ic-help" v-on="on" />
            </template>
            <span>{{ $t('exchange.order-form.fee-desc') }}</span>
          </v-tooltip>
        </v-layout>
        <!-- order button or login panel-->
        <cybex-btn
          v-if="couldCreateTrade && !isCreatingTrade"
          normal
          block
          :class="{ 'is-buy': isBuy }"
          @click="beforeCreateTrade"
        >
          <div>
            {{
              isBuy
                ? $t('exchange.order-form.title.buy')
                : $t('exchange.order-form.title.sell')
            }}
          </div>
          <asset-pairs :asset-id="quoteCurrency" />
        </cybex-btn>
        <cybex-btn
          v-else
          normal
          block
          :class="{ 'is-buy': isBuy }"
          :disabled="true"
        >
          {{
            isBuy
              ? $t('exchange.order-form.title.buy')
              : $t('exchange.order-form.title.sell')
          }}
          <asset-pairs :asset-id="quoteCurrency" />
        </cybex-btn>
      </template>
    </v-form>
    <!-- form end -->
    <!-- confirm dialog -->
    <v-dialog v-model="confirmForm" width="400" dark>
      <v-card>
        <v-card-title class="headline">
          {{
            $t('exchange.dialog.confirm-order', {
              action: isBuy
                ? $t('exchange.order-form.title.buy')
                : $t('exchange.order-form.title.sell')
            })
          }}
        </v-card-title>
        <v-card-text class="headline">
          <p class="line head" :class="{ 'c-buy': isBuy, 'c-sell': !isBuy }">
            <span class="label"
              >{{ $t('exchange.order-form.label.price') }}:</span
            >
            {{ confirmPrice }}
            <asset-pairs :asset-id="baseCurrency" />
          </p>
          <p class="line">
            <span class="label"
              >{{ $t('exchange.order-form.label.amount') }}:</span
            >
            {{ amount }}
            <asset-pairs :asset-id="quoteCurrency" />
          </p>
          <p class="line">
            <span class="label"
              >{{ $t('exchange.order-form.label.total') }}:</span
            >
            {{ total }}
            <asset-pairs :asset-id="baseCurrency" />
          </p>
          <p v-if="fee.length > 0" class="line">
            <span class="label"
              >{{ $t('exchange.order-form.label.fee') }}:</span
            >
            {{ fee[0].amount }} {{ fee[0].asse | coinName(coinsMap) }}
          </p>
        </v-card-text>
        <v-card-actions>
          <v-flex d-flex justify-space-between>
            <cybex-btn
              small
              color="pre-minor"
              class="actions cancel m-l flex-grow-1"
              @click="confirmForm = false"
              >{{ $t('exchange.dialog.Cancel') }}</cybex-btn
            >
            <cybex-btn
              small
              color="major"
              class="actions confirm flex-grow-1"
              :disabled="!couldConfirmCreateTrade"
              @click="clickCreateTrade"
              >{{ $t('exchange.dialog.OK') }}</cybex-btn
            >
          </v-flex>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { BigNumber } from 'bignumber.js'
import utils from '~/components/mixins/utils'
import CybexDotClient from '~/lib/CybexDotClient.js'

export default {
  name: 'ExchangeForm',
  mixins: [utils],
  props: {
    isBuy: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      default: () => {}
    },
    balanceDigits: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      couldConfirmCreateTrade: false,
      intervalGetBalance: null,
      price: null,
      legalPrice: null,
      confirmForm: false,
      CYBAmount: 0,
      isCreatingTrade: false,
      needConfirmDialog: false,
      valid: true,
      amount: null,
      total: null,
      balances: null,
      fee: [],
      tradingPosition: [
        {
          val: 0.25,
          selected: false
        },
        {
          val: 0.5,
          selected: false
        },
        {
          val: 0.75,
          selected: false
        },
        {
          val: 1,
          selected: false
        }
      ]
    }
  },
  computed: {
    ...mapGetters({
      locale: 'i18n/locale',
      symbol: 'i18n/symbol',
      prefix: 'exchange/prefix',
      // isConnect: 'exchange/connect',
      coinsMap: 'user/coins',
      coinsInvert: 'user/coinsInvert',
      username: 'auth/username',
      baseCurrency: 'exchange/base',
      quoteCurrency: 'exchange/quote',
      // base_id: 'exchange/base_id',
      // quote_id: 'exchange/quote_id',
      quote_digits: 'exchange/quote_digits',
      base_digits: 'exchange/base_digits',
      isLocked: 'auth/islocked',
      refreshRate: 'exchange/tradesRefreshRate'
    }),

    confirmPrice() {
      const total = new BigNumber(this.total)
      const t = this.isBuy
        ? total
            .dividedBy(this.amount)
            .toFixed(this.priceDigits, BigNumber.ROUND_FLOOR)
        : total
            .dividedBy(this.amount)
            .toFixed(this.priceDigits, BigNumber.ROUND_CEIL)
      return t
    },
    priceError() {
      if (this.price && parseFloat(this.price) <= 0) {
        return this.$t('exchange.order-form.valid.price', { value: 0 })
      }
      if (this.$refs.priceInput) {
        return this.$refs.priceInput.validity.badInput
          ? this.$t('exchange.order-form.valid.number')
          : ''
      }
      return ''
    },
    amountError() {
      // 检查最小下单数量Amount和金额Total
      const minAmount = 1
      // if (!this.amount && this.formIsSubmitted) {
      //   return "Amount is required";
      // }
      if (minAmount && parseFloat(this.amount) < parseFloat(minAmount)) {
        return this.$t('exchange.order-form.valid.amount', {
          value: minAmount
        })
      }
      if (this.$refs.amountInput && this.$refs.amountInput.validity.badInput) {
        return this.$t('exchange.order-form.valid.number')
      }
      if (this.amount && !Number.isInteger(parseFloat(this.amount))) {
        return this.$t('exchange.order-form.valid.integer')
      }
      return ''
    },
    totalError() {
      const minTotal = 1
      if (minTotal && parseFloat(this.total) < parseFloat(minTotal)) {
        return this.$t('exchange.order-form.valid.total', { value: minTotal })
      }
      if (this.$refs.totalInput && this.$refs.totalInput.validity.badInput) {
        return this.$t('exchange.order-form.valid.number')
      }

      if (this.total && !Number.isInteger(parseFloat(this.total))) {
        return this.$t('exchange.order-form.valid.integer')
      }
      return ''
    },
    priceDigits() {
      return 8
    },
    totalDigits() {
      return 2
    },
    amountDigits() {
      return 2
    },
    couldCreateTrade() {
      if (
        !this.price ||
        !this.amount ||
        !this.total ||
        this.priceError !== '' ||
        this.amountError !== '' ||
        this.totalError !== ''
      )
        return false
      // if (this.confirmForm) return false; //弹窗打开时不允许创建
      // if (!this.fee.length) return false
      let result
      const balance = new BigNumber(this.balances)
      const amount = new BigNumber(this.amount)
      const total = new BigNumber(this.total)
      if (this.isBuy) {
        // 买单 查看total和balance的关系
        result = balance.isGreaterThanOrEqualTo(total)
        // 如果交易的是CYB
        // 或者CYB余额不足支付,
        // total 需要包含手续费
        if (result) {
          // @see http://mikemcl.github.io/bignumber.js/#cmp
          const compare = balance.comparedTo(total)
          result = compare !== null && compare >= 0
        }
      } else {
        // 卖单 查看amount和balance的关系
        result = balance.isGreaterThanOrEqualTo(amount)
        // 查看手续费是否足够
        if (result) {
          const compare = balance.comparedTo(amount)
          result = compare !== null && compare >= 0
        }
      }
      return result
    },

    hideBalance() {
      return (
        this.username === '' || this.username === null || this.balances === null
      )
    }
  },
  watch: {
    // 用户名变化时 重新拉取数据
    async username(val) {
      this.balances = null
      this.fee = []
      this.CYBAmount = null
      this.removeInterval()
      await this.initBalanceAndFee()
    },
    confirmForm(newV, oldV) {
      if (newV === false && oldV === true) {
        // 用户关闭弹窗后即可创建下一单
        this.isCreatingTrade = false
      }
    },
    isLocked(v) {
      if (!v && this.needConfirmDialog) {
        this.confirmForm = true
        this.couldConfirmCreateTrade = true
        this.needConfirmDialog = false
      }
    },
    $route() {
      // 清空数据
      this.$refs.form.reset()
      this.amount = null
      this.total = null
      if (this.isConnect) {
        this.initBalanceAndFee()
      }
    },
    coinsInvert() {
      if (this.isConnect) {
        this.initBalanceAndFee()
      }
    },
    async price(newV, oldV) {
      // input输出字符串, 通过计算得到的为float
      // 若值相等，视作没有变化
      if (oldV === newV) return
      // 自定义资产无法币价格
      if (!this.isNumberValue(newV) || parseFloat(newV) === 0) {
        this.legalPrice = null
      } else if (this.base_id) {
        await this.getLegalPrice()
      }
    },
    formData(newV, oldV) {
      const forceClean = 'clean'
      let price
      if (this.isBuy) {
        // set price change
        price = newV.buyPrice
        if (parseFloat(price) === 0 && newV.autoSet) {
          this.legalPrice = null
        } else {
          this.price = price
        }
        // detect total
        if (newV.buyTotal === forceClean) {
          this.total = null
          this.recalculateForm('total', null)
        } else if (newV.buyTotal && newV.buyTotal !== this.total) {
          const total = parseFloat(newV.buyTotal).toFixed(this.totalDigits)
          this.total = total
          this.recalculateForm('total', total)
        } else {
          this.recalculateForm('price')
        }
      } else {
        price = newV.sellPrice
        if (parseFloat(price) === 0) {
          this.legalPrice = null
        } else {
          this.price = price
        }
        if (newV.sellAmount === forceClean) {
          this.amount = null
          this.recalculateForm('amount', null)
        } else if (newV.sellAmount && newV.sellAmount !== this.amount) {
          const amount = parseFloat(newV.sellAmount).toFixed(this.amountDigits)
          this.amount = amount
          this.recalculateForm('amount', amount)
        } else {
          this.recalculateForm('price')
        }
      }
    }
  },
  async mounted() {
    await this.initBalanceAndFee()
    document.addEventListener('visibilitychange', this.bindIntervalEvent)
  },
  beforeDestroy() {
    this.removeInterval()
    document.removeEventListener('visibilitychange', this.bindIntervalEvent)
  },
  methods: {
    async bindIntervalEvent() {
      if (document.visibilityState === 'hidden') {
        this.removeInterval()
      } else if (document.visibilityState === 'visible') {
        await this.initBalanceAndFee()
      }
    },
    removeInterval() {
      clearInterval(this.intervalGetBalance)
      this.intervalGetBalance = null
    },

    async getAccountBalance() {
      const hash = this.isBuy
        ? CybexDotClient.baseTokenHash
        : CybexDotClient.quoteTokenHash
      const balance = await CybexDotClient.getBalance(hash)
      this.balances = balance.freeBalance
    },
    async initBalanceAndFee() {
      const func = async () => {
        this.getCybAmount()
        return Promise.all([await this.getAccountBalance()]).then(() => {
          // console.log('init balance and fee');
        })
      }
      await func()
      // 自动刷账户余额
      if (!this.intervalGetBalance) {
        this.intervalGetBalance = setInterval(async () => {
          await func()
        }, this.refreshRate)
      }
    },
    getDigits(v) {
      let d = 0
      const t = v.split('.')
      if (t.length > 1) d = t[1].length
      return d
    },
    validateForm() {
      let result = true
      // 无余额 无可用手续费 无
      if (!this.balances) {
        result = false
      }
      // Amount Price Total 缺一不可
      if (!this.total || !this.price || !this.amount) {
        result = false
      }
      return result
    },
    validUserKeypress($event) {
      if ($event.key === '.' && $event.target.value.includes('.')) {
        // 检查是否唯一小数点
        $event.preventDefault()
      }
    },
    // 判定用户是否手动输入的Price和Amount, Total是否合理并进行重新计算
    validUserInput(type, $event) {
      // 不出现科学计数法
      let correctVal = $event.target.value
      const maxDp = this[type + 'Digits'] ? this[type + 'Digits'] : 2
      correctVal = this.toNonExponential($event.target.value, maxDp)

      if (isNaN(correctVal)) {
        correctVal = ''
      }
      // 重新赋值
      this.$set(this, type, correctVal)
      // 重新计算
      this.recalculateForm(type, correctVal)
    },
    // 获取对应法币价格

    async getLegalPrice() {
      if (!this.base_id && !this.price && !this.locale) return
      const p = await this.cybexjs.assetValue(
        this.base_id,
        this.price,
        this.locale === 'en' ? this.prefix + 'USDT' : null
      )
      this.legalPrice = this.$options.filters.legalDigits(p, this.symbol)
    },
    isNumberValue(v) {
      return v !== null && !isNaN(v) && v !== '' && typeof v !== 'undefined'
    },
    // 重新计算表单
    recalculateForm(updateBy, val) {
      if (typeof val === 'undefined') {
        val = this[updateBy]
      }
      // console.log("user updated field >> " + updateBy, val);
      if (updateBy === 'total') {
        if (!this.isNumberValue(this.total)) {
          this.total = null
          this.amount = null
        } else if (this.isNumberValue(this.price) && this.price !== 0) {
          const total = new BigNumber(this.total)
          const price = new BigNumber(this.price)
          this.amount = total
            .dividedBy(price)
            .toFixed(this.amountDigits, BigNumber.ROUND_FLOOR)
        } else {
          this.amount = null
        }
      } else if (updateBy === 'price' || updateBy === 'amount') {
        if (this.isNumberValue(this.price) && this.isNumberValue(this.amount)) {
          const amount = new BigNumber(this.amount)
          const price = new BigNumber(this.price)
          // console.log('updated price', price, this.price);
          this.total = amount
            .multipliedBy(price)
            .toFixed(this.totalDigits, BigNumber.ROUND_CEIL)
        } else {
          this.total = null
        }
      }
      // console.log("this.price", this.price);
      // console.log("this.total", this.total);
      // console.log("this.amount", this.amount);
    },
    // 获取CYB余额
    getCybAmount() {
      return 0
      // console.log("cyb余额", cyb1, this.cybamount);
    },
    beforeCreateTrade() {
      // 强制显示精度
      this.price = parseFloat(this.price).toFixed(this.pricedigits)
      this.amount = parseFloat(this.amount).toFixed(this.amountdigits)
      this.total = parseFloat(this.total).toFixed(this.totaldigits)
      // 检查用户是否已锁
      if (this.islocked) {
        // 弹出解锁框
        this.needconfirmdialog = true
        this.$toggleLock()
      } else {
        this.confirmForm = true
        this.couldConfirmCreateTrade = true
      }
    },
    clickCreateTrade() {
      this.$eventHandle(this.createLimitOrder, [], {
        user: true,
        server: false
      })
        .then(() => {
          this.$message({
            message: this.$t('message.order_pended'),
            type: 'success'
          })
        })
        .catch((e) => {
          if (!e.user) {
            this.$message({
              message: this.$t('message.order_pended_failed'),
              type: 'error'
            })
          }
        })
        .finally(() => {
          // 防止弹窗开着的情况下确认下单按钮变量
          setTimeout(() => {
            this.couldConfirmCreateTrade = true
          }, 3000)
        })
    },

    async createLimitOrder() {
      if (!this.validateForm()) return false
      this.isCreatingTrade = true
      this.couldConfirmCreateTrade = false

      const result = await CybexDotClient.createLimitOrder(
        CybexDotClient.TradePairHash,
        this.isBuy,
        this.price,
        this.amount
      )

      if (result !== null) {
        this.$emit('create-trade-success')
        this.$message({
          message: 'Order Pended',
          type: 'success'
        })
      }
      this.confirmForm = false
    },
    // 创建订单
    async createTrade() {
      // 首先表单验证
      if (!this.validateForm()) return false
      this.isCreatingTrade = true
      this.couldConfirmCreateTrade = false
      const side = this.isBuy ? 'buy' : 'sell'
      const baseId = this.baseId
      const quoteId = this.quoteId
      const sid = await this.cybexjs.limit_order_create(
        baseId,
        quoteId,
        side,
        this.price,
        this.amount,
        this.fee[0].asse,
        this.total
      )
      if (sid !== null) {
        this.$emit('create-trade-success')
        this.$message({
          message: 'Order Pended',
          type: 'success'
        })
      }
      this.confirmForm = false
    }
    // 计算仓位
    // 如果手续费和交易币种一致, 说明CYB余额不足以支付手续费
    // 总成交金额 需要 额外扣除当前币种的手续费
    // 具体数值由 calcFee函数从服务器获得
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/style/_vars/_colors';
@import '~/assets/style/_fonts/_font_mixin';

.flex-label {
  &.amount {
    flex: 1 1 auto !important;
    min-height: 38px;
    align-items: center;
    margin-right: 0;
  }
}

.cybex-tips {
  max-width: 262px;
}

// 覆写vuetify text-field solo样式
// 用于交易所页面的表单
.exchange-block-container {
  padding-bottom: 14px;
}

.exchange-form-input-label {
  display: flex;
  align-items: center;
  text-align: left;
  flex: 0 1 0;
  height: 30px;
  color: rgba(map-get($main, white), 0.8);
  min-width: 64px;
  @include f-cybex-style(heavy);
}

.exchange-form-input-wrapper {
  position: relative;
  @include f-cybex-style(heavy);

  .exchange-form-input {
    position: relative;
    height: 32px;
    margin: 0;
    padding: 7px 2px 5px 8px;
    box-shadow: none !important;
    border-radius: 4px;
    background-color: map-get($main, anchor);
    width: 100%;

    &:focus {
      outline: none;
      background-color: map-get($main, independence);
    }
  }

  .exchange-form-input-suffix {
    position: absolute;
    right: 20px;
    top: calc(50% + 1px);
    transform: translateY(-50%);
    color: rgba(map-get($main, white), 0.5);
  }
}

form {
  &.exchange {
    .b-half {
      max-width: 131px;
    }

    .money {
      margin-left: 4px;
      color: map-get($main, grey);
      @include f-cybex-style('black', heavy);
      text-align: right;

      .unit {
        color: map-get($main, white);
        opacity: 0.3;
        padding-left: 2px;
      }
    }

    .desc {
      font-size: 16px;
      line-height: 1;
    }

    .legal-tender {
      margin: 6px 0 3px;
      min-height: 12px;
    }

    .no-login {
      background: map-get($main, anchor);
      height: 40px;
      line-height: 40px;
      text-align: center;
      margin-top: 27px;
      margin-bottom: 16px;
      letter-spacing: 0.5px;

      a {
        @include f-cybex-style(heavy);
        color: map-get($main, orange);
      }
    }

    .fee {
      margin-top: 14px;
      @include f-cybex-style(heavy);

      .label {
        color: rgba(map-get($main, white), 0.8);
      }
    }

    .v-btn {
      margin: 21px 0 0;
      background-image: linear-gradient(100deg, #d96250, #be4634) !important;

      &.is-buy {
        background-image: linear-gradient(100deg, #a9e06e, #8dc84f) !important;
      }
    }
  }
}

.v-btn.theme--cybex-dark {
  display: block;
}
</style>
