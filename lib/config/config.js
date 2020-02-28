let envConfig
let env = ''
try {
  env = require('./env').default.env
  envConfig = require(/* webpackMode: "eager" */ `./config.${env}`).default
} catch (e) {
  envConfig = {}
}
const config = {
  links: {
    about: {
      en: 'https://intro.cybex.io/index_en.html',
      cn: 'https://intro.cybex.io/#what-section'
    },
    oldSite: 'https://olddex.cybex.io',
    cybexlive: 'https://cybex.live',
    telegram: 'https://t.me/CYBEXChinese',
    medium: 'https://medium.com/@CYBEXexchange',
    twitter: 'https://twitter.com/CYBEXExchange',
    instagram: {
      en: 'https://www.instagram.com/cybexexchange/?hl=en',
      cn: 'https://www.instagram.com/cybexexchange/?hl=zh-cn'
    },
    facebook: 'https://www.facebook.com/Cybex.exchange.center'
  }
}
if (envConfig) {
  Object.assign(config, envConfig)
}
export default config
