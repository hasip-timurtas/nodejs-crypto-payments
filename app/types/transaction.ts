export interface ITransaction {
  amount: Number,
  txid: String,
  involvesWatchonly: Boolean,
  account: String,
  address: String,
  category: String,
  label: String,
  confirmations: Number,
  blockhash: String,
  blockindex: Number,
  blocktime: Number,
  vout: Number,
  walletconflicts: Array<String>,
  time: Number,
  timereceived: Number,
  'bip125-replaceable'?: String
}