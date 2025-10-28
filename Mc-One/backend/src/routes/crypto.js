import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { db } from '../store.js';
import { getDb } from '../db.js';
import { getPrice } from '../services/priceFeed.js';
import { nanoid } from 'nanoid';

const router = Router();
router.use(requireAuth);

router.get('/wallet', (req, res) => {
  const pg = getDb();
  if (!pg) {
    const wallet = db.crypto.wallets.get(req.user.id) || { balances: {} };
    return res.json(wallet);
  }
  (async()=>{
    const rows = (await pg.query('select currency, amount from wallet_balances where user_id=$1',[req.user.id])).rows;
    const balances = {};
    for (const r of rows) balances[r.currency] = Number(r.amount);
    res.json({ balances });
  })().catch(()=> res.status(500).json({ error: 'db error' }));
});

router.post('/deposit', (req, res) => {
  const { currency, amount } = req.body || {};
  if (!currency || !amount || amount <= 0) return res.status(400).json({ error: 'invalid deposit' });
  const pg = getDb();
  if (!pg) {
    const wallet = db.crypto.wallets.get(req.user.id) || { balances: {} };
    wallet.balances[currency] = (wallet.balances[currency] || 0) + amount;
    db.crypto.wallets.set(req.user.id, wallet);
    return res.json(wallet);
  }
  (async()=>{
    await pg.query('insert into wallet_balances(user_id,currency,amount) values ($1,$2,$3) on conflict (user_id,currency) do update set amount=wallet_balances.amount + EXCLUDED.amount', [req.user.id, currency, amount]);
    const rows = (await pg.query('select currency, amount from wallet_balances where user_id=$1',[req.user.id])).rows;
    const balances = {};
    for (const r of rows) balances[r.currency] = Number(r.amount);
    res.json({ balances });
  })().catch(()=> res.status(500).json({ error: 'db error' }));
});

router.get('/prices', (req, res) => {
  const symbols = req.query.symbols ? String(req.query.symbols).split(',') : [];
  const map = {};
  for (const s of symbols) map[s] = getPrice(s);
  res.json(map);
});

router.post('/order', (req, res) => {
  const { side, symbol, quoteCurrency = 'USD', amount } = req.body || {};
  if (!['buy', 'sell'].includes(side)) return res.status(400).json({ error: 'invalid side' });
  if (!symbol || !amount || amount <= 0) return res.status(400).json({ error: 'invalid order' });
  const price = getPrice(symbol);
  if (!price) return res.status(400).json({ error: 'unknown symbol' });
  const base = symbol.split('-')[0];
  const pg = getDb();
  if (!pg) {
    const wallet = db.crypto.wallets.get(req.user.id);
    if (!wallet) return res.status(400).json({ error: 'wallet missing' });
    if (side === 'buy') {
      const cost = amount * price;
      if ((wallet.balances[quoteCurrency] || 0) < cost) return res.status(400).json({ error: 'insufficient funds' });
      wallet.balances[quoteCurrency] -= cost;
      wallet.balances[base] = (wallet.balances[base] || 0) + amount;
    } else {
      if ((wallet.balances[base] || 0) < amount) return res.status(400).json({ error: 'insufficient asset' });
      wallet.balances[base] -= amount;
      wallet.balances[quoteCurrency] = (wallet.balances[quoteCurrency] || 0) + amount * price;
    }
    const trade = { id: nanoid(), side, symbol, amount, price, ts: Date.now() };
    const trades = db.crypto.trades.get(req.user.id) || [];
    trades.unshift(trade);
    db.crypto.trades.set(req.user.id, trades);
    return res.json({ trade, wallet });
  }
  (async()=>{
    const client = await pg.connect();
    try {
      await client.query('begin');
      const baseBal = await client.query('select amount from wallet_balances where user_id=$1 and currency=$2 for update', [req.user.id, base]);
      const quoteBal = await client.query('select amount from wallet_balances where user_id=$1 and currency=$2 for update', [req.user.id, quoteCurrency]);
      const baseAmt = Number(baseBal.rows[0]?.amount || 0);
      const quoteAmt = Number(quoteBal.rows[0]?.amount || 0);
      if (side==='buy'){
        const cost = amount * price;
        if (quoteAmt < cost) throw new Error('insufficient funds');
        await client.query('insert into wallet_balances(user_id,currency,amount) values ($1,$2,$3) on conflict (user_id,currency) do update set amount=wallet_balances.amount + EXCLUDED.amount', [req.user.id, base, amount]);
        await client.query('update wallet_balances set amount=amount-$1 where user_id=$2 and currency=$3', [cost, req.user.id, quoteCurrency]);
      } else {
        if (baseAmt < amount) throw new Error('insufficient asset');
        await client.query('update wallet_balances set amount=amount-$1 where user_id=$2 and currency=$3', [amount, req.user.id, base]);
        await client.query('insert into wallet_balances(user_id,currency,amount) values ($1,$2,$3) on conflict (user_id,currency) do update set amount=wallet_balances.amount + EXCLUDED.amount', [req.user.id, quoteCurrency, amount*price]);
      }
      const trade = { id: nanoid(), side, symbol, amount, price, ts: Date.now() };
      await client.query('insert into trades(id,user_id,side,symbol,amount,price,ts) values ($1,$2,$3,$4,$5,$6,$7)', [trade.id, req.user.id, side, symbol, amount, price, trade.ts]);
      await client.query('commit');
      const rows = (await pg.query('select currency, amount from wallet_balances where user_id=$1',[req.user.id])).rows;
      const balances = {}; for (const r of rows) balances[r.currency] = Number(r.amount);
      res.json({ trade, wallet: { balances } });
    } catch (e) {
      await client.query('rollback');
      res.status(400).json({ error: e.message || 'order failed' });
    } finally {
      client.release();
    }
  })().catch(()=> res.status(500).json({ error: 'db error' }));
});

router.get('/trades', (req, res) => {
  const pg = getDb();
  if (!pg) return res.json({ trades: db.crypto.trades.get(req.user.id) || [] });
  (async()=>{
    const rows = (await pg.query('select id, side, symbol, amount, price, ts from trades where user_id=$1 order by ts desc limit 200', [req.user.id])).rows;
    res.json({ trades: rows.map(r=> ({ id: r.id, side: r.side, symbol: r.symbol, amount: Number(r.amount), price: Number(r.price), ts: Number(r.ts) })) });
  })().catch(()=> res.status(500).json({ error: 'db error' }));
});

export default router;


