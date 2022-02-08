import * as dotenv from 'dotenv';
import { connect, Error } from 'mongoose';
import Transactions from './app/transactions'
dotenv.config();

/**
 * Runs the application for priting the requested deposit informations
 */
async function run(): Promise<void> {
  await connect(process.env.MONGO_URL as string);
  const transactions = new Transactions();
  transactions.startPrintProcess();
}

run().catch((err: Error) => console.log(err));