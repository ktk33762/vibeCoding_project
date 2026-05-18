import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import '../styles/header.css'

interface Props {
  right?: React.ReactNode
}

export default function Header({ right }: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const isAuthPage = pathname === '/login' || pathname === '/signup'

  return (
    <header className="app-header">
      <Link to="/" className="app-logo">FitLog</Link>
      <div className="app-header-right">
        {right}
        {!isAuthPage && user && (
          <Link to="/profile" className="header-profile-link">내 프로필</Link>
        )}
        {!isAuthPage && (
          user
            ? <button className="logout-button" onClick={handleLogout}>로그아웃</button>
            : <button className="logout-button" onClick={() => navigate('/login')}>로그인</button>
        )}
      </div>
    </header>
  )
}
