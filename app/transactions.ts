import TransactionModel from './models/transactions'
import UserModel from './models/user'
import userData from '../data/users.json';
import transactionsData1 from '../data/transactions-1.json';
import transactionsData2 from '../data/transactions-2.json';
import { VALID_DEPOSIT_QUERY } from './constants'
import {
  ITransaction,
  IDepositInfo,
  IWithoutReference
} from './types';

export default class Transactions {

  /**
   * Main fuction to start deposit printing process
   * 
   * @throws Error - Throws error if there is duplicated records in transactions
   */
  async startPrintProcess() {
    await this.seedData();
    const transactions: Array<IDepositInfo> = await this.getValidDeposits();
    const duplicates = await this.getDublicates();

    if (duplicates.length) throw new Error('There are dublicated Transactions.');

    const customerTransactions: Array<IDepositInfo> = this.getCustomerTransactions(transactions);
    const withoutReferences: IWithoutReference = this.getWithoutReferences(transactions);

    await this.printDepositInformation(customerTransactions, withoutReferences);
  }

  /**
   * Imports the initial data to mongo collections
   * For users and transactions
   */
  private async seedData() {
    await UserModel.deleteMany({});
    await UserModel.insertMany(userData);

    const importedTransactions: Array<ITransaction> = [
      ...transactionsData1.transactions,
      ...transactionsData2.transactions,
    ];
    await TransactionModel.deleteMany({});
    const transactions = this.removeDuplicates(importedTransactions);
    await TransactionModel.insertMany(transactions);
  }

  /**
   * Removes the dublicated data from imported transactions
   * Returns unique transactions
   * 
   * @param {Array<ITransaction>} importedTransactions - imported transactions
   * @returns {Array<ITransaction>}
   */
  private removeDuplicates(importedTransactions: Array<ITransaction>) {
    const transactions: Array<ITransaction> = [];
    for (const transaction of importedTransactions) {
      if (transactions.find((ts: ITransaction) => ts.txid === transaction.txid)) continue;
      transactions.push(transaction);
    }
    return transactions;
  }

  /**
   * Gets valid deposits and users from mongodb
   * Matches deposit amount, categories and confirmations
   * Groups the transactions by users
   * 
   * @returns {Promise<Array<IDepositInfo>>}
   */
  async getValidDeposits(): Promise<Array<IDepositInfo>> {
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

  /**
   * Filters transactions with user 
   * Returns transaction and user information
   *  
   * @param {Array<IDepositInfo>} transactions - transactions
   * @returns {Array<IDepositInfo>} - transactions with user info
   */
  getCustomerTransactions(transactions: Array<IDepositInfo>): Array<IDepositInfo> {
    return transactions
      .filter((transaction: IDepositInfo) => transaction.userDetail.length)
      .map((transaction: IDepositInfo) => {
        const { name, index } = transaction.userDetail[0];
        transaction.name = name;
        transaction.index = index
        return transaction;
      });
  }

  /**
   * Filters transactions without user
   * Returns sum and count
   *  
   * @param {Array<IDepositInfo>} transactions - transactions
   * @returns {IWithoutReference} - sum and count info
   */
  getWithoutReferences(transactions: Array<IDepositInfo>): IWithoutReference {
    return transactions
      .filter((transaction: IDepositInfo) => !transaction.userDetail.length)
      .reduce(
        (obj: IWithoutReference, current: IWithoutReference) => {
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

  /**
   * Prints the deposit informations
   *  
   * @param {Array<IDepositInfo>} customerTransactions - transactions with user info
   * @param {IWithoutReference} withoutReferences - transactions summary of without user info
   */
  async printDepositInformation(customerTransactions: Array<IDepositInfo>, withoutReferences: IWithoutReference) {
    let output = '';
    customerTransactions.sort((a: IDepositInfo, b: IDepositInfo) => a.index - b.index);
    for (const cts of customerTransactions) {
      output += `Deposited for ${cts.name}: count=${cts.count} sum=${cts.sum.toFixed(8)}\n`;
    }

    output += `Deposited without reference: count=${withoutReferences.count} sum=${withoutReferences.sum.toFixed(8)}\n`;
    const minMax = await this.getSmallestAndLargestAmounts();
    const { smallest, largest } = minMax[0] || {};

    output += `Smallest valid deposit: ${smallest.toFixed(8)}\n`;
    output += `Largest valid deposit: ${largest.toFixed(8)}`;
    console.log(output);
  }

  /**
   * Gets smalles and largest valid transaction amounts from mongodb
   *  
   * @return {Oject} smallest amd largest valid transaction amounts
   */
  async getSmallestAndLargestAmounts() {
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

  /**
   * Gets duplicated imported transactions from mongodb
   *  
   * @return {Oject} _id (address) and count of the duplicted transactions
   */
  async getDublicates() {
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
