export const config = {
  port: process.env.PORT || 8080,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  priceSymbols: (process.env.PRICE_SYMBOLS || 'BTC-USD,ETH-USD,SOL-USD').split(','),
  databaseUrl: process.env.DATABASE_URL || '',
  priceProvider: process.env.PRICE_PROVIDER || 'random', // random | binance | coinbase
};


