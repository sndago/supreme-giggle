import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const GHS = (n) =>
  `₵ ${Number(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const statusBadge = (status) => {
  const map = { pending: 'badge-yellow', approved: 'badge-blue', rejected: 'badge-red', disbursed: 'badge-green', closed: 'badge-gray' }
  return <span className={map[status] || 'badge-gray'}>{status}</span>
}

export default function LoanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const [loan, setLoan] = useState(null)
  const [repayments, setRepayments] = useState([])
  const [loading, setLoading] = useState(true)

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const [showRepayModal, setShowRepayModal] = useState(false)
  const [repayForm, setRepayForm] = useState({ amount: '', paymentMethod: 'cash' })
  const [repayError, setRepayError] = useState('')
  const [repaySaving, setRepaySaving] = useState(false)

  const fetchData = () => {
    Promise.all([api.get(`/loans/${id}`), api.get(`/repayments/loan/${id}`)])
      .then(([l, r]) => {
        setLoan(l.data.data || l.data)
        setRepayments(r.data.data || r.data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [id])

  const doAction = async (action, body = {}) => {
    setActionLoading(true)
    try {
      await api.put(`/loans/${id}/${action}`, body)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} loan.`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRepay = async (e) => {
    e.preventDefault()
    setRepayError('')
    setRepaySaving(true)
    try {
      await api.post('/repayments', {
        loanId: id,
        amount: Number(repayForm.amount),
        paymentMethod: repayForm.paymentMethod,
      })
      setShowRepayModal(false)
      setRepayForm({ amount: '', paymentMethod: 'cash' })
      fetchData()
    } catch (err) {
      setRepayError(err.response?.data?.message || 'Failed to record repayment.')
    } finally {
      setRepaySaving(false)
    }
  }

  if (loading) return <Layout title="Loan Detail"><Spinner /></Layout>
  if (!loan) return <Layout title="Loan Detail"><div className="text-center py-10 text-gray-400">Loan not found.</div></Layout>

  return (
    <Layout title={`Loan: ${loan.loanNumber}`}>
      <div className="mb-4">
        <button className="btn-secondary btn-sm" onClick={() => navigate('/loans')}>← Back to Loans</button>
      </div>

      {/* Loan Overview Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs font-mono text-gray-400 mb-1">{loan.loanNumber}</div>
            <h2 className="text-xl font-bold text-gray-900">
              {loan.customer?.firstName} {loan.customer?.lastName}
            </h2>
            <p className="text-sm text-gray-500">Customer: {loan.customer?.customerNumber}</p>
          </div>
          <div className="text-right">
            {statusBadge(loan.status)}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <InfoBox label="Loan Amount" value={GHS(loan.amount)} />
          <InfoBox label="Interest Rate" value={`${loan.interestRate}% p.a.`} />
          <InfoBox label="Duration" value={`${loan.durationMonths} months`} />
          <InfoBox label="Monthly Payment" value={loan.monthlyPayment ? GHS(loan.monthlyPayment) : '—'} />
          <InfoBox label="Total Repayable" value={loan.totalRepayable ? GHS(loan.totalRepayable) : '—'} />
          <InfoBox label="Total Interest" value={loan.totalInterest ? GHS(loan.totalInterest) : '—'} />
          <InfoBox label="Outstanding" value={GHS(loan.outstandingBalance)} />
          <InfoBox label="Purpose" value={loan.purpose || '—'} />
        </div>

        {loan.approvedAt && <InfoBox label="Approved At" value={new Date(loan.approvedAt).toLocaleString()} />}
        {loan.disbursedAt && <InfoBox label="Disbursed At" value={new Date(loan.disbursedAt).toLocaleString()} />}
        {loan.dueDate && <InfoBox label="Due Date" value={new Date(loan.dueDate).toLocaleDateString()} />}
        {loan.rejectedAt && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-xs text-red-500 font-medium">Rejection Reason</div>
            <div className="text-sm text-red-700 mt-0.5">{loan.rejectionReason || 'No reason provided.'}</div>
          </div>
        )}

        {/* Actions */}
        {isAdmin && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 flex-wrap">
            {loan.status === 'pending' && (
              <>
                <button className="btn-success" disabled={actionLoading} onClick={() => doAction('approve')}>
                  Approve Loan
                </button>
                <button className="btn-danger" disabled={actionLoading} onClick={() => setShowRejectModal(true)}>
                  Reject Loan
                </button>
              </>
            )}
            {loan.status === 'approved' && (
              <button className="btn-primary" disabled={actionLoading} onClick={() => doAction('disburse')}>
                Disburse Funds
              </button>
            )}
            {loan.status === 'disbursed' && (
              <button className="btn-success" onClick={() => setShowRepayModal(true)}>
                Record Repayment
              </button>
            )}
          </div>
        )}
        {!isAdmin && loan.status === 'disbursed' && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <button className="btn-success" onClick={() => setShowRepayModal(true)}>Record Repayment</button>
          </div>
        )}
      </div>

      {/* Repayments */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Repayment History ({repayments.length})</h3>
        {repayments.length === 0 ? (
          <p className="text-sm text-gray-400">No repayments recorded yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Balance After</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {repayments.map((r) => (
                  <tr key={r._id}>
                    <td className="font-mono text-xs text-gray-500">{r.reference || r._id}</td>
                    <td className="font-semibold text-green-600">{GHS(r.amount)}</td>
                    <td className="capitalize text-gray-500">{r.paymentMethod?.replace('_', ' ')}</td>
                    <td>{GHS(r.balanceAfter)}</td>
                    <td className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Loan" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Rejection Reason (optional)</label>
            <textarea
              className="input"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why the loan is rejected…"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
            <button
              className="btn-danger"
              disabled={actionLoading}
              onClick={async () => {
                await doAction('reject', { reason: rejectReason })
                setShowRejectModal(false)
              }}
            >
              {actionLoading ? 'Rejecting…' : 'Confirm Reject'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Repayment Modal */}
      <Modal isOpen={showRepayModal} onClose={() => setShowRepayModal(false)} title="Record Repayment" size="sm">
        <form onSubmit={handleRepay} className="space-y-4">
          {repayError && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{repayError}</div>}
          <div>
            <label className="label">Amount (GHS) *</label>
            <input type="number" min="0.01" step="0.01" className="input" value={repayForm.amount}
              onChange={(e) => setRepayForm({ ...repayForm, amount: e.target.value })}
              placeholder={`Outstanding: ${GHS(loan.outstandingBalance)}`} required />
          </div>
          <div>
            <label className="label">Payment Method *</label>
            <select className="input" value={repayForm.paymentMethod}
              onChange={(e) => setRepayForm({ ...repayForm, paymentMethod: e.target.value })}>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="mobile_money">Mobile Money</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setShowRepayModal(false)}>Cancel</button>
            <button type="submit" className="btn-success" disabled={repaySaving}>
              {repaySaving ? 'Saving…' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}

function InfoBox({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</div>
      <div className="text-sm font-semibold text-gray-900 mt-0.5">{value}</div>
    </div>
  )
}
