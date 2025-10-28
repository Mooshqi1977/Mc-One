import React, { useEffect, useState } from 'react'
import API from '../lib/api'
import Nav from '../components/Nav'

export default function Accounts(){
  const [accounts, setAccounts] = useState([])
  const [type, setType] = useState('checking')
  const [name, setName] = useState('New Account')
  const [selected, setSelected] = useState(null)
  const [txs, setTxs] = useState([])
  async function load(){
    const r = await API.accounts(); setAccounts(r.accounts)
  }
  useEffect(()=>{ load() },[])
  async function create(){ await API.createAccount(type, name); await load() }
  useEffect(()=>{ if(selected) API.accountTransactions(selected).then(r=>setTxs(r.transactions)) },[selected])
  return (
    <div style={{fontFamily:'system-ui'}}>
      <Nav />
      <div style={{padding:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <div>
          <h3>Accounts</h3>
          <ul>
            {accounts.map(a=> (
              <li key={a.id} onClick={()=>setSelected(a.id)} style={{cursor:'pointer'}}>
                {a.name} - ${(a.balance/100).toFixed(2)}
              </li>
            ))}
          </ul>
          <div>
            <select value={type} onChange={e=>setType(e.target.value)}>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
            <input value={name} onChange={e=>setName(e.target.value)} />
            <button onClick={create}>Create</button>
          </div>
        </div>
        <div>
          <h3>Transactions</h3>
          <ul>
            {txs.map(tx=> (
              <li key={tx.id+String(tx.createdAt)}>
                {tx.type} {(tx.amountCents/100).toFixed(2)} {tx.memo || ''}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}






