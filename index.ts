import { connect } from 'mongoose';
import Transactions from './app/transactions'

async function run(): Promise<void> {
  await connect('mongodb+srv://mht:15yb88dycf@cluster0.gtwkz.mongodb.net/finans?retryWrites=true&w=majority');
  const transactions = new Transactions();
  const data = await transactions.getDepositInformation();
}

run().catch(err => console.log(err));