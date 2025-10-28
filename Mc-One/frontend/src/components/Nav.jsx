import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Nav(){
  const navigate = useNavigate()
  function logout(){ localStorage.removeItem('token'); navigate('/login') }
  const linkStyle = { marginRight: 12 }
  return (
    <nav style={{padding: 12, borderBottom: '1px solid #ddd', marginBottom: 12}}>
      <Link to="/" style={linkStyle}>Dashboard</Link>
      <Link to="/accounts" style={linkStyle}>Accounts</Link>
      <Link to="/cards" style={linkStyle}>Cards</Link>
      <Link to="/transfers" style={linkStyle}>Transfers</Link>
      <Link to="/crypto" style={linkStyle}>Crypto</Link>
      <button onClick={logout} style={{float:'right'}}>Logout</button>
    </nav>
  )
}






