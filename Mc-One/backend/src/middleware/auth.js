import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { db } from '../store.js';
import { getDb } from '../db.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const pg = getDb();
    if (!pg) {
      const user = db.users.get(payload.sub);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      req.user = user; return next();
    }
    (async()=>{
      const row = await pg.query('select id, email from users where id=$1', [payload.sub]);
      const user = row.rows[0];
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      req.user = { id: user.id, email: user.email };
      next();
    })().catch(()=> res.status(401).json({ error: 'Unauthorized' }));
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}


