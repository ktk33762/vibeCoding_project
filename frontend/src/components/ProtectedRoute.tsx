import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface Props {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { session, loading } = useAuth()

  if (loading) return <div className="loading">로딩 중...</div>
  if (!session) return <Navigate to="/login" replace />

  return <>{children}</>
}
