const pairs = [
  {
    base: {
      id: '0x1e507b7b9e05b28a469210f24af88b60adf471d0f26dcd1a1f15933831d68cf1',
      name: 'CYB',
      precision: 3
    },
    quote: {
      id: '0xa95c385c002162c0b12397b572c9077a80d4d315ad0caf172ca51a9dca9a3682',
      name: 'USDT',
      precision: 5
    },
    info: { last_price: 5, change: 5, volume: 2 },
    book: { last_price: 5, amount: 2, total: 6 },
    choose: { last_price: 5, volume: 2 },
    form: {
      min_trade_amount: 0.01,
      amount_step: 0.01,
      price_step: 0.00001,
      min_order_value: 0.002,
      total_step: 0.000001
    },
    id: '0x0e67f3334f87c24ea7781ecfee2ce55b34212c9de024a4656f5de604169e2117'
  },
  {
    base: {
      id: '0xe66f401487b7c589db0427128cb97d81bf1e2a41edfee84b0313d322dd25dfd1',
      name: 'BTC',
      precision: 3
    },
    quote: {
      id: '0x38e4f7a619191979bc05c68137ca6ebfc9b0e9876566a615fec058f1d1fd555c',
      name: 'PCX',
      precision: 5
    },
    info: { last_price: 5, change: 5, volume: 2 },
    book: { last_price: 5, amount: 2, total: 6 },
    choose: { last_price: 5, volume: 2 },
    form: {
      min_trade_amount: 0.01,
      amount_step: 0.01,
      price_step: 0.00001,
      min_order_value: 0.002,
      total_step: 0.000001
    },
    id: '0x2bf118fec98c3dee205500577f395bc2957afc6b85f5c996efccdcccaff589a6'
  },
  {
    base: {
      id: '0xfa69e3da87959b13dacf9189141ad3882a3b571bcff298387490f177e6c1fb0b',
      name: 'EOS',
      precision: 3
    },
    quote: {
      id: '0xeb3d510abf320d80fb05db6cdcc1e0f60c0cb1fdcdfdeaf75b4bf9e0a7258649',
      name: 'ETH',
      precision: 5
    },
    info: { last_price: 5, change: 5, volume: 2 },
    book: { last_price: 5, amount: 2, total: 6 },
    choose: { last_price: 5, volume: 2 },
    form: {
      min_trade_amount: 0.01,
      amount_step: 0.01,
      price_step: 0.00001,
      min_order_value: 0.002,
      total_step: 0.000001
    },
    id: '0x9b6badf56230b85e31be5ac44c8d4f2866929637cc4ff9c7747d79c6cde61f1e'
  },
  {
    base: {
      id: '0xfa69e3da87959b13dacf9189141ad3882a3b571bcff298387490f177e6c1fb0b',
      name: 'EOS',
      precision: 3
    },
    quote: {
      id: '0x1f1a00156a007794cb584b47311b533d6b8e61458594f69eda07372a63c931ba',
      name: 'KSM',
      precision: 5
    },
    info: { last_price: 5, change: 5, volume: 2 },
    book: { last_price: 5, amount: 2, total: 6 },
    choose: { last_price: 5, volume: 2 },
    form: {
      min_trade_amount: 0.01,
      amount_step: 0.01,
      price_step: 0.00001,
      min_order_value: 0.002,
      total_step: 0.000001
    },
    id: '0xcf7cc78cfa882aee246d95b48d4dd94560128bc3e469690f8368462bf70830b8'
  },
  {
    base: {
      id: '0xfa69e3da87959b13dacf9189141ad3882a3b571bcff298387490f177e6c1fb0b',
      name: 'EOS',
      precision: 3
    },
    quote: {
      id: '0x1f1a00156a007794cb584b47311b533d6b8e61458594f69eda07372a63c931ba',
      name: 'KSM2',
      precision: 5
    },
    info: { last_price: 5, change: 5, volume: 2 },
    book: { last_price: 5, amount: 2, total: 6 },
    choose: { last_price: 5, volume: 2 },
    form: {
      min_trade_amount: 0.01,
      amount_step: 0.01,
      price_step: 0.00001,
      min_order_value: 0.002,
      total_step: 0.000001
    },
    id: '0xc5f38396e45236a055bcb732b8314ee782dcee3a9c0dc9ba3a6ca38f6532da40'
  },
  {
    base: {
      id: '0xfa69e3da87959b13dacf9189141ad3882a3b571bcff298387490f177e6c1fb0b',
      name: 'EOS',
      precision: 3
    },
    quote: {
      id: '0x1f1a00156a007794cb584b47311b533d6b8e61458594f69eda07372a63c931ba',
      name: 'KSM3',
      precision: 5
    },
    info: { last_price: 5, change: 5, volume: 2 },
    book: { last_price: 5, amount: 2, total: 6 },
    choose: { last_price: 5, volume: 2 },
    form: {
      min_trade_amount: 0.01,
      amount_step: 0.01,
      price_step: 0.00001,
      min_order_value: 0.002,
      total_step: 0.000001
    },
    id: '0xb8b2705c23ba935a8bc6ab7319929b38f52aff2d02da749b3735fac4f4958662'
  },
  {
    base: {
      id: '0xfa69e3da87959b13dacf9189141ad3882a3b571bcff298387490f177e6c1fb0b',
      name: 'EOS',
      precision: 3
    },
    quote: {
      id: '0x1f1a00156a007794cb584b47311b533d6b8e61458594f69eda07372a63c931ba',
      name: 'KSM4',
      precision: 5
    },
    info: { last_price: 5, change: 5, volume: 2 },
    book: { last_price: 5, amount: 2, total: 6 },
    choose: { last_price: 5, volume: 2 },
    form: {
      min_trade_amount: 0.01,
      amount_step: 0.01,
      price_step: 0.00001,
      min_order_value: 0.002,
      total_step: 0.000001
    },
    id: '0xd0baadcfe389325dd746fd4e3488d87874b7c5f4ec17be2bd96570444767af41'
  },
  {
    base: {
      id: '0xfa69e3da87959b13dacf9189141ad3882a3b571bcff298387490f177e6c1fb0b',
      name: 'EOS',
      precision: 3
    },
    quote: {
      id: '0x1f1a00156a007794cb584b47311b533d6b8e61458594f69eda07372a63c931ba',
      name: 'KSM5',
      precision: 5
    },
    info: { last_price: 5, change: 5, volume: 2 },
    book: { last_price: 5, amount: 2, total: 6 },
    choose: { last_price: 5, volume: 2 },
    form: {
      min_trade_amount: 0.01,
      amount_step: 0.01,
      price_step: 0.00001,
      min_order_value: 0.002,
      total_step: 0.000001
    },
    id: '0xd0baadcfe389325dd746fd4e3488d87874b7c5f4ec17be2bd96570444767af41'
  }
]

export default pairs
