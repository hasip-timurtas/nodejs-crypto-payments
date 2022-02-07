import TransactionModel from './models/transactions'
import UserModel from './models/user'
import userData from '../data/users.json';
import transactionsData1 from '../data/transactions-1.json';
import transactionsData2 from '../data/transactions-2.json';
import { VALID_DEPOSIT_QUERY } from './constants'

export default class Transactions {
  async seedData() {
    await UserModel.deleteMany({});
    await UserModel.insertMany(userData);

    await TransactionModel.deleteMany({});
    const transactions = this.removedDuplicates();
    await TransactionModel.insertMany(transactions);
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

  async getDepositInformation() {
    await this.seedData();
    const transactions = await this.getValidDeposits();
    console.log(transactions.length);

    const duplicates = await this.getDublicates();

    if (duplicates.length)
      throw new Error('There are dublicated Transactions.');

    const customerTransactions: any = this.getCustomerTransactions(transactions);
    const withoutReferences: any = this.getWithoutReferences(transactions);

    const result = await this.printDepositInformation(customerTransactions, withoutReferences);
    return result;
  }

  async getValidDeposits(): Promise<any> {
    return TransactionModel
      .aggregate([
        {
          $match: VALID_DEPOSIT_QUERY,
        },
        {
          $group: {
            _id: '$address',
            sum: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: 'address',
            as: 'userDetail',
          },
        },
        {
          $project: {
            _id: 0,
            address: '$_id',
            count: 1,
            sum: 1,
            userDetail: {
              name: 1,
              index: 1,
            },
          },
        },
      ])
      .exec();
  }

  getWithoutReferences(transactions: any) {
    return transactions
      .filter((transaction: any) => !transaction.userDetail.length)
      .reduce(
        (obj: any, current: any) => {
          obj.sum += current.sum;
          obj.count += current.count;

          return obj;
        },
        {
          sum: 0,
          count: 0,
        },
      );
  }

  getCustomerTransactions(transactions: any) {
    return transactions
      .filter((transaction: any) => transaction.userDetail.length)
      .map((transaction: any) => {
        const { name, index } = transaction.userDetail[0];
        return {
          index,
          name,
          ...transaction,
        };
      });
  }

  async printDepositInformation(customerTransactions: any, withoutReferences: any) {
    let output = '';
    customerTransactions.sort((a: any, b: any) => a.index - b.index);
    for (const cts of customerTransactions) {
      output += `Deposited for ${cts.name}: 
      count=${cts.count} 
      sum=${cts.sum.toFixed(8)}<br>`;
    }

    output += `Deposited without reference: 
    count=${withoutReferences.count} 
    sum=${withoutReferences.sum.toFixed(8)}<br>`;

    const minMax = await this.getSmallestAndLargestAmounts();
    const { smallest, largest } = minMax[0] || {};

    output += `Smallest valid deposit: ${smallest.toFixed(8)}<br>`;
    output += `Largest valid deposit: ${largest.toFixed(8)}`;
    console.log(output);
    return output;
  }

  async getSmallestAndLargestAmounts(): Promise<any> {
    return TransactionModel.aggregate([
      {
        $match: VALID_DEPOSIT_QUERY,
      },
      {
        $group: {
          _id: {},
          smallest: { $min: '$amount' },
          largest: { $max: '$amount' },
        },
      },
    ])
      .exec();
  }

  async getDublicates(): Promise<any> {
    return TransactionModel.aggregate([
      {
        $group: {
          _id: '$txid',
          count: {
            $sum: 1,
          },
        },
      },
      {
        $match: {
          _id: { $ne: null },
          count: { $gt: 1 },
        },
      },
    ]);
  }
}
