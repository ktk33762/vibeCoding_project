import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function MyProfileRedirect() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) navigate(`/profile/${user.id}`, { replace: true })
      else navigate('/login', { replace: true })
    })
  }, [navigate])

  return null
}
