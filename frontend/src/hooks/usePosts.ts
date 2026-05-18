import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Post } from '../types/post'

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(nickname), post_likes(count)')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      const mapped = (data as any[]).map(row => ({
        ...row,
        author_nickname: row.profiles?.nickname ?? null,
        likes_count: row.post_likes?.[0]?.count ?? 0,
        profiles: undefined,
        post_likes: undefined,
      })) as Post[]
      setPosts(mapped)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  async function createPost(title: string, content: string, imageFile?: File | null) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Error('로그인이 필요합니다.')

    let image_url: string | null = null
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(path, imageFile)
      if (uploadError) return uploadError
      const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path)
      image_url = publicUrl
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({ title, content, user_id: user.id, image_url })
      .select('*, profiles(nickname)')
      .single()

    if (!error && data) {
      const post: Post = { ...data, author_nickname: data.profiles?.nickname ?? null, profiles: undefined }
      setPosts(prev => [post, ...prev])
    }
    return error
  }

  async function updatePost(id: string, updates: { title: string; content: string }) {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select('*, profiles(nickname)')
      .single()

    if (!error && data) {
      const post: Post = { ...data, author_nickname: data.profiles?.nickname ?? null, profiles: undefined }
      setPosts(prev => prev.map(p => p.id === id ? post : p))
    }
    return error
  }

  async function deletePost(id: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== id))
    }
    return error
  }

  return { posts, loading, error, fetchPosts, createPost, updatePost, deletePost }
}

export async function fetchPostById(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(nickname)')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return { ...data, author_nickname: data.profiles?.nickname ?? null, profiles: undefined }
}
