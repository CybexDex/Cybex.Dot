const env =
  process.env.USE_ENV || (process.env.USE_TESTNET === '1' ? 'dev' : 'pro')
export default {
  env
}
