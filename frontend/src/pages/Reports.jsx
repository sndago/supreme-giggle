import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import StatCard from '../components/StatCard'
import api from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const GHS = (n) =>
  `₵ ${Number(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function Reports() {
  const [overview, setOverview] = useState(null)
  const [txSummary, setTxSummary] = useState(null)
  const [loanReport, setLoanReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reports/overview'),
      api.get('/reports/transactions'),
      api.get('/reports/loans'),
    ])
      .then(([o, t, l]) => {
        setOverview(o.data.data || o.data)
        setTxSummary(t.data.data || t.data)
        setLoanReport(l.data.data || l.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout title="Reports"><Spinner /></Layout>

  const loanPieData = overview?.loans
    ? Object.entries(overview.loans)
        .filter(([k]) => ['pending', 'approved', 'disbursed', 'rejected', 'closed'].includes(k))
        .map(([name, value]) => ({ name, value }))
    : []

  // Backend shape: { deposits: { total, count }, withdrawals: { total, count }, netFlow }
  const txBarData = txSummary
    ? [
        { name: 'Deposits',    count: txSummary.deposits?.count ?? 0,    amount: txSummary.deposits?.total ?? 0 },
        { name: 'Withdrawals', count: txSummary.withdrawals?.count ?? 0, amount: txSummary.withdrawals?.total ?? 0 },
      ]
    : []

  return (
    <Layout title="Reports">
      <div className="page-header">
        <div>
          <h2 className="page-title">Reports</h2>
          <p className="page-subtitle">Financial overview and summaries</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Customers"
          value={(overview?.totalCustomers ?? '—').toLocaleString()}
          color="blue"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard
          title="Total Deposits (All-time)"
          value={GHS(txSummary?.deposits?.total)}
          subtitle={`${txSummary?.deposits?.count ?? 0} transactions`}
          color="green"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
        />
        <StatCard
          title="Total Withdrawals"
          value={GHS(txSummary?.withdrawals?.total)}
          subtitle={`${txSummary?.withdrawals?.count ?? 0} transactions`}
          color="red"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>}
        />
        <StatCard
          title="Total Outstanding"
          value={GHS(overview?.totalOutstanding)}
          color="yellow"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Loan Status Pie */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Loan Portfolio by Status</h3>
          {loanPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={loanPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {loanPieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-sm text-gray-400 py-10 text-center">No loan data available.</div>
          )}
        </div>

        {/* Transaction Bar */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Transaction Volume by Type</h3>
          {txBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={txBarData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(val, name) => [
                    name === 'amount' ? GHS(val) : val,
                    name === 'amount' ? 'Volume (GHS)' : 'Count',
                  ]}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="count" />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} name="amount" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-sm text-gray-400 py-10 text-center">No transaction data available.</div>
          )}
        </div>
      </div>

      {/* Loan Report Table */}
      {loanReport?.byStatus && (
        <div className="card p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Loan Summary by Status</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Total Amount</th>
                  <th>Total Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {loanReport.byStatus.map((row) => (
                  <tr key={row._id}>
                    <td className="capitalize font-medium">{row._id}</td>
                    <td>{row.count}</td>
                    <td>{GHS(row.totalAmount)}</td>
                    <td>{GHS(row.totalOutstanding)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Account Summary — from flat overview shape */}
      {overview && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Account Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-blue-700">{overview.totalAccounts ?? 0}</div>
              <div className="text-sm text-blue-600 mt-1">Total Accounts</div>
            </div>
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-green-700">{GHS(overview.totalSavings)}</div>
              <div className="text-sm text-green-600 mt-1">Total Savings</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-xl text-center">
              <div className="text-2xl font-bold text-yellow-700">{GHS(overview.totalOutstanding)}</div>
              <div className="text-sm text-yellow-600 mt-1">Loan Outstanding</div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
