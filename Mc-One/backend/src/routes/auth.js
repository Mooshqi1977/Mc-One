import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, findUserByEmail } from '../store.js';
import { config } from '../config.js';
import { nanoid } from 'nanoid';
import { getDb } from '../db.js';

const router = Router();

router.post('/register', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const pg = getDb();
  if (!pg) {
    if (findUserByEmail(email)) return res.status(400).json({ error: 'email already registered' });
    const id = nanoid();
    const passwordHash = bcrypt.hashSync(password, 10);
    db.users.set(id, { id, email, passwordHash });
    return res.json({ ok: true });
  }
  (async()=>{
    const exists = await pg.query('select 1 from users where email=$1', [email]);
    if (exists.rowCount > 0) return res.status(400).json({ error: 'email already registered' });
    const id = nanoid();
    const passwordHash = bcrypt.hashSync(password, 10);
    await pg.query('insert into users(id,email,password_hash) values ($1,$2,$3)', [id, email, passwordHash]);
    res.json({ ok: true });
  })().catch(()=> res.status(500).json({ error: 'db error' }));
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const pg = getDb();
  if (!pg) {
    const user = findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    if (!bcrypt.compareSync(password, user.passwordHash)) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, { expiresIn: '12h' });
    return res.json({ token, user: { id: user.id, email: user.email } });
  }
  (async()=>{
    const row = await pg.query('select id, email, password_hash from users where email=$1', [email]);
    const user = row.rows[0];
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, { expiresIn: '12h' });
    res.json({ token, user: { id: user.id, email: user.email } });
  })().catch(()=> res.status(500).json({ error: 'db error' }));
});

export default router;


