import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import api from '../services/api'

const GHS = (n) =>
  `₵ ${Number(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function Accounts() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    api.get('/accounts')
      .then(({ data }) => setAccounts(data.data || data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = accounts.filter((a) => {
    const q = search.toLowerCase()
    const matchSearch = (
      a.accountNumber?.toLowerCase().includes(q) ||
      a.customer?.firstName?.toLowerCase().includes(q) ||
      a.customer?.lastName?.toLowerCase().includes(q) ||
      a.customer?.customerNumber?.toLowerCase().includes(q)
    )
    const matchType = typeFilter === 'all' || a.type === typeFilter
    return matchSearch && matchType
  })

  const totalBalance = filtered.reduce((sum, a) => sum + (a.balance || 0), 0)

  if (loading) return <Layout title="Accounts"><Spinner /></Layout>

  return (
    <Layout title="Accounts">
      <div className="page-header">
        <div>
          <h2 className="page-title">Accounts</h2>
          <p className="page-subtitle">{accounts.length} total · Total balance: {GHS(accounts.reduce((s, a) => s + (a.balance || 0), 0))}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          className="input max-w-xs"
          placeholder="Search by account # or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input max-w-[160px]" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All types</option>
          <option value="savings">Savings</option>
          <option value="current">Current</option>
        </select>
      </div>

      {filtered.length !== accounts.length && (
        <p className="text-sm text-gray-500 mb-3">
          Showing {filtered.length} of {accounts.length} · Filtered balance: {GHS(totalBalance)}
        </p>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Account #</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Balance</th>
              <th>Currency</th>
              <th>Status</th>
              <th>Opened</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-8">No accounts found.</td>
              </tr>
            ) : filtered.map((a) => (
              <tr key={a._id} className="cursor-pointer"
                onClick={() => navigate(`/customers/${a.customer?._id || a.customer}`)}
              >
                <td className="font-mono text-xs text-gray-500">{a.accountNumber}</td>
                <td className="font-medium text-gray-900">
                  {a.customer?.firstName} {a.customer?.lastName}
                  <div className="text-xs text-gray-400 font-mono">{a.customer?.customerNumber}</div>
                </td>
                <td className="capitalize">
                  <span className={a.type === 'savings' ? 'badge-blue' : 'badge-purple'}>{a.type}</span>
                </td>
                <td className="font-semibold text-gray-900">{GHS(a.balance)}</td>
                <td className="text-gray-500">{a.currency || 'GHS'}</td>
                <td>
                  <span className={a.isActive ? 'badge-green' : 'badge-red'}>
                    {a.isActive ? 'Active' : 'Closed'}
                  </span>
                </td>
                <td className="text-gray-400 text-xs">{new Date(a.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
