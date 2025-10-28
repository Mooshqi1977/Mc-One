import { Pool } from 'pg';
import { config } from './config.js';

let pool = null;

export function getDb() {
  if (!config.databaseUrl) return null;
  if (!pool) pool = new Pool({ connectionString: config.databaseUrl });
  return pool;
}

export async function migrate() {
  const db = getDb();
  if (!db) return;
  await db.query(`
    create table if not exists users (
      id text primary key,
      email text unique not null,
      password_hash text not null
    );
    create table if not exists accounts (
      id text primary key,
      user_id text not null,
      type text not null,
      name text not null,
      balance_cents bigint not null
    );
    create table if not exists cards (
      id text primary key,
      user_id text not null,
      type text not null,
      last4 text not null,
      linked_account_id text not null
    );
    create table if not exists transactions (
      id text primary key,
      account_id text not null,
      type text not null,
      amount_cents bigint not null,
      memo text,
      created_at bigint not null,
      counterparty_account_id text,
      to_iban text
    );
    create table if not exists wallet_balances (
      user_id text not null,
      currency text not null,
      amount numeric not null,
      primary key (user_id, currency)
    );
    create table if not exists trades (
      id text primary key,
      user_id text not null,
      side text not null,
      symbol text not null,
      amount numeric not null,
      price numeric not null,
      ts bigint not null
    );
  `);
}


