import { useState } from 'react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user, isAdmin } = useAuth()

  // Change password
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  // Register staff (admin only)
  const [showRegModal, setShowRegModal] = useState(false)
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', role: 'staff' })
  const [regError, setRegError] = useState('')
  const [regSuccess, setRegSuccess] = useState('')
  const [regSaving, setRegSaving] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError('New passwords do not match.')
      return
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.')
      return
    }
    setPwSaving(true)
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      })
      setPwSuccess('Password changed successfully.')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setPwSaving(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setRegError('')
    setRegSuccess('')
    setRegSaving(true)
    try {
      await api.post('/auth/register', regForm)
      setRegSuccess(`User "${regForm.name}" created successfully.`)
      setRegForm({ name: '', email: '', password: '', role: 'staff' })
    } catch (err) {
      setRegError(err.response?.data?.message || 'Failed to create user.')
    } finally {
      setRegSaving(false)
    }
  }

  return (
    <Layout title="Settings">
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Manage your account and system preferences</p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Info */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Your Profile</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold uppercase">
              {user?.name?.[0]}
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-lg">{user?.name}</div>
              <div className="text-sm text-gray-500">{user?.email}</div>
              <span className={`mt-1 ${user?.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
          {pwError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{pwError}</div>
          )}
          {pwSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{pwSuccess}</div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                className="input"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                className="input"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                className="input"
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={pwSaving}>
              {pwSaving ? 'Saving…' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Admin: Register New User */}
        {isAdmin && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">User Management</h3>
              <button className="btn-primary btn-sm" onClick={() => { setRegError(''); setRegSuccess(''); setShowRegModal(true) }}>
                + New User
              </button>
            </div>
            <p className="text-sm text-gray-500">
              As an admin, you can register new staff or admin accounts for the COMPOUND system.
            </p>
          </div>
        )}
      </div>

      {/* Register User Modal */}
      <Modal isOpen={showRegModal} onClose={() => setShowRegModal(false)} title="Register New User" size="sm">
        <form onSubmit={handleRegister} className="space-y-4">
          {regError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{regError}</div>
          )}
          {regSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{regSuccess}</div>
          )}
          <div>
            <label className="label">Full Name *</label>
            <input
              className="input"
              value={regForm.name}
              onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Email *</label>
            <input
              type="email"
              className="input"
              value={regForm.email}
              onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Password *</label>
            <input
              type="password"
              className="input"
              value={regForm.password}
              onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="label">Role *</label>
            <select
              className="input"
              value={regForm.role}
              onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setShowRegModal(false)}>Close</button>
            <button type="submit" className="btn-primary" disabled={regSaving}>
              {regSaving ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
