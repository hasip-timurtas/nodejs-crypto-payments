import TransactionModel from './models/transactions'
import customersData from '../data/customers.json';
import transactionsData1 from '../data/transactions-1.json';
import transactionsData2 from '../data/transactions-2.json';

export default class Transactions {
  async seedData() {
    await TransactionModel.deleteMany({});

    const transactions = this.removedDuplicates();
    await TransactionModel.insertMany(transactions);

    return TransactionModel.find();
  }

  removedDuplicates() {
    const importedTransactions = [
      ...transactionsData1.transactions,
      ...transactionsData2.transactions,
    ];

    const transactions: any[] = [];
    for (const transaction of importedTransactions) {
      if (transactions.find((ts: any) => ts.txid === transaction.txid)) continue;
      transactions.push(transaction);
    }

    return transactions;
  }

  async printDepositInformation() {

  }
}