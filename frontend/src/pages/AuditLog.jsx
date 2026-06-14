import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import api from '../services/api'

const ACTION_COLORS = {
  CREATE_CUSTOMER: 'badge-green',
  UPDATE_CUSTOMER: 'badge-blue',
  DELETE_CUSTOMER: 'badge-red',
  CREATE_ACCOUNT:  'badge-green',
  DEPOSIT:         'badge-green',
  WITHDRAWAL:      'badge-yellow',
  CREATE_LOAN:     'badge-blue',
  APPROVE_LOAN:    'badge-green',
  REJECT_LOAN:     'badge-red',
  DISBURSE_LOAN:   'badge-purple',
  RECORD_REPAYMENT:'badge-green',
  CREATE_BRANCH:   'badge-blue',
  UPDATE_BRANCH:   'badge-blue',
  DELETE_BRANCH:   'badge-red',
}

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')

  useEffect(() => {
    api.get('/audit')
      .then(({ data }) => setLogs(data.data || data))
      .finally(() => setLoading(false))
  }, [])

  const actions = ['all', ...new Set(logs.map((l) => l.action).filter(Boolean))]

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase()
    const matchSearch =
      l.action?.toLowerCase().includes(q) ||
      l.user?.name?.toLowerCase().includes(q) ||
      l.user?.email?.toLowerCase().includes(q) ||
      JSON.stringify(l.details || {}).toLowerCase().includes(q)
    const matchAction = actionFilter === 'all' || l.action === actionFilter
    return matchSearch && matchAction
  })

  if (loading) return <Layout title="Audit Log"><Spinner /></Layout>

  return (
    <Layout title="Audit Log">
      <div className="page-header">
        <div>
          <h2 className="page-title">Audit Log</h2>
          <p className="page-subtitle">{logs.length} total events</p>
        </div>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          className="input max-w-xs"
          placeholder="Search by action, user…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input max-w-[220px]"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          {actions.map((a) => (
            <option key={a} value={a}>{a === 'all' ? 'All actions' : a.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Performed By</th>
              <th>IP Address</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-8">No audit events found.</td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log._id}>
                  <td className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <span className={ACTION_COLORS[log.action] || 'badge-gray'}>
                      {log.action?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="font-medium text-gray-900 text-sm">{log.user?.name || '—'}</div>
                    <div className="text-xs text-gray-400">{log.user?.email}</div>
                  </td>
                  <td className="font-mono text-xs text-gray-400">{log.ipAddress || '—'}</td>
                  <td className="max-w-xs">
                    {log.details ? (
                      <pre className="text-xs text-gray-500 whitespace-pre-wrap break-all">
                        {JSON.stringify(log.details, null, 2).slice(0, 200)}
                        {JSON.stringify(log.details).length > 200 ? '…' : ''}
                      </pre>
                    ) : '—'}
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
