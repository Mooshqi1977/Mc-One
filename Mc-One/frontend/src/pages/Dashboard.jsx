import React, { useEffect, useState } from 'react'
import API from '../lib/api'
import Nav from '../components/Nav'

export default function Dashboard(){
  const [accounts, setAccounts] = useState([])
  useEffect(()=>{ API.accounts().then(r=>setAccounts(r.accounts)) },[])
  const total = accounts.reduce((s,a)=>s+a.balance,0)
  return (
    <div style={{fontFamily:'system-ui'}}> 
      <Nav />
      <div style={{padding: 16}}>
        <h2>Overview</h2>
        <div>Total Balance: ${(total/100).toFixed(2)}</div>
        <ul>
          {accounts.map(a=> (
            <li key={a.id}>{a.name} - {a.type} - ${(a.balance/100).toFixed(2)}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}






