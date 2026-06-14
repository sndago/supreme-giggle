import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import api from '../services/api'

const GHS = (n) =>
  `₵ ${Number(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const [showModal, setShowModal] = useState(false)
  const [txType, setTxType] = useState('deposit')
  const [form, setForm] = useState({ accountId: '', amount: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchAll = () => {
    Promise.all([api.get('/transactions'), api.get('/accounts')])
      .then(([t, a]) => {
        setTransactions(t.data.data || t.data)
        setAccounts((a.data.data || a.data).filter((acc) => acc.isActive))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase()
    const matchSearch = (
      t.reference?.toLowerCase().includes(q) ||
      t.customer?.firstName?.toLowerCase().includes(q) ||
      t.customer?.lastName?.toLowerCase().includes(q) ||
      t.account?.accountNumber?.toLowerCase().includes(q)
    )
    const matchType = typeFilter === 'all' || t.type === typeFilter
    return matchSearch && matchType
  })

  const openModal = (type) => {
    setTxType(type)
    setForm({ accountId: '', amount: '', description: '' })
    setError('')
    setSuccess('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const endpoint = txType === 'deposit' ? '/transactions/deposit' : '/transactions/withdraw'
      await api.post(endpoint, {
        accountId: form.accountId,
        amount: Number(form.amount),
        description: form.description,
      })
      setShowModal(false)
      setSuccess(`${txType === 'deposit' ? 'Deposit' : 'Withdrawal'} of ${GHS(form.amount)} recorded successfully.`)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Layout title="Transactions"><Spinner /></Layout>

  return (
    <Layout title="Transactions">
      <div className="page-header">
        <div>
          <h2 className="page-title">Transactions</h2>
          <p className="page-subtitle">{transactions.length} total transactions</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-success" onClick={() => openModal('deposit')}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Deposit
          </button>
          <button className="btn-danger" onClick={() => openModal('withdrawal')}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
            Withdraw
          </button>
        </div>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center justify-between">
          {success}
          <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input className="input max-w-xs" placeholder="Search by reference, customer, account…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input max-w-[160px]" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All types</option>
          <option value="deposit">Deposits</option>
          <option value="withdrawal">Withdrawals</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Customer</th>
              <th>Account</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Balance After</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-gray-400 py-8">No transactions found.</td></tr>
            ) : filtered.map((t) => (
              <tr key={t._id}>
                <td className="font-mono text-xs text-gray-500">{t.reference}</td>
                <td className="font-medium text-gray-900">
                  {t.customer?.firstName} {t.customer?.lastName}
                </td>
                <td className="font-mono text-xs text-gray-500">{t.account?.accountNumber}</td>
                <td>
                  <span className={t.type === 'deposit' ? 'badge-green' : 'badge-red'}>{t.type}</span>
                </td>
                <td className={`font-semibold ${t.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'deposit' ? '+' : '-'}{GHS(t.amount)}
                </td>
                <td>{GHS(t.balanceAfter)}</td>
                <td className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transaction Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={txType === 'deposit' ? 'Record Deposit' : 'Record Withdrawal'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="label">Account *</label>
            <select className="input" value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} required>
              <option value="">Select account…</option>
              {accounts.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.accountNumber} — {a.customer?.firstName} {a.customer?.lastName} ({a.type}) · {GHS(a.balance)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Amount (GHS) *</label>
            <input type="number" min="0.01" step="0.01" className="input" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional note…" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className={txType === 'deposit' ? 'btn-success' : 'btn-danger'} disabled={saving}>
              {saving ? 'Processing…' : (txType === 'deposit' ? 'Deposit' : 'Withdraw')}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
