import Transactions from './transactions';
import { ITransaction, IKeyValue } from './types';
import { Pool } from 'pg'

const transaction = new Transactions(new Pool());

describe('Transactions', () => {
  test('Should remove duplicated data', () => {
    const testDuplicatedData: ITransaction[] = [{
      "involvesWatchonly": true,
      "account": "",
      "address": "myAre6hq8uSDAzhmNit1fjkTeajebBzrKZ",
      "category": "receive",
      "amount": 36.9759613,
      "label": "",
      "confirmations": 42,
      "blockhash": "ceea46e555518b0c7e858476ca2259b1ca91832ea6b35a8e135ac30d9ab7360b",
      "blockindex": 59,
      "blocktime": 1627633348873,
      "txid": "697c9b177ffd64ce3a9ed4814c08d95254095863f3b07867f7fe0f457c474be2",
      "vout": 5,
      "walletconflicts": [],
      "time": 1627633337048,
      "timereceived": 1627633337048,
    },
    {
      "involvesWatchonly": true,
      "account": "",
      "address": "mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n",
      "category": "receive",
      "amount": 9.19,
      "label": "",
      "confirmations": 2,
      "blockhash": "8aa7f8a5d5db094089dcbfbada744f0542e02d01d12c76c0c3ad039afa63ef5b",
      "blockindex": 41,
      "blocktime": 1627657348873,
      "txid": "697c9b177ffd64ce3a9ed4814c08d95254095863f3b07867f7fe0f457c474be2",
      "vout": 9,
      "walletconflicts": [],
      "time": 1627657303461,
      "timereceived": 1627657303461,
    }]

    const transactions: Array<ITransaction> = transaction.removeDuplicates(testDuplicatedData);
    expect(transactions.length).toBe(1)
  })

  test('Should return transactions', () => {
    const users: IKeyValue = transaction.getTransactions();
    expect(users.values.length).toBeGreaterThan(0)
  })
})


describe('Users', () => {
  test('Should return users', () => {
    const totalUserAmount = 7;
    const users: IKeyValue = transaction.getUsers();
    expect(users.values.length).toBe(totalUserAmount)
  })
})