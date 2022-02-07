import { connect } from 'mongoose';
import Transactions from './app/transactions'

async function run(): Promise<void> {
  // 4. Connect to MongoDB
  await connect('mongodb+srv://mht:15yb88dycf@cluster0.gtwkz.mongodb.net/finans?retryWrites=true&w=majority');
  const transactions = new Transactions();
  const data = await transactions.seedData();
  console.log(data.length);
}

run().catch(err => console.log(err));