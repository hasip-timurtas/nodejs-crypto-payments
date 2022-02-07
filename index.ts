import { connect } from 'mongoose';
import Transactions from './app/transactions'

async function run(): Promise<void> {
  await connect('mongodb://mongo:27017/kraken');
  const transactions = new Transactions();
  const data = await transactions.getDepositInformation();
}

run().catch(err => console.log(err));