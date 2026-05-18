import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Header from '../components/Header'

export default function HomePage() {
  const { user } = useAuth()

  const nickname = user?.user_metadata?.nickname ?? user?.email?.split('@')[0] ?? '사용자'

  return (
    <div className="home-container">
      <Header />

      <main className="home-main">
        <p className="home-welcome">안녕하세요, <strong>{nickname}</strong>님!</p>
        <p className="home-email">{user?.email}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
          <Link to="/todos" style={{ display: 'inline-block', padding: '12px 28px', background: '#4f46e5', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            내 할 일 보기 →
          </Link>
          <Link to="/workout" style={{ display: 'inline-block', padding: '12px 28px', background: '#10b981', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            운동 관리 →
          </Link>
<Link to="/board" style={{ display: 'inline-block', padding: '12px 28px', background: '#fff', color: '#4f46e5', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, border: '2px solid #4f46e5' }}>
            자유게시판 →
          </Link>
        </div>
      </main>
    </div>
  )
}
