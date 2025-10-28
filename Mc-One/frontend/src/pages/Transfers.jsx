import React, { useEffect, useState } from 'react'
import API from '../lib/api'
import Nav from '../components/Nav'

export default function Transfers(){
  const [accounts, setAccounts] = useState([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('0.00')
  const [iban, setIban] = useState('')
  const [memo, setMemo] = useState('')
  useEffect(()=>{ API.accounts().then(r=>{ setAccounts(r.accounts); if(r.accounts[0]) setFrom(r.accounts[0].id) }) },[])
  return (
    <div style={{fontFamily:'system-ui'}}>
      <Nav />
      <div style={{padding:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <div>
          <h3>Between my accounts</h3>
          <div>
            <select value={from} onChange={e=>setFrom(e.target.value)}>
              {accounts.map(a=> <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select value={to} onChange={e=>setTo(e.target.value)}>
              <option value="">Select target</option>
              {accounts.filter(a=>a.id!==from).map(a=> <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <input value={amount} onChange={e=>setAmount(e.target.value)} />
            <input placeholder="memo" value={memo} onChange={e=>setMemo(e.target.value)} />
            <button onClick={async()=>{
              const cents = Math.round(parseFloat(amount||'0')*100)
              await API.transferBetween(from, to, cents, memo)
              alert('Transfer complete')
            }}>Transfer</button>
          </div>
        </div>
        <div>
          <h3>External transfer</h3>
          <div>
            <select value={from} onChange={e=>setFrom(e.target.value)}>
              {accounts.map(a=> <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <input placeholder="Recipient IBAN/Acct" value={iban} onChange={e=>setIban(e.target.value)} />
            <input value={amount} onChange={e=>setAmount(e.target.value)} />
            <button onClick={async()=>{
              const cents = Math.round(parseFloat(amount||'0')*100)
              await API.transferExternal(from, iban, cents, memo)
              alert('Wire sent')
            }}>Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}






