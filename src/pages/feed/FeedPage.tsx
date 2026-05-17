import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Heart, MessageCircle, Share2, ShoppingCart,
  ChevronUp, ChevronDown, Home, Search, LogIn,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { productApi, socialApi } from '../../api/services'
import { useAuthStore } from '../../store/authStore'
import type { Product } from '../../types'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

// ─── Image carousel (up to 10 photos) ───────────────────────────────────────
function ImageCarousel({ images, productName }: { images: string[]; productName: string }) {
  const [idx, setIdx] = useState(0)
  if (!images || images.length === 0) return null

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => Math.max(0, i - 1)) }
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => Math.min(images.length - 1, i + 1)) }

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Current image */}
      <img
        src={images[idx]}
        alt={productName}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        draggable={false}
      />

      {/* Prev / Next arrows */}
      {images.length > 1 && (
        <>
          {idx > 0 && (
            <button onClick={prev} style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ChevronLeft size={18} stroke="#fff" />
            </button>
          )}
          {idx < images.length - 1 && (
            <button onClick={next} style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ChevronRight size={18} stroke="#fff" />
            </button>
          )}

          {/* Dots */}
          <div style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 5,
          }}>
            {images.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setIdx(i) }} style={{
                width: i === idx ? 18 : 6, height: 6, borderRadius: 999,
                background: i === idx ? 'var(--saffron)' : 'rgba(255,255,255,0.5)',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s', padding: 0,
              }} />
            ))}
          </div>

          {/* Counter */}
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(0,0,0,0.5)', borderRadius: 999,
            padding: '2px 9px', fontSize: '0.72rem', color: '#fff', fontWeight: 600,
          }}>
            {idx + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Right action button ──────────────────────────────────────────────────────
function ActionBtn({ icon, label, onClick, active }: {
  icon: React.ReactNode; label?: string | number
  onClick?: () => void; active?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <button onClick={onClick} style={{
        width: 48, height: 48, borderRadius: '50%',
        background: active ? 'rgba(200,135,58,0.35)' : 'rgba(255,248,240,0.12)',
        backdropFilter: 'blur(12px)',
        border: `1.5px solid ${active ? 'rgba(200,135,58,0.6)' : 'rgba(255,255,255,0.18)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.2s',
      }}>
        {icon}
      </button>
      {label !== undefined && (
        <span style={{ color: 'rgba(255,248,240,0.85)', fontSize: '0.72rem', fontWeight: 600 }}>
          {String(label)}
        </span>
      )}
    </div>
  )
}

// ─── Single product card ──────────────────────────────────────────────────────
function ProductCard({ product, isActive }: { product: Product; isActive: boolean }) {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(product.isLiked)
  const [likesCount, setLikesCount] = useState(product.likesCount)
  const [likeAnim, setLikeAnim] = useState(false)

  const handleLike = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    try {
      const res = await socialApi.toggleLike(product.id)
      setLiked(res.liked); setLikesCount(res.likesCount)
      if (res.liked) { setLikeAnim(true); setTimeout(() => setLikeAnim(false), 400) }
    } catch { toast.error('Ошибка') }
  }

  const handleBuy = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    navigate(`/checkout?product=${product.id}&qty=1`)
  }

  const hasImages = product.images?.length > 0

  return (
    <div className="feed-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F0705' }}>
      <div style={{
        position: 'relative',
        width: 'min(420px, 94vw)',
        height: 'min(88vh, 780px)',
        borderRadius: 20, overflow: 'hidden',
        boxShadow: isActive
          ? '0 0 0 2px var(--saffron), 0 32px 80px rgba(0,0,0,0.8)'
          : '0 8px 40px rgba(0,0,0,0.6)',
        transition: 'box-shadow 0.4s ease',
      }}>
        {/* Background */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #2C1A0E 0%, #C8873A 60%, #E8A856 100%)' }}>
          {hasImages
            ? <ImageCarousel images={product.images} productName={product.name} />
            : null
          }
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(8,3,1,0.97) 0%, rgba(8,3,1,0.35) 52%, rgba(0,0,0,0.0) 100%)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Right actions */}
        <div style={{
          position: 'absolute', right: 14, bottom: 190,
          display: 'flex', flexDirection: 'column', gap: 16,
          alignItems: 'center', zIndex: 10,
        }}>
          <ActionBtn active={liked} label={likesCount} onClick={handleLike}
            icon={
              <Heart size={22} className={likeAnim ? 'animate-heart' : ''}
                fill={liked ? '#C8873A' : 'none'}
                stroke={liked ? '#C8873A' : '#FFF8F0'} strokeWidth={1.5}
              />
            }
          />
          <ActionBtn label={product.commentsCount} onClick={() => navigate(`/product/${product.id}`)}
            icon={<MessageCircle size={22} stroke="#FFF8F0" strokeWidth={1.5} />}
          />
          <ActionBtn
            onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/product/${product.id}`); toast.success('Скопировано!') }}
            icon={<Share2 size={20} stroke="#FFF8F0" strokeWidth={1.5} />}
          />
          <Link to={`/brand/${product.brandId}`}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: product.brandLogo ? `url(${product.brandLogo}) center/cover` : 'var(--saffron)',
              border: '2px solid var(--saffron)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--cream)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
            }}>
              {!product.brandLogo && product.brandName[0]}
            </div>
          </Link>
        </div>

        {/* Bottom info */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 72, padding: '0 18px 28px', zIndex: 10 }}>
          {/* Owner profile link */}
          <Link to={`/profile/${product.ownerUsername}`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: 'var(--saffron)', border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--cream)', fontWeight: 700, fontSize: '0.75rem',
            }}>
              {product.ownerUsername[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ color: '#FFF8F0', fontSize: '0.85rem', fontWeight: 700, lineHeight: 1 }}>@{product.ownerUsername}</p>
              <p style={{ color: 'rgba(255,248,240,0.55)', fontSize: '0.7rem', marginTop: 2 }}>автор бренда</p>
            </div>
          </Link>

          <Link to={`/brand/${product.brandId}`} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ color: 'var(--saffron-soft)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {product.brandName}
              </span>
            </div>
          </Link>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.3rem, 4vw, 1.9rem)',
            fontWeight: 700, color: '#FFF8F0', lineHeight: 1.15, marginBottom: 8,
          }}>
            {product.name}
          </h2>

          {product.description && (
            <p style={{
              color: 'rgba(255,248,240,0.68)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: 14,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {product.description}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700, color: '#FFF8F0' }}>
              {Number(product.price).toLocaleString()} ₽
            </span>
            <button onClick={handleBuy} className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0.55rem 1.2rem', fontSize: '0.875rem' }}>
              <ShoppingCart size={15} />
              'Купить'
            </button>
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'rgba(255,248,240,0.1)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)', color: '#FFF8F0',
                borderRadius: 999, padding: '0.55rem 1rem', cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-body)',
              }}>Детали</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Feed Page ────────────────────────────────────────────────────────────────
export default function FeedPage() {
  const [tab, setTab] = useState<'all' | 'favorite'>('all')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const { isAuthenticated, user } = useAuthStore()

  const load = useCallback(async (reset = false) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const p = reset ? 0 : page
      const data = (tab === 'favorite' && isAuthenticated)
        ? await productApi.getPersonalFeed(p)
        : await productApi.getFeed(p)
      setProducts(prev => reset ? data.content : [...prev, ...data.content])
      setHasMore(!data.last)
      setPage(p + 1)
    } catch { toast.error('Ошибка загрузки') }
    finally { setLoading(false); loadingRef.current = false }
  }, [tab, page, isAuthenticated])

  useEffect(() => { setPage(0); setHasMore(true); setActiveIndex(0); load(true) }, [tab])

  useEffect(() => {
    const el = containerRef.current; if (!el) return
    const onScroll = () => {
      const idx = Math.round(el.scrollTop / window.innerHeight)
      setActiveIndex(idx)
      if (idx >= products.length - 2 && hasMore && !loadingRef.current) load()
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [products.length, hasMore, load])

  const scrollTo = (dir: 'up' | 'down') => {
    const el = containerRef.current; if (!el) return
    const t = dir === 'up' ? activeIndex - 1 : activeIndex + 1
    el.scrollTo({ top: t * window.innerHeight, behavior: 'smooth' })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); scrollTo('down') }
      if (e.key === 'ArrowUp') { e.preventDefault(); scrollTo('up') }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex])

  const Spinner = () => (
    <>
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.08)', borderTopColor: 'var(--saffron)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )

  if (loading && products.length === 0) return (
    <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: '#0F0705' }}>
      <Spinner />
      <p style={{ color: 'rgba(255,248,240,0.4)', fontFamily: 'var(--font-body)' }}>Загружаем ленту...</p>
    </div>
  )

  return (
    <div style={{ position: 'relative', background: '#0F0705' }}>

      {/* Top bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 14, left: 16, pointerEvents: 'all' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: '#FFF8F0', textShadow: '0 1px 10px rgba(0,0,0,0.6)' }}>
              Brand<span style={{ color: 'var(--saffron)' }}>Market</span>
            </span>
          </Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, pointerEvents: 'all' }}>
          <div style={{ display: 'flex', gap: 2, background: 'rgba(10,4,2,0.7)', backdropFilter: 'blur(16px)', borderRadius: 999, padding: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
            {([['all', '🌍 Все'], ['favorite', '🔥 Мои']] as const).map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '5px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                background: tab === t ? 'var(--saffron)' : 'transparent',
                color: tab === t ? 'var(--cream)' : 'rgba(255,248,240,0.65)',
                transition: 'all 0.2s',
              }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', top: 16, right: 16, pointerEvents: 'none' }}>
          <span style={{ color: 'rgba(255,248,240,0.35)', fontSize: '0.72rem', fontFamily: 'var(--font-body)' }}>
            {activeIndex + 1}/{products.length}
          </span>
        </div>
      </div>

      {/* Scroll arrows */}
      <div style={{ position: 'fixed', right: 'max(16px, calc(50% - 230px))', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 8, zIndex: 50 }}>
        {[
          { dir: 'up' as const, disabled: activeIndex === 0, icon: <ChevronUp size={17} stroke="#FFF8F0" /> },
          { dir: 'down' as const, disabled: false, icon: <ChevronDown size={17} stroke="#FFF8F0" /> },
        ].map(({ dir, disabled, icon }) => (
          <button key={dir} onClick={() => scrollTo(dir)} disabled={disabled} style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,248,240,0.08)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.2 : 0.7, transition: 'opacity 0.2s',
          }}>{icon}</button>
        ))}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '10px 20px 24px',
        background: 'linear-gradient(to top, rgba(8,3,1,0.98) 0%, transparent 100%)',
      }}>
        {[
          { to: '/', icon: <Home size={22} />, label: 'Главная' },
          { to: '/search', icon: <Search size={22} />, label: 'Поиск' },
        ].map(item => (
          <Link key={item.to} to={item.to} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ color: 'rgba(255,248,240,0.6)' }}>{item.icon}</div>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,248,240,0.6)', fontFamily: 'var(--font-body)' }}>{item.label}</span>
          </Link>
        ))}

        {isAuthenticated ? (
          <Link to={`/profile/${user?.username}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: user?.avatar ? `url(${user.avatar}) center/cover` : 'var(--saffron)',
              border: '1.5px solid var(--saffron)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', fontWeight: 700, color: 'var(--cream)',
            }}>
              {!user?.avatar && user?.name?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,248,240,0.6)', fontFamily: 'var(--font-body)' }}>Профиль</span>
          </Link>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <LogIn size={22} style={{ color: 'rgba(255,248,240,0.6)' }} />
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,248,240,0.6)', fontFamily: 'var(--font-body)' }}>Войти</span>
          </Link>
        )}
      </div>

      {/* Feed */}
      <div className="feed-container" ref={containerRef}>
        {products.map((p, i) => <ProductCard key={p.id} product={p} isActive={i === activeIndex} />)}

        {loading && products.length > 0 && (
          <div className="feed-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F0705' }}>
            <Spinner />
          </div>
        )}
        {!hasMore && products.length > 0 && (
          <div className="feed-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, background: '#0F0705' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'rgba(255,248,240,0.45)' }}>Это всё 🌿</p>
            <button className="btn-primary" onClick={() => { setPage(0); setHasMore(true); load(true) }}>Обновить</button>
          </div>
        )}
        {!loading && products.length === 0 && (
          <div className="feed-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: '#0F0705', textAlign: 'center', padding: 40 }}>
            <span style={{ fontSize: '3rem' }}>🌿</span>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'rgba(255,248,240,0.6)' }}>Лента пуста</p>
            {tab === 'favorite' && <button className="btn-primary" onClick={() => setTab('all')}>Смотреть все</button>}
          </div>
        )}
      </div>
    </div>
  )
}
