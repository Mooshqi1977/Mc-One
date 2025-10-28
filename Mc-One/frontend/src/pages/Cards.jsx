import React, { useEffect, useState } from 'react'
import API from '../lib/api'
import Nav from '../components/Nav'

export default function Cards(){
  const [cards, setCards] = useState([])
  const [accounts, setAccounts] = useState([])
  const [type, setType] = useState('virtual')
  const [linked, setLinked] = useState('')
  async function load(){
    const [c, a] = await Promise.all([API.cards(), API.accounts()])
    setCards(c.cards); setAccounts(a.accounts); if (a.accounts[0]) setLinked(a.accounts[0].id)
  }
  useEffect(()=>{ load() },[])
  async function create(){ await API.createCard(type, linked); await load() }
  return (
    <div style={{fontFamily:'system-ui'}}>
      <Nav />
      <div style={{padding:16}}>
        <h3>Cards</h3>
        <ul>
          {cards.map(c=> (
            <li key={c.id}>{c.type} **** **** **** {c.last4} (acct {c.linkedAccountId})</li>
          ))}
        </ul>
        <div>
          <select value={type} onChange={e=>setType(e.target.value)}>
            <option value="virtual">Virtual</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
          <select value={linked} onChange={e=>setLinked(e.target.value)}>
            {accounts.map(a=> <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <button onClick={create}>Create</button>
        </div>
      </div>
    </div>
  )
}






