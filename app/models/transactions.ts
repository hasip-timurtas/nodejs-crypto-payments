import { Schema, model } from 'mongoose';

const TransactionSchema = new Schema({
  amount: Number,
  txid: String,
  involvesWatchonly: Boolean,
  account: String,
  address: String,
  category: String,
  label: String,
  confirmations: Number,
  blockHash: String,
  blockIndex: Number,
  blockTime: Number,
  vout: Number,
  walletConflicts: Array,
  time: Number,
  timeReceived: Number,
  'bip125-replaceable': String,
});

export default model('Transaction', TransactionSchema);