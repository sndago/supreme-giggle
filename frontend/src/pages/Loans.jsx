import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import api from '../services/api'

const GHS = (n) =>
  `₵ ${Number(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const statusBadge = (status) => {
  const map = {
    pending:   'badge-yellow',
    approved:  'badge-blue',
    rejected:  'badge-red',
    disbursed: 'badge-green',
    closed:    'badge-gray',
  }
  return <span className={map[status] || 'badge-gray'}>{status}</span>
}

const STATUS_OPTIONS = ['all', 'pending', 'approved', 'rejected', 'disbursed', 'closed']

export default function Loans() {
  const navigate = useNavigate()
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    api.get('/loans')
      .then(({ data }) => setLoans(data.data || data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = loans.filter((l) => {
    const q = search.toLowerCase()
    const matchSearch = (
      l.loanNumber?.toLowerCase().includes(q) ||
      l.customer?.firstName?.toLowerCase().includes(q) ||
      l.customer?.lastName?.toLowerCase().includes(q)
    )
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  if (loading) return <Layout title="Loans"><Spinner /></Layout>

  const pending = loans.filter((l) => l.status === 'pending').length

  return (
    <Layout title="Loans">
      <div className="page-header">
        <div>
          <h2 className="page-title">Loans</h2>
          <p className="page-subtitle">
            {loans.length} total
            {pending > 0 && <span className="ml-2 badge-yellow">{pending} pending review</span>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input className="input max-w-xs" placeholder="Search by loan # or customer…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`btn btn-sm capitalize ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Loan #</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Rate</th>
              <th>Duration</th>
              <th>Monthly</th>
              <th>Outstanding</th>
              <th>Status</th>
              <th>Applied</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center text-gray-400 py-8">No loans found.</td></tr>
            ) : filtered.map((l) => (
              <tr key={l._id} className="cursor-pointer" onClick={() => navigate(`/loans/${l._id}`)}>
                <td className="font-mono text-xs text-gray-500">{l.loanNumber}</td>
                <td className="font-medium text-gray-900">
                  {l.customer?.firstName} {l.customer?.lastName}
                </td>
                <td>{GHS(l.amount)}</td>
                <td>{l.interestRate}%</td>
                <td>{l.durationMonths} mo</td>
                <td>{l.monthlyPayment ? GHS(l.monthlyPayment) : '—'}</td>
                <td>{GHS(l.outstandingBalance)}</td>
                <td>{statusBadge(l.status)}</td>
                <td className="text-xs text-gray-400">{new Date(l.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
