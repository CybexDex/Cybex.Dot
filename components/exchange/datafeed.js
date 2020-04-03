import moment from 'moment-timezone'
import { invert, values } from 'lodash'
import CybexDotClient from '~/lib/CybexDotClient.js'
import config from '~/lib/config/config.js'

export function convertResolutionByValue(value, source) {
  const search = invert(source)
  return search ? search[value] : null
}

export async function getHistoryData(
  bucketSeconds,
  requestEndDate,
  limit = 200
) {
  const bars = []

  const barsData = await CybexDotClient.getMarket(
    bucketSeconds,
    requestEndDate,
    limit
  )

  barsData.forEach((data) => {
    const time = moment.utc(data.time).valueOf()

    bars.push({
      time,
      close:
        (data.close *
          10 **
            (CybexDotClient.info.quotePrecision -
              CybexDotClient.info.basePrecision)) /
        config.pricePrecision,
      open:
        (data.open *
          10 **
            (CybexDotClient.info.quotePrecision -
              CybexDotClient.info.basePrecision)) /
        config.pricePrecision,
      high:
        (data.high *
          10 **
            (CybexDotClient.info.quotePrecision -
              CybexDotClient.info.basePrecision)) /
        config.pricePrecision,
      low:
        (data.low *
          10 **
            (CybexDotClient.info.quotePrecision -
              CybexDotClient.info.basePrecision)) /
        config.pricePrecision,
      volume:
        parseFloat(data.quote_amount) / 10 ** CybexDotClient.info.quotePrecision
    })
  })

  return bars
}

export class Datafeed {
  intervalGetNewBar = null
  bars = []
  lastBar = {
    time: null,
    open: null,
    high: null,
    close: null,
    volume: null
  }

  // 时间间隔
  resolution
  // 小数点精度
  pricescale
  dateDisplayFormat = 'YYYY/MM/DD' // 显示用moment日期格式
  dateXHRFormat = 'YYYY-MM-DDTHH:mm:ss' // 调用接口moment日期格式
  datepickerFormat = 'YYYY-MM-DD' // 控件需要的moment日期格式
  constructor(data) {
    ;({ resolution: this.resolution, pricescale: this.pricescale } = data)
  }

  onReady(callback) {
    const config = {
      exchanges: [],
      symbols_types: [],
      supported_resolutions: values(this.resolution),
      supports_marks: false,
      supports_timescale_marks: false,
      supports_time: false
    }
    return setTimeout(function() {
      callback(config)
    }, 0)
  }

  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
    // search function
    onResultReadyCallback()
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    symbolName = symbolName.split('_')
    symbolName = symbolName[1] + '_' + symbolName[0]
    const symbolStub = {
      name: symbolName,
      ticker: symbolName,
      description: '',
      type: 'crypto',
      session: '24x7',
      timezone: moment.tz.guess(),
      minmov: 1,
      pricescale: 10 ** this.pricescale,
      has_intraday: true,
      has_seconds: true,
      has_no_volume: false,
      intraday_multipliers: values(this.resolution),
      seconds_multipliers: values(this.resolution),
      supported_resolution: values(this.resolution),
      volume_precision: 8,
      data_status: 'streaming'
    }
    if (symbolStub) {
      setTimeout(function() {
        onSymbolResolvedCallback(symbolStub)
      }, 0)
    } else {
      setTimeout(function() {
        onResolveErrorCallback('can not find by symbol name' + symbolName)
      }, 0)
    }
  }

  /**
   * 根据from to时间范围筛选历史数据
   */
  async getBars(
    symbolInfo,
    currentResolution,
    startDate,
    endDate,
    onHistoryCallback,
    onErrorCallback,
    firstDataRequest
  ) {
    let bucketSeconds = convertResolutionByValue(
      currentResolution,
      this.resolution
    )
    if (!bucketSeconds) {
      bucketSeconds = 60
    }
    // console.log('============= currentResolution:', currentResolution, this.resolution);

    const end = moment
      .unix(endDate)
      .utc()
      .format('YYYY-MM-DD HH:mm:ss')
    try {
      this.bars = await getHistoryData(bucketSeconds, end)

      if (this.bars.length) {
        onHistoryCallback(this.bars, { noData: false })
      } else {
        onHistoryCallback(this.bars, { noData: true })
      }
    } catch (err) {
      onErrorCallback(err)
    }
  }

  calculateHistoryDepth(resolution, resolutionBack, intervalBack) {
    let returnValue
    if (resolution === '1') {
      returnValue = {
        resolutionBack: '',
        intervalBack: 200
      }
    } else if (resolution === '5') {
      returnValue = {
        resolutionBack: '',
        intervalBack: 200 * 5
      }
    } else if (resolution === '60') {
      returnValue = {
        resolutionBack: '',
        intervalBack: 200 * 60
      }
    } else {
      returnValue = {
        resolutionBack: 'D',
        intervalBack: 200
      }
    }

    return returnValue
  }

  async subscribeBars(
    symbolInfo,
    currentResolution,
    onRealtimeCallback,
    subscriberUID,
    onResetCacheNeededCallback
  ) {
    let bucketSeconds = convertResolutionByValue(
      currentResolution,
      this.resolution
    )
    if (!bucketSeconds) {
      bucketSeconds = 60
    }
    // console.log('============= currentResolution:', currentResolution, this.resolution);
    const requestNewBar = async () => {
      const end = moment()
        .utc()
        .format('YYYY-MM-DD HH:mm:ss')
      const bars = await getHistoryData(bucketSeconds, end, 10)
      if (bars.length) {
        const newLastBar = bars[bars.length - 1]
        this.lastBar = newLastBar
        onRealtimeCallback(newLastBar)
      }
    }
    await requestNewBar()
    if (!this.intervalGetNewBar) {
      this.intervalGetNewBar = setInterval(async () => {
        await requestNewBar()
      }, 6000)
    }

    /**
     *  @param bar object{time, close, open, high, low, volume}
     */
  }

  unsubscribeBars(subscriberUID) {
    clearInterval(this.intervalGetNewBar)
    this.intervalGetNewBar = null
  }
}
