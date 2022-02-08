import * as dotenv from 'dotenv';
import { connect } from 'mongoose';
import Transactions from './app/transactions'
dotenv.config();

async function run(): Promise<void> {
  await connect(process.env.MONGO_URL as string);
  const transactions = new Transactions();
  transactions.getDepositInformation();
}

run().catch(err => console.log(err));