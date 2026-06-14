import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import Modal from '../components/Modal'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const GHS = (n) =>
  `₵ ${Number(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const loanBadge = (status) => {
  const map = {
    pending:   'badge-yellow',
    approved:  'badge-blue',
    rejected:  'badge-red',
    disbursed: 'badge-green',
    closed:    'badge-gray',
  }
  return <span className={map[status] || 'badge-gray'}>{status}</span>
}

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const [customer, setCustomer] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  // Account creation modal
  const [showAccModal, setShowAccModal] = useState(false)
  const [accType, setAccType] = useState('savings')
  const [accSaving, setAccSaving] = useState(false)
  const [accError, setAccError] = useState('')

  // Loan creation modal
  const [showLoanModal, setShowLoanModal] = useState(false)
  const [loanForm, setLoanForm] = useState({ amount: '', interestRate: '', durationMonths: '', purpose: '' })
  const [loanSaving, setLoanSaving] = useState(false)
  const [loanError, setLoanError] = useState('')

  const fetchData = () => {
    Promise.all([api.get(`/customers/${id}`), api.get(`/customers/${id}/summary`)])
      .then(([c, s]) => {
        setCustomer(c.data.data || c.data)
        setSummary(s.data.data || s.data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [id])

  const handleCreateAccount = async (e) => {
    e.preventDefault()
    setAccError('')
    setAccSaving(true)
    try {
      await api.post('/accounts', { customerId: id, type: accType })
      setShowAccModal(false)
      fetchData()
    } catch (err) {
      setAccError(err.response?.data?.message || 'Failed to create account.')
    } finally {
      setAccSaving(false)
    }
  }

  const handleCreateLoan = async (e) => {
    e.preventDefault()
    setLoanError('')
    setLoanSaving(true)
    try {
      await api.post('/loans', {
        customerId: id,
        amount: Number(loanForm.amount),
        interestRate: Number(loanForm.interestRate),
        durationMonths: Number(loanForm.durationMonths),
        purpose: loanForm.purpose,
      })
      setShowLoanModal(false)
      setLoanForm({ amount: '', interestRate: '', durationMonths: '', purpose: '' })
      fetchData()
    } catch (err) {
      setLoanError(err.response?.data?.message || 'Failed to create loan.')
    } finally {
      setLoanSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete customer ${customer?.firstName} ${customer?.lastName}? This cannot be undone.`)) return
    try {
      await api.delete(`/customers/${id}`)
      navigate('/customers')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete customer.')
    }
  }

  if (loading) return <Layout title="Customer Detail"><Spinner /></Layout>
  if (!customer) return <Layout title="Customer Detail"><div className="text-center py-10 text-gray-400">Customer not found.</div></Layout>

  return (
    <Layout title={`${customer.firstName} ${customer.lastName}`}>
      <div className="mb-4">
        <button className="btn-secondary btn-sm" onClick={() => navigate('/customers')}>
          ← Back to Customers
        </button>
      </div>

      {/* Customer Info Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold uppercase flex-shrink-0">
              {customer.firstName?.[0]}{customer.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{customer.firstName} {customer.lastName}</h2>
              <p className="text-sm text-gray-500 font-mono">{customer.customerNumber}</p>
              <span className={`mt-1 ${customer.isActive ? 'badge-green' : 'badge-red'}`}>
                {customer.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary btn-sm" onClick={() => setShowAccModal(true)}>+ Account</button>
            <button className="btn-success btn-sm" onClick={() => setShowLoanModal(true)}>+ Loan</button>
            {isAdmin && (
              <button className="btn-danger btn-sm" onClick={handleDelete}>Delete</button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100">
          <InfoRow label="Phone" value={customer.phone} />
          <InfoRow label="Email" value={customer.email || '—'} />
          <InfoRow label="ID Type" value={customer.idType?.replace('_', ' ')} />
          <InfoRow label="ID Number" value={customer.idNumber} />
          <InfoRow label="Address" value={customer.address || '—'} />
          <InfoRow label="Date of Birth" value={customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : '—'} />
          <InfoRow label="Branch" value={customer.branch?.name || '—'} />
          <InfoRow label="Joined" value={new Date(customer.createdAt).toLocaleDateString()} />
        </div>
      </div>

      {/* Accounts */}
      <div className="card p-5 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Accounts ({summary?.accounts?.length ?? 0})</h3>
        {summary?.accounts?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summary.accounts.map((acc) => (
              <div key={acc._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <div className="text-xs font-mono text-gray-500">{acc.accountNumber}</div>
                  <div className="text-sm font-medium text-gray-800 capitalize">{acc.type} Account</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{GHS(acc.balance)}</div>
                  <span className={acc.isActive ? 'badge-green' : 'badge-red'}>{acc.isActive ? 'Active' : 'Closed'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No accounts yet.</p>
        )}
      </div>

      {/* Loans */}
      <div className="card p-5 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Loans ({summary?.loans?.length ?? 0})</h3>
        {summary?.loans?.length ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Loan #</th>
                  <th>Amount</th>
                  <th>Rate</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {summary.loans.map((ln) => (
                  <tr key={ln._id} className="cursor-pointer" onClick={() => navigate(`/loans/${ln._id}`)}>
                    <td className="font-mono text-xs text-gray-500">{ln.loanNumber}</td>
                    <td>{GHS(ln.amount)}</td>
                    <td>{ln.interestRate}%</td>
                    <td>{ln.durationMonths} mo</td>
                    <td>{loanBadge(ln.status)}</td>
                    <td>{GHS(ln.outstandingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No loans yet.</p>
        )}
      </div>

      {/* Recent Transactions */}
      {summary?.recentTransactions?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentTransactions.map((tx) => (
                  <tr key={tx._id}>
                    <td className="font-mono text-xs text-gray-500">{tx.reference}</td>
                    <td>
                      <span className={tx.type === 'deposit' ? 'badge-green' : 'badge-red'}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={tx.type === 'deposit' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {tx.type === 'deposit' ? '+' : '-'}{GHS(tx.amount)}
                    </td>
                    <td>{GHS(tx.balanceAfter)}</td>
                    <td className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      <Modal isOpen={showAccModal} onClose={() => setShowAccModal(false)} title="Open New Account" size="sm">
        <form onSubmit={handleCreateAccount} className="space-y-4">
          {accError && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{accError}</div>}
          <div>
            <label className="label">Account Type</label>
            <select className="input" value={accType} onChange={(e) => setAccType(e.target.value)}>
              <option value="savings">Savings</option>
              <option value="current">Current</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setShowAccModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={accSaving}>
              {accSaving ? 'Opening…' : 'Open Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Loan Modal */}
      <Modal isOpen={showLoanModal} onClose={() => setShowLoanModal(false)} title="Apply for Loan" size="md">
        <form onSubmit={handleCreateLoan} className="space-y-4">
          {loanError && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{loanError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Loan Amount (GHS) *</label>
              <input type="number" min="1" step="0.01" className="input" value={loanForm.amount}
                onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })} required />
            </div>
            <div>
              <label className="label">Interest Rate (% p.a.) *</label>
              <input type="number" min="0.01" step="0.01" className="input" value={loanForm.interestRate}
                onChange={(e) => setLoanForm({ ...loanForm, interestRate: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="label">Duration (Months) *</label>
            <input type="number" min="1" className="input" value={loanForm.durationMonths}
              onChange={(e) => setLoanForm({ ...loanForm, durationMonths: e.target.value })} required />
          </div>
          <div>
            <label className="label">Purpose</label>
            <input className="input" placeholder="e.g. Business expansion" value={loanForm.purpose}
              onChange={(e) => setLoanForm({ ...loanForm, purpose: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setShowLoanModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loanSaving}>
              {loanSaving ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</div>
      <div className="text-sm text-gray-800 mt-0.5 capitalize">{value}</div>
    </div>
  )
}
