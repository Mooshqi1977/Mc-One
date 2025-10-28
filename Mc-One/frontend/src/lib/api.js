const API = {
  async request(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
    const token = localStorage.getItem('token')
    if (token) headers.Authorization = `Bearer ${token}`
    const res = await fetch(`/api${path}`, { ...opts, headers })
    if (!res.ok) throw new Error((await res.json()).error || 'Request failed')
    return res.json()
  },
  login(email, password) { return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }) },
  register(email, password) { return this.request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }) },
  accounts() { return this.request('/accounts') },
  accountTransactions(id) { return this.request(`/accounts/${id}/transactions`) },
  createAccount(type, name) { return this.request('/accounts', { method: 'POST', body: JSON.stringify({ type, name }) }) },
  cards() { return this.request('/accounts/cards/all') },
  createCard(type, linkedAccountId) { return this.request('/accounts/cards', { method: 'POST', body: JSON.stringify({ type, linkedAccountId }) }) },
  transferBetween(fromAccountId, toAccountId, amountCents, memo) { return this.request('/transfers/between-accounts', { method: 'POST', body: JSON.stringify({ fromAccountId, toAccountId, amountCents, memo }) }) },
  transferExternal(fromAccountId, toIban, amountCents, memo) { return this.request('/transfers/external', { method: 'POST', body: JSON.stringify({ fromAccountId, toIban, amountCents, memo }) }) },
  wallet() { return this.request('/crypto/wallet') },
  deposit(currency, amount) { return this.request('/crypto/deposit', { method: 'POST', body: JSON.stringify({ currency, amount }) }) },
  prices(symbols) { return this.request(`/crypto/prices?symbols=${symbols.join(',')}`) },
  order(side, symbol, amount) { return this.request('/crypto/order', { method: 'POST', body: JSON.stringify({ side, symbol, amount }) }) },
  trades() { return this.request('/crypto/trades') },
}

export default API






