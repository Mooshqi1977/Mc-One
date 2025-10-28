import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { db, findUserByEmail } from '../store.js';
import { getDb } from '../db.js';
import { nanoid } from 'nanoid';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  const pg = getDb();
  if (!pg) {
    const accounts = [];
    for (const acc of db.accounts.values()) if (acc.userId === req.user.id) accounts.push(acc);
    return res.json({ accounts });
  }
  (async()=>{
    const rows = (await pg.query('select id, user_id, type, name, balance_cents from accounts where user_id=$1', [req.user.id])).rows;
    res.json({ accounts: rows.map(r=> ({ id: r.id, userId: r.user_id, type: r.type, name: r.name, balance: Number(r.balance_cents) })) });
  })().catch(()=> res.status(500).json({ error: 'db error' }));
});

router.get('/:id/transactions', (req, res) => {
  const { id } = req.params;
  const pg = getDb();
  if (!pg) {
    const acc = db.accounts.get(id);
    if (!acc || acc.userId !== req.user.id) return res.status(404).json({ error: 'not found' });
    return res.json({ transactions: db.transactions.get(id) || [] });
  }
  (async()=>{
    const rows = (await pg.query('select id, account_id, type, amount_cents, memo, created_at, counterparty_account_id, to_iban from transactions where account_id=$1 order by created_at desc limit 200', [id])).rows;
    res.json({ transactions: rows.map(r=> ({ id: r.id, type: r.type, amountCents: Number(r.amount_cents), memo: r.memo, createdAt: Number(r.created_at), counterpartyAccountId: r.counterparty_account_id, toIban: r.to_iban })) });
  })().catch(()=> res.status(500).json({ error: 'db error' }));
});

router.post('/', (req, res) => {
  const { type, name } = req.body || {};
  if (!type || !name) return res.status(400).json({ error: 'type and name required' });
  const id = nanoid();
  const pg = getDb();
  if (!pg) {
    const account = { id, userId: req.user.id, type, name, balance: 0 };
    db.accounts.set(id, account); db.transactions.set(id, []);
    return res.json({ account });
  }
  (async()=>{
    await pg.query('insert into accounts(id,user_id,type,name,balance_cents) values ($1,$2,$3,$4,$5)', [id, req.user.id, type, name, 0]);
    res.json({ account: { id, userId: req.user.id, type, name, balance: 0 } });
  })().catch(()=> res.status(500).json({ error: 'db error' }));
});

router.get('/cards/all', (req, res) => {
  const pg = getDb();
  if (!pg) {
    const cards = [];
    for (const c of db.cards.values()) if (c.userId === req.user.id) cards.push(c);
    return res.json({ cards });
  }
  (async()=>{
    const rows = (await pg.query('select id, user_id, type, last4, linked_account_id from cards where user_id=$1', [req.user.id])).rows;
    res.json({ cards: rows.map(r=> ({ id: r.id, userId: r.user_id, type: r.type, last4: r.last4, linkedAccountId: r.linked_account_id })) });
  })().catch(()=> res.status(500).json({ error: 'db error' }));
});

router.post('/cards', (req, res) => {
  const { type, linkedAccountId } = req.body || {};
  if (!['virtual', 'debit', 'credit'].includes(type)) return res.status(400).json({ error: 'invalid card type' });
  const id = nanoid();
  const last4 = String(Math.floor(1000 + Math.random() * 9000));
  const pg = getDb();
  if (!pg) {
    const acc = db.accounts.get(linkedAccountId);
    if (!acc || acc.userId !== req.user.id) return res.status(400).json({ error: 'invalid account' });
    const card = { id, userId: req.user.id, type, last4, linkedAccountId };
    db.cards.set(id, card);
    return res.json({ card });
  }
  (async()=>{
    // ensure account belongs to user
    const a = await pg.query('select id from accounts where id=$1 and user_id=$2',[linkedAccountId, req.user.id]);
    if (a.rowCount === 0) return res.status(400).json({ error: 'invalid account' });
    await pg.query('insert into cards(id,user_id,type,last4,linked_account_id) values ($1,$2,$3,$4,$5)', [id, req.user.id, type, last4, linkedAccountId]);
    res.json({ card: { id, userId: req.user.id, type, last4, linkedAccountId } });
  })().catch(()=> res.status(500).json({ error: 'db error' }));
});

export default router;


