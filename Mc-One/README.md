MC One Bank (Demo)

Demo banking web app for Synology NAS deployment.

- Backend: Node.js (Express)
- Frontend: React (Vite)
- Features: Login, accounts, cards, transactions, transfers, crypto wallet and paper trading with live price feed (WebSocket)

Local Development

Backend

```bash
cd backend
npm install
npm run dev
```

Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

Demo: `demo@bank.local` / `demo1234`

API Overview

- POST `/api/auth/register` { email, password }
- POST `/api/auth/login` { email, password } -> { token }
- GET `/api/accounts`
- POST `/api/accounts` { type, name }
- GET `/api/accounts/:id/transactions`
- GET `/api/accounts/cards/all`
- POST `/api/accounts/cards` { type: virtual|debit|credit, linkedAccountId }
- POST `/api/transfers/between-accounts` { fromAccountId, toAccountId, amountCents, memo }
- POST `/api/transfers/external` { fromAccountId, toIban, amountCents, memo }
- GET `/api/crypto/wallet`
- POST `/api/crypto/deposit` { currency, amount }
- GET `/api/crypto/prices?symbols=BTC-USD,ETH-USD`
- POST `/api/crypto/order` { side: buy|sell, symbol, amount }
- GET `/api/crypto/trades`
- WS: `/ws/prices`

Docker (Synology)

From repo root:

```bash
docker compose build
docker compose up -d
```

- Backend on port 8080
- Frontend on port 5173 (dev) or use nginx Dockerfile to serve build

Environment Variables

- `JWT_SECRET` (backend) – set a strong secret
- `PRICE_SYMBOLS` (backend) – default `BTC-USD,ETH-USD,SOL-USD`
 - `PRICE_PROVIDER` (backend) – `random` | `binance` | `coinbase`
 - `DATABASE_URL` (backend) – e.g. `postgres://mcuser:mcpassword@localhost:5432/mcdb`

Postgres via Docker Compose

```bash
docker compose up -d postgres
# then bring up backend with DB connection
docker compose up -d backend
```

Set `PRICE_PROVIDER=binance` (or `coinbase`) to enable live pricing.

Notes

- Data is in-memory only (demo). Replace with a database for persistence on Synology and mount volumes.


