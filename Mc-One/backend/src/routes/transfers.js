import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../store.js';
import { getDb } from '../db.js';
import { nanoid } from 'nanoid';

const router = Router();

router.use(requireAuth);

function pushTx(accountId, tx) {
  const list = db.transactions.get(accountId) || [];
  list.unshift(tx);
  db.transactions.set(accountId, list);
}

router.post('/between-accounts', (req, res) => {
  const { fromAccountId, toAccountId, amountCents, memo } = req.body || {};
  if (!fromAccountId || !toAccountId || !amountCents) return res.status(400).json({ error: 'missing fields' });
  const pg = getDb();
  if (!pg) {
    const from = db.accounts.get(fromAccountId);
    const to = db.accounts.get(toAccountId);
    if (!from || !to || from.userId !== req.user.id || to.userId !== req.user.id) return res.status(400).json({ error: 'invalid accounts' });
    if (from.balance < amountCents) return res.status(400).json({ error: 'insufficient funds' });
    from.balance -= amountCents;
    to.balance += amountCents;
    const now = Date.now();
    const txId = nanoid();
    pushTx(from.id, { id: txId, type: 'transfer_out', amountCents, memo, createdAt: now, counterpartyAccountId: to.id });
    pushTx(to.id, { id: txId, type: 'transfer_in', amountCents, memo, createdAt: now, counterpartyAccountId: from.id });
    return res.json({ ok: true, balances: { [from.id]: from.balance, [to.id]: to.balance } });
  }
  (async()=>{
    const client = await pg.connect();
    try {
      await client.query('begin');
      const fromRow = await client.query('select id, user_id, balance_cents from accounts where id=$1 and user_id=$2 for update', [fromAccountId, req.user.id]);
      const toRow = await client.query('select id, user_id, balance_cents from accounts where id=$1 and user_id=$2 for update', [toAccountId, req.user.id]);
      if (fromRow.rowCount===0 || toRow.rowCount===0) throw new Error('invalid accounts');
      const fromBal = Number(fromRow.rows[0].balance_cents);
      if (fromBal < amountCents) throw new Error('insufficient funds');
      await client.query('update accounts set balance_cents=balance_cents-$1 where id=$2', [amountCents, fromAccountId]);
      await client.query('update accounts set balance_cents=balance_cents+$1 where id=$2', [amountCents, toAccountId]);
      const now = Date.now();
      const txId = nanoid();
      await client.query('insert into transactions(id,account_id,type,amount_cents,memo,created_at,counterparty_account_id) values ($1,$2,$3,$4,$5,$6,$7)', [txId, fromAccountId, 'transfer_out', amountCents, memo, now, toAccountId]);
      await client.query('insert into transactions(id,account_id,type,amount_cents,memo,created_at,counterparty_account_id) values ($1,$2,$3,$4,$5,$6,$7)', [txId, toAccountId, 'transfer_in', amountCents, memo, now, fromAccountId]);
      await client.query('commit');
      const b1 = await client.query('select balance_cents from accounts where id=$1', [fromAccountId]);
      const b2 = await client.query('select balance_cents from accounts where id=$1', [toAccountId]);
      res.json({ ok: true, balances: { [fromAccountId]: Number(b1.rows[0].balance_cents), [toAccountId]: Number(b2.rows[0].balance_cents) } });
    } catch (e) {
      await client.query('rollback');
      res.status(400).json({ error: e.message || 'transfer failed' });
    } finally { client.release(); }
  })().catch(()=> res.status(500).json({ error: 'db error' }));
});

router.post('/external', (req, res) => {
  const { fromAccountId, toIban, amountCents, memo } = req.body || {};
  const pg = getDb();
  if (!pg) {
    const from = db.accounts.get(fromAccountId);
    if (!from || from.userId !== req.user.id) return res.status(400).json({ error: 'invalid account' });
    if (from.balance < amountCents) return res.status(400).json({ error: 'insufficient funds' });
    from.balance -= amountCents;
    const now = Date.now();
    pushTx(from.id, { id: nanoid(), type: 'wire_out', amountCents, memo, createdAt: now, toIban });
    return res.json({ ok: true, balance: from.balance });
  }
  (async()=>{
    const client = await pg.connect();
    try {
      await client.query('begin');
      const fromRow = await client.query('select id, user_id, balance_cents from accounts where id=$1 and user_id=$2 for update', [fromAccountId, req.user.id]);
      if (fromRow.rowCount===0) throw new Error('invalid account');
      const fromBal = Number(fromRow.rows[0].balance_cents);
      if (fromBal < amountCents) throw new Error('insufficient funds');
      await client.query('update accounts set balance_cents=balance_cents-$1 where id=$2', [amountCents, fromAccountId]);
      const now = Date.now();
      await client.query('insert into transactions(id,account_id,type,amount_cents,memo,created_at,to_iban) values ($1,$2,$3,$4,$5,$6,$7)', [nanoid(), fromAccountId, 'wire_out', amountCents, memo, now, toIban]);
      await client.query('commit');
      const b1 = await client.query('select balance_cents from accounts where id=$1', [fromAccountId]);
      res.json({ ok: true, balance: Number(b1.rows[0].balance_cents) });
    } catch (e) {
      await client.query('rollback');
      res.status(400).json({ error: e.message || 'transfer failed' });
    } finally { client.release(); }
  })().catch(()=> res.status(500).json({ error: 'db error' }));
});

export default router;


