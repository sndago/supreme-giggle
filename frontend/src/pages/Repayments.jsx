import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import api from '../services/api'

const GHS = (n) =>
  `₵ ${Number(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const METHOD_LABELS = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  mobile_money: 'Mobile Money',
}

export default function Repayments() {
  const navigate = useNavigate()
  const [repayments, setRepayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState('all')

  useEffect(() => {
    api.get('/repayments')
      .then(({ data }) => setRepayments(data.data || data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = repayments.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch =
      r.loan?.loanNumber?.toLowerCase().includes(q) ||
      r.customer?.firstName?.toLowerCase().includes(q) ||
      r.customer?.lastName?.toLowerCase().includes(q) ||
      (r.reference || '').toLowerCase().includes(q)
    const matchMethod = methodFilter === 'all' || r.paymentMethod === methodFilter
    return matchSearch && matchMethod
  })

  const totalPaid = filtered.reduce((s, r) => s + (r.amount || 0), 0)

  if (loading) return <Layout title="Repayments"><Spinner /></Layout>

  return (
    <Layout title="Repayments">
      <div className="page-header">
        <div>
          <h2 className="page-title">Repayments</h2>
          <p className="page-subtitle">
            {repayments.length} total · {GHS(repayments.reduce((s, r) => s + (r.amount || 0), 0))} collected
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          className="input max-w-xs"
          placeholder="Search by loan #, customer, reference…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input max-w-[200px]"
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
        >
          <option value="all">All methods</option>
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="mobile_money">Mobile Money</option>
        </select>
      </div>

      {filtered.length !== repayments.length && (
        <p className="text-sm text-gray-500 mb-3">
          Showing {filtered.length} of {repayments.length} · Filtered total: {GHS(totalPaid)}
        </p>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Loan #</th>
              <th>Customer</th>
              <th>Amount Paid</th>
              <th>Balance After</th>
              <th>Method</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-8">
                  No repayments found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r._id}
                  className="cursor-pointer"
                  onClick={() => r.loan?._id && navigate(`/loans/${r.loan._id}`)}
                >
                  <td className="font-mono text-xs text-gray-500">{r.reference || '—'}</td>
                  <td className="font-mono text-xs text-blue-600">
                    {r.loan?.loanNumber || '—'}
                  </td>
                  <td className="font-medium text-gray-900">
                    {r.customer?.firstName} {r.customer?.lastName}
                  </td>
                  <td className="font-semibold text-green-600">{GHS(r.amount)}</td>
                  <td>{GHS(r.balanceAfter)}</td>
                  <td>
                    <span className="badge-blue">
                      {METHOD_LABELS[r.paymentMethod] || r.paymentMethod || '—'}
                    </span>
                  </td>
                  <td className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
