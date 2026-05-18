import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface UserItem {
  id: string
  nickname: string
}

interface Props {
  userId: string
  type: 'followers' | 'following'
  onClose: () => void
}

export default function FollowListModal({ userId, type, onClose }: Props) {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (type === 'followers') {
        const { data } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', userId)
        const ids = (data ?? []).map((r: any) => r.follower_id)
        if (ids.length === 0) { setLoading(false); return }
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nickname')
          .in('id', ids)
        setUsers((profiles ?? []) as UserItem[])
      } else {
        const { data } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId)
        const ids = (data ?? []).map((r: any) => r.following_id)
        if (ids.length === 0) { setLoading(false); return }
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nickname')
          .in('id', ids)
        setUsers((profiles ?? []) as UserItem[])
      }
      setLoading(false)
    }
    load()
  }, [userId, type])

  return (
    <div className="follow-modal-overlay" onClick={onClose}>
      <div className="follow-modal" onClick={e => e.stopPropagation()}>
        <div className="follow-modal-header">
          <h3>{type === 'followers' ? '팔로워' : '팔로잉'}</h3>
          <button className="follow-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="follow-modal-body">
          {loading && <p className="follow-modal-empty">불러오는 중...</p>}
          {!loading && users.length === 0 && (
            <p className="follow-modal-empty">
              {type === 'followers' ? '팔로워가 없습니다.' : '팔로잉하는 사람이 없습니다.'}
            </p>
          )}
          {users.map(user => (
            <Link
              key={user.id}
              to={`/profile/${user.id}`}
              className="follow-modal-item"
              onClick={onClose}
            >
              <div className="follow-modal-avatar">
                {user.nickname.charAt(0).toUpperCase()}
              </div>
              <span className="follow-modal-nickname">{user.nickname}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
