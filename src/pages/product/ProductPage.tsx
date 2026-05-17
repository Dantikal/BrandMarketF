import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, Share2, ShoppingCart, Send, Star, X, ChevronDown } from 'lucide-react'
import { productApi, socialApi } from '../../api/services'
import { useAuthStore } from '../../store/authStore'
import type { Product, Comment } from '../../types'
import BackButton from '../../components/ui/BackButton'
import toast from 'react-hot-toast'

// ─── Star rating component ────────────────────────────────────────────────────
function StarRating({ value, onChange, readOnly = false }: { value: number; onChange?: (v: number) => void; readOnly?: boolean }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button"
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          style={{
            background: 'none', border: 'none', cursor: readOnly ? 'default' : 'pointer',
            padding: 1, lineHeight: 1,
          }}
        >
          <Star
            size={readOnly ? 14 : 22}
            fill={(hover || value) >= star ? '#C8873A' : 'none'}
            stroke={(hover || value) >= star ? '#C8873A' : 'var(--border-dark)'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}

// ─── Comment item ─────────────────────────────────────────────────────────────
function CommentItem({ comment, onReply }: {
  comment: Comment & { rating?: number }
  onReply: (id: number, username: string) => void
}) {
  const [showReplies, setShowReplies] = useState(false)
  return (
    <div style={{ display: 'flex', gap: 10, paddingBottom: 16, borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
      <Link to={`/profile/${comment.username}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: comment.userAvatar ? `url(${comment.userAvatar}) center/cover` : 'var(--saffron)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--cream)', fontSize: '0.78rem', fontWeight: 700,
        }}>
          {!comment.userAvatar && comment.username[0]?.toUpperCase()}
        </div>
      </Link>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
          <Link to={`/profile/${comment.username}`} style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--choco)' }}>@{comment.username}</span>
          </Link>
          {comment.rating && <StarRating value={comment.rating} readOnly />}
          <span style={{ fontSize: '0.72rem', color: 'var(--choco-light)', marginLeft: 'auto' }}>
            {new Date(comment.createdAt).toLocaleDateString('ru')}
          </span>
        </div>

        <p style={{ color: 'var(--choco-mid)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 8 }}>
          {comment.text}
        </p>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => onReply(comment.id, comment.username)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--choco-light)', fontWeight: 600 }}>
            Ответить
          </button>
          {comment.replies?.length > 0 && (
            <button onClick={() => setShowReplies(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--saffron)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
              <ChevronDown size={12} style={{ transform: showReplies ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              {comment.replies.length} {comment.replies.length === 1 ? 'ответ' : 'ответа'}
            </button>
          )}
        </div>

        {showReplies && comment.replies?.length > 0 && (
          <div style={{ marginTop: 12, paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>
            {comment.replies.map(r => (
              <CommentItem key={r.id} comment={r} onReply={onReply} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── TikTok-style comment drawer ──────────────────────────────────────────────
function CommentDrawer({ productId, isOpen, onClose, commentsCount }: {
  productId: number; isOpen: boolean; onClose: () => void; commentsCount: number
}) {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const [comments, setComments] = useState<(Comment & { rating?: number })[]>([])
  const [text, setText] = useState('')
  const [rating, setRating] = useState(0)
  const [showReview, setShowReview] = useState(false)
  const [replyTo, setReplyTo] = useState<{ id: number; username: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    socialApi.getComments(productId)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isOpen, productId])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen])

  const handleReply = (id: number, username: string) => {
    setReplyTo({ id, username })
    inputRef.current?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    if (!isAuthenticated) { navigate('/login'); return }
    setSubmitting(true)
    try {
      const reviewText = rating > 0 ? `[★${rating}] ${text}` : text
      const c = await socialApi.addComment(productId, reviewText, replyTo?.id)
      const withRating = { ...c, rating: rating > 0 ? rating : undefined }
      if (replyTo) {
        setComments(prev => prev.map(cm =>
          cm.id === replyTo.id ? { ...cm, replies: [...(cm.replies || []), withRating] } : cm
        ))
      } else {
        setComments(prev => [withRating, ...prev])
      }
      setText('')
      setRating(0)
      setShowReview(false)
      setReplyTo(null)
    } catch { toast.error('Ошибка') }
    finally { setSubmitting(false) }
  }

  const avgRating = comments.filter(c => c.rating).reduce((a, c) => a + (c.rating || 0), 0) / (comments.filter(c => c.rating).length || 1)

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(44,26,14,0.5)',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'all' : 'none',
        transition: 'opacity 0.25s',
      }} />

      {/* Drawer */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: `translateX(-50%) translateY(${isOpen ? '0' : '100%'})`,
        width: 'min(560px, 100vw)', maxHeight: '80vh',
        background: 'var(--cream)', borderRadius: '20px 20px 0 0',
        border: '1px solid var(--border)', borderBottom: 'none',
        zIndex: 201, display: 'flex', flexDirection: 'column',
        transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        boxShadow: '0 -8px 40px rgba(44,26,14,0.2)',
      }}>
        {/* Handle */}
        <div style={{ padding: '12px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <p style={{ fontWeight: 700, color: 'var(--choco)', fontSize: '0.95rem' }}>
              Отзывы и комментарии · {commentsCount}
            </p>
            {comments.filter(c => c.rating).length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <StarRating value={Math.round(avgRating)} readOnly />
                <span style={{ fontSize: '0.78rem', color: 'var(--choco-light)' }}>
                  {avgRating.toFixed(1)} из 5
                </span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>

        {/* Comments list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 0' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--saffron)', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--choco-light)' }}>
              <p style={{ fontSize: '1.5rem', marginBottom: 8 }}>💬</p>
              <p>Будьте первым — оставьте отзыв!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {comments.map(c => (
                <CommentItem key={c.id} comment={c} onReply={handleReply} />
              ))}
            </div>
          )}
        </div>

        {/* Input area */}
        <div style={{ padding: '12px 16px 24px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {replyTo && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', marginBottom: 8, background: 'var(--dust)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--choco-mid)' }}>
              <span>↩ Ответ @{replyTo.username}</span>
              <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--choco-light)' }}>✕</button>
            </div>
          )}

          {/* Review toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button onClick={() => setShowReview(v => !v)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600,
              background: showReview ? 'var(--saffron)' : 'var(--dust)',
              color: showReview ? 'var(--cream)' : 'var(--choco-mid)',
              transition: 'all 0.2s',
            }}>
              <Star size={13} fill={showReview ? 'var(--cream)' : 'none'} stroke={showReview ? 'var(--cream)' : 'var(--choco-mid)'} />
              Добавить оценку
            </button>
          </div>

          {showReview && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <StarRating value={rating} onChange={setRating} />
              {rating > 0 && (
                <span style={{ fontSize: '0.82rem', color: 'var(--choco-mid)' }}>
                  {['', 'Ужасно', 'Плохо', 'Нормально', 'Хорошо', 'Отлично!'][rating]}
                </span>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
            {user && (
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: user.avatar ? `url(${user.avatar}) center/cover` : 'var(--saffron)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--cream)', fontSize: '0.7rem', fontWeight: 700,
              }}>
                {!user.avatar && user.name?.[0]?.toUpperCase()}
              </div>
            )}
            <input
              ref={inputRef}
              className="input"
              placeholder={showReview ? 'Напишите отзыв...' : 'Добавить комментарий...'}
              value={text}
              onChange={e => setText(e.target.value)}
              style={{ flex: 1, borderRadius: 999, padding: '0.6rem 1rem' }}
              onClick={() => { if (!isAuthenticated) navigate('/login') }}
            />
            <button type="submit" disabled={!text.trim() || submitting} className="btn-primary"
              style={{ padding: '0 14px', borderRadius: 999, opacity: (!text.trim() || submitting) ? 0.4 : 1, display: 'flex', alignItems: 'center' }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

// ─── Product Page ─────────────────────────────────────────────────────────────
export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [likeAnim, setLikeAnim] = useState(false)
  const [commentOpen, setCommentOpen] = useState(false)
  const [currentImg, setCurrentImg] = useState(0)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    productApi.getById(Number(id))
      .then(p => { setProduct(p); setLiked(p.isLiked); setLikesCount(p.likesCount) })
      .catch(() => toast.error('Товар не найден'))
      .finally(() => setLoading(false))
  }, [id])

  const handleLike = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    try {
      const res = await socialApi.toggleLike(Number(id))
      setLiked(res.liked); setLikesCount(res.likesCount)
      if (res.liked) { setLikeAnim(true); setTimeout(() => setLikeAnim(false), 400) }
    } catch { toast.error('Ошибка') }
  }

  const handleBuy = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    navigate(`/checkout?product=${id}&qty=1`)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--saffron)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!product) return <div style={{ textAlign: 'center', padding: 80 }}><h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--choco-mid)' }}>Товар не найден</h2></div>

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      <BackButton />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

        {/* Left: images */}
        <div>
          <div style={{
            borderRadius: 20, overflow: 'hidden', aspectRatio: '3/4',
            background: product.images?.[currentImg]
              ? `url(${product.images[currentImg]}) center/cover`
              : 'linear-gradient(135deg, var(--dust) 0%, var(--dust-dark) 100%)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {!product.images?.[currentImg] && <ShoppingCart size={60} style={{ color: 'var(--choco-light)', opacity: 0.3 }} />}
          </div>

          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setCurrentImg(i)} style={{
                  width: 64, height: 64, borderRadius: 10, padding: 0, cursor: 'pointer',
                  background: `url(${img}) center/cover`,
                  border: `2px solid ${currentImg === i ? 'var(--saffron)' : 'var(--border)'}`,
                  transition: 'border-color 0.2s',
                }} />
              ))}
            </div>
          )}
        </div>

        {/* Right: info */}
        <div>
          <Link to={`/brand/${product.brandId}`} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: product.brandLogo ? `url(${product.brandLogo}) center/cover` : 'var(--saffron)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--cream)', fontSize: '0.7rem', fontWeight: 700,
              }}>
                {!product.brandLogo && product.brandName[0]}
              </div>
              <span style={{ color: 'var(--saffron)', fontWeight: 700, fontSize: '0.875rem' }}>{product.brandName}</span>
              <span style={{ color: 'var(--choco-light)', fontSize: '0.8rem' }}>@{product.ownerUsername}</span>
            </div>
          </Link>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--choco)', marginBottom: 10, lineHeight: 1.2 }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {product.clothingType && <span className="badge badge-saffron">{product.clothingType}</span>}
            {product.size && <span className="badge" style={{ background: 'var(--dust)', color: 'var(--choco-mid)' }}>{product.size}</span>}
            {product.color && (
              <span className="badge" style={{ background: 'var(--dust)', color: 'var(--choco-mid)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: product.color }} />
                {product.color}
              </span>
            )}
          </div>

          {product.description && (
            <p style={{ color: 'var(--choco-mid)', lineHeight: 1.7, marginBottom: 20, fontSize: '0.95rem' }}>
              {product.description}
            </p>
          )}

          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 700, color: 'var(--choco)', marginBottom: 24 }}>
            {Number(product.price).toLocaleString()} ₽
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <button onClick={handleBuy} className="btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.85rem', fontSize: '1rem' }}>
              <ShoppingCart size={18} />
              'Купить сейчас'
            </button>

            <button onClick={handleLike} className={likeAnim ? 'animate-heart btn-ghost' : 'btn-ghost'}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.85rem 1.25rem' }}>
              <Heart size={18} fill={liked ? 'var(--saffron)' : 'none'} stroke={liked ? 'var(--saffron)' : 'var(--choco-mid)'} />
              {likesCount}
            </button>

            <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Скопировано!') }}
              className="btn-icon" title="Поделиться">
              <Share2 size={18} />
            </button>
          </div>

          {/* Comments button (TikTok style) */}
          <button onClick={() => setCommentOpen(true)} style={{
            width: '100%', padding: '14px', borderRadius: 14,
            background: 'var(--dust)', border: '1px solid var(--border)',
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--dust-dark)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--dust)')}
          >
            <span style={{ color: 'var(--choco-mid)', fontSize: '0.9rem' }}>
              💬 Комментарии и отзывы · {product.commentsCount}
            </span>
            <span style={{ color: 'var(--saffron)', fontSize: '0.82rem', fontWeight: 600 }}>Открыть →</span>
          </button>

          <div style={{
            marginTop: 16, padding: '14px', borderRadius: 12,
            background: product.stock > 0 ? 'rgba(46,125,50,0.07)' : 'rgba(183,28,28,0.07)',
            border: `1px solid ${product.stock > 0 ? 'rgba(46,125,50,0.2)' : 'rgba(183,28,28,0.2)'}`,
            fontSize: '0.85rem', fontWeight: 600,
            color: product.stock > 0 ? '#2E7D32' : '#B71C1C',
          }}>
            {product.stock > 0 ? `✓ В наличии: ${product.stock} шт` : '✗ Нет в наличии'}
          </div>
        </div>
      </div>

      {/* Comment Drawer */}
      <CommentDrawer
        productId={Number(id)}
        isOpen={commentOpen}
        onClose={() => setCommentOpen(false)}
        commentsCount={product.commentsCount}
      />
    </div>
  )
}
