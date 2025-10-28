import React, { useEffect, useMemo, useState } from 'react'
import API from '../lib/api'
import Nav from '../components/Nav'

const SYMBOLS = ['BTC-USD','ETH-USD','SOL-USD']

export default function Crypto(){
  const [wallet, setWallet] = useState({ balances: {} })
  const [prices, setPrices] = useState({})
  const [amount, setAmount] = useState('0.001')
  const [symbol, setSymbol] = useState('BTC-USD')
  const [trades, setTrades] = useState([])

  async function refresh(){
    const [w, p, t] = await Promise.all([
      API.wallet(),
      API.prices(SYMBOLS),
      API.trades(),
    ])
    setWallet(w); setPrices(p); setTrades(t.trades)
  }
  useEffect(()=>{ refresh() },[])

  useEffect(()=>{
    const ws = new WebSocket((location.protocol==='https:'?'wss':'ws')+'://'+location.host+'/ws/prices')
    ws.onmessage = (e)=>{
      const msg = JSON.parse(e.data)
      if (msg.type==='price') setPrices(prev=> ({ ...prev, [msg.data.symbol]: msg.data.price }))
    }
    return ()=> ws.close()
  },[])

  const usd = wallet.balances?.USD || 0
  const value = useMemo(()=>{
    let v = usd
    for (const s of SYMBOLS){
      const base = s.split('-')[0];
      v += (wallet.balances?.[base]||0) * (prices[s]||0)
    }
    return v
  },[wallet, prices])

  return (
    <div style={{fontFamily:'system-ui'}}>
      <Nav />
      <div style={{padding:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <div>
          <h3>Wallet (${value.toFixed(2)})</h3>
          <ul>
            {Object.entries(wallet.balances||{}).map(([k,v])=> (
              <li key={k}>{k}: {k==='USD'? v.toFixed(2) : v}</li>
            ))}
          </ul>
          <div>
            <input placeholder="Deposit USD" onKeyDown={async(e)=>{ if(e.key==='Enter'){ await API.deposit('USD', parseFloat(e.currentTarget.value)); await refresh() } }} />
          </div>
          <div>
            <select value={symbol} onChange={e=>setSymbol(e.target.value)}>
              {SYMBOLS.map(s=> <option key={s} value={s}>{s} ${(prices[s]||0).toFixed(2)}</option>)}
            </select>
            <input value={amount} onChange={e=>setAmount(e.target.value)} />
            <button onClick={async()=>{ await API.order('buy', symbol, parseFloat(amount)); await refresh() }}>Buy</button>
            <button onClick={async()=>{ await API.order('sell', symbol, parseFloat(amount)); await refresh() }}>Sell</button>
          </div>
        </div>
        <div>
          <h3>Trades</h3>
          <ul>
            {trades.map(t=> (<li key={t.id}>{t.side} {t.amount} {t.symbol} @ ${t.price.toFixed(2)}</li>))}
          </ul>
        </div>
      </div>
    </div>
  )
}






