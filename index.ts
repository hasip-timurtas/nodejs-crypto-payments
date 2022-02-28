import * as dotenv from 'dotenv';
import Transactions from './app/transactions';
import { Pool } from 'pg';
dotenv.config();

/**
 * Runs the application for priting the requested deposit informations
 */
async function run(): Promise<void> {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  });
  const transactions = new Transactions(pool);
  transactions.startPrintProcess();
}

run().catch((err) => console.log(err));