import userData from '../data/users.json';
import transactionsData1 from '../data/transactions-1.json';
import transactionsData2 from '../data/transactions-2.json';
import { ITransaction, IKeyValue } from './types';
const format = require('pg-format')
import { Pool, QueryResult } from 'pg'

export default class Transactions {

  constructor(private pool: Pool) { }

  /**
   * Main fuction to start deposit printing process
   * 
   * @throws Error - Throws error if there is duplicated records in transactions
   */
  async startPrintProcess(): Promise<void> {
    await this.seedData();
    await this.printDepositInformation();
  }

  /**
  * Imports the initial data to database
  * For users and transactions
  */
  private async seedData(): Promise<void> {
    await this.pool.query('DROP TABLE IF EXISTS account');
    await this.pool.query(
      `CREATE TABLE account(
          id serial primary key,
          name varchar(255) NOT NULL,
          address varchar(255) NOT NULL,
          index integer)`
    );

    const users: IKeyValue = this.getUsers();
    await this.pool.query(format(`INSERT INTO account(${users.keys}) VALUES %L`, users.values));

    await this.pool.query('DROP TABLE IF EXISTS transaction');
    await this.pool.query(
      `CREATE TABLE transaction(
            id serial primary key,
            involvesWatchonly boolean,
            account varchar(255) not null,
            address varchar(255) not null,
            category varchar(255),
            amount decimal,
            label varchar(255),
            confirmations integer,
            blockhash varchar(255) not null,
            blockindex integer,
            blocktime varchar(255),
            txid varchar(255),
            vout integer,
            walletconflicts text,
            time varchar(255),
            timereceived varchar(255),
            bip125replaceable varchar(255))`
    )

    const transactions: IKeyValue = this.getTransactions();
    await this.pool.query(format(`INSERT INTO transaction(${transactions.keys}) VALUES %L`, transactions.values))
  }

  /**
   * Prints the deposit information
   */
  async printDepositInformation(): Promise<void> {
    const data: QueryResult<any> = await this.pool.query(
      `SELECT acc.name, COUNT(ts.id), SUM(ts.amount)
        FROM transaction ts
        LEFT JOIN account as acc ON ts.address = acc.address
        WHERE ts.confirmations > 5
        AND ts.amount > 0
        AND ts.category IN ('receive', 'generate')
        GROUP BY acc.name, acc.id
        ORDER BY acc.id`
    )

    data.rows.map((row: { name: string; count: number; sum: number }) => {
      const sum = parseFloat(row.sum.toString()).toFixed(8)
      row.name == null
        ? console.log(
          `Deposited without reference: count=${row.count} sum=${sum}`,
        )
        : console.log(
          `Deposited for ${row.name}: count=${row.count} sum=${sum}`,
        )
    })

    const minMax: QueryResult<any> = await this.pool.query(
      `SELECT MIN(amount), MAX(amount)
        FROM transaction
        WHERE confirmations > 5
        AND amount > 0`
    )

    const min = parseFloat(minMax.rows[0].min).toFixed(8)
    const max = parseFloat(minMax.rows[0].max).toFixed(8)
    console.log(`Smallest valid deposit: ${min}`)
    console.log(`Largest valid deposit: ${max}`)
    this.pool.end();
  }

  /**
   * Gets the transactions with key value format for inserting to database.
   * 
   * @returns 
   */
  getTransactions(): IKeyValue {
    const importedTransactions: Array<ITransaction> = [
      ...transactionsData1.transactions,
      ...transactionsData2.transactions,
    ];
    const transactions = this.removeDuplicates(importedTransactions);

    let result: Array<ITransaction> = transactions
      .map((transaction: ITransaction) => this.convertTransaction(transaction));

    const keys = Object.keys(result[0])

    return {
      keys: keys.join(', '),
      values: result.map((transaction: ITransaction) => Object.values(transaction))
    }
  }

  /**
   * Converts Transactions to the ITransaction
   * Only for the properties we need
   * 
   * @param transaction 
   * @returns 
   */
  convertTransaction(transaction: ITransaction): ITransaction {
    return {
      involvesWatchonly: transaction.involvesWatchonly,
      account: transaction.account,
      address: transaction.address,
      category: transaction.category,
      amount: transaction.amount,
      label: transaction.label,
      confirmations: transaction.confirmations,
      blockhash: transaction.blockhash,
      blockindex: transaction.blockindex,
      blocktime: transaction.blocktime,
      txid: transaction.txid,
      vout: transaction.vout,
      walletconflicts: JSON.stringify(transaction.walletconflicts),
      time: transaction.time,
      timereceived: transaction.timereceived,
    }
  }

  /**
   * Gets users list with values only without key attributes
   * 
   * @returns {array} users
   */
  getUsers(): IKeyValue {
    const userKeys = ['name', 'address', 'index']
    return {
      keys: userKeys.join(', '),
      values: userData.map(user => Object.values(user))
    }
  }


  /**
   * Removes the dublicated data from imported transactions
   * Returns unique transactions
   * 
   * @param {Array<ITransaction>} importedTransactions - imported transactions
   * @returns {Array<ITransaction>}
   */
  public removeDuplicates(importedTransactions: Array<ITransaction>) {
    const transactions: Array<ITransaction> = [];
    for (const transaction of importedTransactions) {
      if (transactions.find((ts: ITransaction) => ts.txid === transaction.txid)) continue;
      transactions.push(transaction);
    }
    return transactions;
  }
}