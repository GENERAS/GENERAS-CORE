import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

// contentType -> real table. This mapping used to be
// `contentType === 'certificate' ? 'certificates' : 'photos'`, which sent
// blog likes to the photos table and silently corrupted photo counters.
const TABLE_FOR = {
  photo: 'photos',
  certificate: 'certificates',
  blog: 'blog_posts'
}

export default function LikeButton({ contentType, contentId, initialLikes = 0 }) {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  const table = TABLE_FOR[contentType]

  useEffect(() => {
    const storageKey = `${contentType}_${contentId}_liked`
    setLiked(localStorage.getItem(storageKey) === 'true')
  }, [contentType, contentId])

  // Keep in step when the parent re-fetches a different record.
  useEffect(() => { setLikes(initialLikes) }, [initialLikes])

  const handleLike = async () => {
    if (loading || !table) return
    setLoading(true)

    const storageKey = `${contentType}_${contentId}_liked`
    const nextLiked = !liked
    const delta = nextLiked ? 1 : -1

    try {
      // The count is now computed on the server. The browser used to read the
      // current value and write back newLikeCount, which lost updates when two
      // visitors clicked at once and required a policy that let anyone rewrite
      // the whole row.
      const { data, error } = await supabase.rpc('increment_content_likes', {
        p_table: table,
        p_id: contentId,
        p_delta: delta
      })

      if (error) throw error

      setLikes(data)
      setLiked(nextLiked)
      localStorage.setItem(storageKey, String(nextLiked))
    } catch (error) {
      console.error('Could not save like:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!table) return null

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      aria-label={liked ? 'Remove like' : 'Like'}
      aria-pressed={liked}
      className={`flex items-center gap-1 transition ${
        liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {liked ? <FaHeart /> : <FaRegHeart />}
      <span>{likes}</span>
    </button>
  )
}