import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import api from '../services/api'

export default function Customers() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    idType: 'national_id', idNumber: '', address: '', dateOfBirth: '', branch: '',
  })

  const fetchAll = () => {
    Promise.all([api.get('/customers'), api.get('/branches')])
      .then(([c, b]) => {
        setCustomers(c.data.data || c.data)
        setBranches(b.data.data || b.data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.firstName?.toLowerCase().includes(q) ||
      c.lastName?.toLowerCase().includes(q) ||
      c.customerNumber?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q)
    )
  })

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api.post('/customers', form)
      setShowModal(false)
      setForm({ firstName: '', lastName: '', email: '', phone: '', idType: 'national_id', idNumber: '', address: '', dateOfBirth: '', branch: '' })
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create customer.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Layout title="Customers"><Spinner /></Layout>

  return (
    <Layout title="Customers">
      <div className="page-header">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="page-subtitle">{customers.length} total customers</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Customer
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          className="input max-w-sm"
          placeholder="Search by name, number, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Customer #</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>ID Type</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-8">No customers found.</td>
              </tr>
            ) : filtered.map((c) => (
              <tr
                key={c._id}
                className="cursor-pointer"
                onClick={() => navigate(`/customers/${c._id}`)}
              >
                <td className="font-mono text-xs text-gray-500">{c.customerNumber}</td>
                <td className="font-medium text-gray-900">{c.firstName} {c.lastName}</td>
                <td>{c.phone}</td>
                <td className="text-gray-500">{c.email || '—'}</td>
                <td className="capitalize text-gray-500">{c.idType?.replace('_', ' ')}</td>
                <td>
                  <span className={c.isActive ? 'badge-green' : 'badge-red'}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Customer Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Customer" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone *</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">ID Type *</label>
              <select className="input" value={form.idType} onChange={(e) => setForm({ ...form, idType: e.target.value })} required>
                <option value="national_id">National ID</option>
                <option value="passport">Passport</option>
                <option value="drivers_license">Driver's License</option>
              </select>
            </div>
            <div>
              <label className="label">ID Number *</label>
              <input className="input" value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date of Birth</label>
              <input type="date" className="input" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
            </div>
            <div>
              <label className="label">Branch *</label>
              <select className="input" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} required>
                <option value="">Select branch…</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Creating…' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
