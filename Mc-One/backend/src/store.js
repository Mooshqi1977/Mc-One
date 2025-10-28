import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

export const db = {
  users: new Map(), // userId -> { id, email, passwordHash }
  sessions: new Map(),
  accounts: new Map(), // accountId -> { id, userId, type, name, balance }
  cards: new Map(), // cardId -> { id, userId, type, last4, linkedAccountId }
  transactions: new Map(), // accountId -> [tx]
  crypto: {
    wallets: new Map(), // userId -> { balances: { [symbol]: number } }
    orders: new Map(), // userId -> [orders]
    trades: new Map(), // userId -> [trades]
  },
};

export function initStore() {
  if (db._initialized) return;
  db._initialized = true;
  // seed demo user
  const userId = nanoid();
  const email = 'demo@bank.local';
  const passwordHash = bcrypt.hashSync('demo1234', 10);
  db.users.set(userId, { id: userId, email, passwordHash });

  const checkingId = nanoid();
  const savingsId = nanoid();
  db.accounts.set(checkingId, { id: checkingId, userId, type: 'checking', name: 'Checking', balance: 2500_00 });
  db.accounts.set(savingsId, { id: savingsId, userId, type: 'savings', name: 'Savings', balance: 5000_00 });
  db.transactions.set(checkingId, []);
  db.transactions.set(savingsId, []);

  db.crypto.wallets.set(userId, { balances: { 'USD': 10000, 'BTC': 0, 'ETH': 0, 'SOL': 0 } });
  db.crypto.orders.set(userId, []);
  db.crypto.trades.set(userId, []);
}

export function findUserByEmail(email) {
  for (const user of db.users.values()) {
    if (user.email === email) return user;
  }
  return null;
}


