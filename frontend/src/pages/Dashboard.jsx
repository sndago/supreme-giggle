import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import StatCard from '../components/StatCard'
import Spinner from '../components/Spinner'
import api from '../services/api'

const GHS = (n) =>
  `₵ ${Number(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const loanStatusBadge = (status) => {
  const map = {
    pending:   'badge-yellow',
    approved:  'badge-blue',
    rejected:  'badge-red',
    disbursed: 'badge-green',
    closed:    'badge-gray',
  }
  return <span className={map[status] || 'badge-gray'}>{status}</span>
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/reports/overview')
      .then(({ data }) => setOverview(data.data || data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout title="Dashboard"><Spinner /></Layout>
  if (error) return <Layout title="Dashboard"><div className="text-red-500 text-center py-10">{error}</div></Layout>

  // Backend shape: { totalCustomers, totalAccounts, totalSavings, totalOutstanding, activeLoans, pendingLoans, overdueLoans }
  const o = overview || {}

  return (
    <Layout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Customers"
          value={(o.totalCustomers ?? '—').toLocaleString()}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Accounts"
          value={(o.totalAccounts ?? '—').toLocaleString()}
          subtitle={GHS(o.totalSavings)}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
        <StatCard
          title="Active Loans"
          value={(o.activeLoans ?? '—').toLocaleString()}
          subtitle={GHS(o.totalOutstanding) + ' outstanding'}
          color="yellow"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Pending Loans"
          value={(o.pendingLoans ?? '—').toLocaleString()}
          subtitle="Awaiting approval"
          color="red"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Two-column info panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan summary */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Loan Portfolio</h3>
          <div className="space-y-3">
            {[
              { label: 'Active (Approved + Disbursed)', value: o.activeLoans ?? 0,  cls: 'bg-green-400' },
              { label: 'Pending Approval',              value: o.pendingLoans ?? 0, cls: 'bg-yellow-400' },
              { label: 'Overdue',                       value: o.overdueLoans ?? 0, cls: 'bg-red-400' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${cls}`} />
                <span className="text-sm text-gray-600 flex-1">{label}</span>
                <span className="text-sm font-semibold text-gray-900">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Outstanding</span>
              <span className="font-bold text-gray-900">{GHS(o.totalOutstanding)}</span>
            </div>
          </div>
        </div>

        {/* Account / savings summary */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Account Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-700">Total Accounts</span>
              <span className="text-sm font-bold text-blue-900">{o.totalAccounts ?? 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-700">Total Savings</span>
              <span className="text-sm font-bold text-green-900">{GHS(o.totalSavings)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Total Customers</span>
              <span className="text-sm font-bold text-gray-900">{o.totalCustomers ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
