import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import { config } from './config.js';
import { initStore } from './store.js';
import { migrate } from './db.js';
import { seedDemoIfEmpty } from './db_seed.js';
import authRoutes from './routes/auth.js';
import accountsRoutes from './routes/accounts.js';
import transfersRoutes from './routes/transfers.js';
import cryptoRoutes from './routes/crypto.js';
import { startPriceFeed, onPriceSubscribe } from './services/priceFeed.js';

const app = express();
app.use(cors({ origin: '*'}));
app.use(express.json());

// health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/transfers', transfersRoutes);
app.use('/api/crypto', cryptoRoutes);

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/prices' });

wss.on('connection', (socket) => {
  const unsubscribe = onPriceSubscribe((tick) => {
    try { socket.send(JSON.stringify({ type: 'price', data: tick })); } catch {}
  });
  socket.on('close', unsubscribe);
});

await migrate();
await seedDemoIfEmpty();
// Only seed in-memory demo when no database configured
if (!process.env.DATABASE_URL) {
  initStore();
}
startPriceFeed();

server.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://0.0.0.0:${config.port}`);
});


