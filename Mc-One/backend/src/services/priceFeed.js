import { config } from '../config.js';
import WebSocket from 'ws';

let listeners = new Set();
let prices = new Map();

export function startPriceFeed() {
  if (config.priceProvider === 'binance') return startBinance();
  if (config.priceProvider === 'coinbase') return startCoinbase();
  // fallback random
  for (const sym of config.priceSymbols) {
    const base = sym.startsWith('BTC') ? 65000 : sym.startsWith('ETH') ? 3000 : 150;
    prices.set(sym, base);
  }
  setInterval(tick, 1000);
}

function tick() {
  const now = Date.now();
  for (const sym of config.priceSymbols) {
    const last = prices.get(sym) || 100;
    const delta = (Math.random() - 0.5) * Math.max(1, last * 0.002);
    const next = Math.max(0.0001, last + delta);
    prices.set(sym, next);
    const payload = { symbol: sym, price: Number(next.toFixed(2)), ts: now };
    listeners.forEach((cb) => cb(payload));
  }
}

export function onPriceSubscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getPrice(symbol) {
  return prices.get(symbol);
}

function startBinance(){
  const streams = config.priceSymbols.map(s=> s.replace('-USD','USDT').toLowerCase()+'@trade').join('/');
  const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;
  const ws = new WebSocket(url);
  ws.on('message', (raw)=>{
    try {
      const msg = JSON.parse(raw.toString());
      const data = msg.data; // { s, p }
      const symbol = (String(data.s).endsWith('USDT')? String(data.s).slice(0,-4)+'-USD' : data.s);
      const price = Number(data.p);
      prices.set(symbol, price);
      const payload = { symbol, price, ts: Date.now() };
      listeners.forEach((cb)=> cb(payload));
    } catch {}
  });
  ws.on('error', ()=>{/* ignore */});
}

function startCoinbase(){
  const ws = new WebSocket('wss://ws-feed.exchange.coinbase.com');
  ws.on('open', ()=>{
    ws.send(JSON.stringify({ type: 'subscribe', product_ids: config.priceSymbols, channels: ['ticker'] }));
  });
  ws.on('message', (raw)=>{
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type !== 'ticker') return;
      const symbol = msg.product_id;
      const price = Number(msg.price);
      prices.set(symbol, price);
      const payload = { symbol, price, ts: Date.now() };
      listeners.forEach((cb)=> cb(payload));
    } catch {}
  });
  ws.on('error', ()=>{/* ignore */});
}


