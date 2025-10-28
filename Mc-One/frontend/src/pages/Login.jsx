import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../lib/api'

export default function Login() {
  const [email, setEmail] = useState('demo@bank.local')
  const [password, setPassword] = useState('demo1234')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  async function submit(e){
    e.preventDefault()
    try {
      const { token } = await API.login(email, password)
      localStorage.setItem('token', token)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }
  return (
    <div style={{maxWidth: 360, margin: '60px auto', fontFamily: 'system-ui'}}>
      <h2>MC One Bank - Login</h2>
      <form onSubmit={submit}>
        <div>
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%'}} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%'}} />
        </div>
        {error && <div style={{color:'red'}}>{error}</div>}
        <button type="submit">Login</button>
      </form>
      <p>Demo: demo@bank.local / demo1234</p>
    </div>
  )
}






