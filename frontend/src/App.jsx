import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login        from './pages/Login'
import Dashboard    from './pages/Dashboard'
import Customers    from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Accounts     from './pages/Accounts'
import Transactions from './pages/Transactions'
import Loans        from './pages/Loans'
import LoanDetail   from './pages/LoanDetail'
import Repayments   from './pages/Repayments'
import Branches     from './pages/Branches'
import Reports      from './pages/Reports'
import AuditLog     from './pages/AuditLog'
import Settings     from './pages/Settings'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
        <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetail /></ProtectedRoute>} />

        <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />

        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />

        <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
        <Route path="/loans/:id" element={<ProtectedRoute><LoanDetail /></ProtectedRoute>} />

        <Route path="/repayments" element={<ProtectedRoute><Repayments /></ProtectedRoute>} />

        <Route path="/branches" element={<ProtectedRoute><Branches /></ProtectedRoute>} />

        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

        <Route path="/audit" element={<ProtectedRoute adminOnly><AuditLog /></ProtectedRoute>} />

        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
