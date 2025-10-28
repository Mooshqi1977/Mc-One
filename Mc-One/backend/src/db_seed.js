import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { getDb } from './db.js';

export async function seedDemoIfEmpty(){
  const db = getDb();
  if (!db) return;
  const u = await db.query('select count(1) from users');
  if (Number(u.rows[0].count) > 0) return;
  const userId = nanoid();
  const email = 'demo@bank.local';
  const passwordHash = bcrypt.hashSync('demo1234', 10);
  await db.query('insert into users(id,email,password_hash) values ($1,$2,$3)', [userId, email, passwordHash]);
  const checkingId = nanoid();
  const savingsId = nanoid();
  await db.query('insert into accounts(id,user_id,type,name,balance_cents) values ($1,$2,$3,$4,$5),($6,$2,$7,$8,$9)', [
    checkingId, userId, 'checking', 'Checking', 250000,
    savingsId, 'savings', 'Savings', 500000,
  ]);
  await db.query('insert into wallet_balances(user_id,currency,amount) values ($1,$2,$3)', [userId, 'USD', 10000]);
}






