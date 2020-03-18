import Vue from 'vue'
import Vue2Filters from 'vue2-filters'
import moment from 'moment'
import { round, ceil, floor } from 'lodash'

Vue.use(Vue2Filters)

const filters = {
  date: (d, f) => {
    const local = moment.utc(d).toDate()

    return moment(local).format(f)
  },
  /**
   * 限制价格显示字节长度
   * @param {Number | String} value
   * @param {Number} maxPrecision
   */
  shortenPrice(value, maxPrecision = 10) {
    const oldP = value ? value.toString() : ''
    const oldLen = oldP.length
    if (oldLen < maxPrecision) {
      return value
    }
    return oldP.substr(0, maxPrecision)
  },

  localDate: (d, f) => {
    const local = moment.utc(d).local()

    return local.format(f)
  },
  /**
   * 显示精度，四舍五入
   * 1.234 | roundDigits(2)           // 输出1.23
   * 1.239 | roundDigits(2)           // 输出1.24
   * 1.234 | roundDigits(2, '', '-')  // 输出1.23
   * '' | roundDigits(2, '', '-')     // 输出 -
   * null | roundDigits(2, null, '')  // 输出 ''
   * @param {*} val
   * @param {*} digit
   * @param {*} emptyVal
   * @param {*} emptySymbol
   */
  roundDigits(val, digit, emptyVal, emptySymbol) {
    if (typeof emptyVal !== 'undefined' && val === emptyVal) {
      return typeof emptySymbol !== 'undefined' ? emptySymbol : '-'
    } else {
      return round(val, digit).toFixed(digit)
    }
  },
  /**
   * 法币精度显示
   * 价格大于等于1时候 显示2位
   * 价格小于1时 显示4位精度
   * @param {*} symbol 货币符号
   * @param {*} val 价格数值
   */
  legalDigits(val, symbol) {
    const digits = 2
    const digitsLow = 4
    if (!val) return symbol + 0
    if (val >= 1) {
      return symbol + parseFloat(val).toFixed(digits)
    } else {
      return symbol + parseFloat(val).toFixed(digitsLow)
    }
  },
  shorten(symbol) {
    return symbol || ''
  },
  /**
   * 1.234 | floorDigits(2)           // 输出1.23
   * 1.239 | floorDigits(2)           // 输出1.23
   * 1.234 | floorDigits(2, '', '-')  // 输出1.23
   * '' | floorDigits(2, '', '-')     // 输出 -
   * null | floorDigits(2, null, '')  // 输出 ''
   * @param {*} val
   * @param {*} digit
   * @param {*} emptyVal
   * @param {*} emptySymbol
   */
  floorDigits(val, digit, emptyVal, emptySymbol) {
    if (typeof emptyVal !== 'undefined' && val === emptyVal)
      return typeof emptySymbol !== 'undefined' ? emptySymbol : '-'
    else return floor(val, digit).toFixed(digit)
  },
  /**
   * 显示精度，向上取整
   * 1.234 | floorDigits(2)           // 输出1.24
   * 1.239 | floorDigits(2)           // 输出1.24
   * 1.234 | floorDigits(2, '', '-')  // 输出1.24
   * '' | floorDigits(2, '', '-')     // 输出 -
   * null | floorDigits(2, null, '')  // 输出 ''
   * @param {*} val
   * @param {*} digit
   * @param {*} emptyVal
   * @param {*} emptySymbol
   */
  ceilDigits(val, digit, emptyVal, emptySymbol) {
    if (typeof emptyVal !== 'undefined' && val === emptyVal)
      return typeof emptySymbol !== 'undefined' ? emptySymbol : '-'
    else return ceil(val, digit).toFixed(digit)
  }
}

for (const name in filters) {
  Vue.filter(name, filters[name])
}
