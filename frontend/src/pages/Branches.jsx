import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Branches() {
  const { isAdmin } = useAuth()
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState({ name: '', code: '', address: '', phone: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchBranches = () => {
    api.get('/branches')
      .then(({ data }) => setBranches(data.data || data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBranches() }, [])

  const openCreate = () => {
    setEditTarget(null)
    setForm({ name: '', code: '', address: '', phone: '', email: '' })
    setError('')
    setShowModal(true)
  }

  const openEdit = (branch) => {
    setEditTarget(branch)
    setForm({
      name: branch.name || '',
      code: branch.code || '',
      address: branch.address || '',
      phone: branch.phone || '',
      email: branch.email || '',
    })
    setError('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (editTarget) {
        await api.put(`/branches/${editTarget._id}`, form)
      } else {
        await api.post('/branches', form)
      }
      setShowModal(false)
      fetchBranches()
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (branch) => {
    if (!window.confirm(`Delete branch "${branch.name}"?`)) return
    try {
      await api.delete(`/branches/${branch._id}`)
      fetchBranches()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete branch.')
    }
  }

  if (loading) return <Layout title="Branches"><Spinner /></Layout>

  return (
    <Layout title="Branches">
      <div className="page-header">
        <div>
          <h2 className="page-title">Branches</h2>
          <p className="page-subtitle">{branches.length} branches</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={openCreate}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Branch
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-gray-400">No branches found.</div>
        ) : (
          branches.map((b) => (
            <div key={b._id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold text-sm">
                      {b.code?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{b.name}</div>
                      <div className="text-xs font-mono text-gray-400">{b.code}</div>
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button className="btn-secondary btn-sm" onClick={() => openEdit(b)}>Edit</button>
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(b)}>Del</button>
                  </div>
                )}
              </div>
              <div className="space-y-1 text-sm text-gray-500">
                {b.address && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {b.address}
                  </div>
                )}
                {b.phone && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {b.phone}
                  </div>
                )}
                {b.email && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {b.email}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400 border-t border-gray-100 pt-2">
                Created {new Date(b.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editTarget ? 'Edit Branch' : 'New Branch'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Branch Name *</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Branch Code *</label>
              <input
                className="input"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. ACC-HQ"
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <input
              className="input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editTarget ? 'Update Branch' : 'Create Branch'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
