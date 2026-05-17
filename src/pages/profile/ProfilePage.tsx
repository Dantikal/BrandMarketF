import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ExternalLink, UserPlus, UserCheck, ShoppingBag, Heart } from 'lucide-react'
import { userApi, brandApi, productApi, socialApi } from '../../api/services'
import { useAuthStore } from '../../store/authStore'
import type { User, Brand, Product } from '../../types'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user: currentUser, isAuthenticated } = useAuthStore()
  const [user, setUser] = useState<User | null>(null)
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [tab, setTab] = useState<'products' | 'brands'>('products')
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)

  const isOwnProfile = currentUser?.username === username

  useEffect(() => {
    if (!username) return
    setLoading(true)
    userApi.getByUsername(username)
      .then(async (u) => {
        setUser(u)
        setFollowing(u.isFollowing)
        const [b, p] = await Promise.all([
          brandApi.getByUser(u.id),
          productApi.getFeed(0, 20),
        ])
        setBrands(b)
        setProducts(p.content.filter(pr => pr.ownerId === u.id))
      })
      .catch(() => toast.error('Пользователь не найден'))
      .finally(() => setLoading(false))
  }, [username])

  const handleFollow = async () => {
    if (!isAuthenticated || !user) { return }
    try {
      const res = await socialApi.toggleFollow(user.id)
      setFollowing(res.following)
      setUser(u => u ? { ...u, followersCount: u.followersCount + (res.following ? 1 : -1) } : u)
    } catch { toast.error('Ошибка') }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--saffron)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (!user) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--choco-mid)' }}>Пользователь не найден</h2>
    </div>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

      {/* Profile header */}
      <div className="card" style={{ padding: 36, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Avatar */}
          <div style={{
            width: 100, height: 100, borderRadius: '50%', flexShrink: 0,
            background: user.avatar ? `url(${user.avatar}) center/cover` : 'var(--saffron)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', fontWeight: 700,
            color: 'var(--cream)', border: '3px solid var(--border)',
          }}>
            {!user.avatar && user.name?.[0]?.toUpperCase()}
          </div>

          <div style={{ flex: 1 }}>
            {/* Name + role */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--choco)' }}>
                {user.name}
              </h1>
              <span className="badge badge-saffron">{user.role}</span>
            </div>
            <p style={{ color: 'var(--choco-light)', marginBottom: 12 }}>@{user.username}</p>

            {user.bio && (
              <p style={{ color: 'var(--choco-mid)', marginBottom: 16, lineHeight: 1.6, maxWidth: 480 }}>
                {user.bio}
              </p>
            )}

            {/* Stats */}
            <div style={{ display: 'flex', gap: 28, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Подписчики', value: user.followersCount },
                { label: 'Подписки', value: user.followingCount },
                { label: 'Лайки', value: user.likesCount },
                { label: 'Брендов', value: brands.length },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--choco)' }}>
                    {s.value.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--choco-light)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {isOwnProfile ? (
                <Link to="/profile/edit">
                  <button className="btn-ghost">Редактировать профиль</button>
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleFollow}
                    className={following ? 'btn-ghost' : 'btn-primary'}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    {following ? <UserCheck size={16} /> : <UserPlus size={16} />}
                    {following ? 'Подписан' : 'Подписаться'}
                  </button>
                  <Link to={`/chat/${user.id}`}>
                    <button className="btn-ghost">Написать</button>
                  </Link>
                </>
              )}

              {/* Social links */}
              {user.instagramLink && (
                <a href={user.instagramLink} target="_blank" rel="noreferrer">
                  <button className="btn-icon"><ExternalLink size={18} /></button>
                </a>
              )}
              {user.tiktokLink && (
                <a href={user.tiktokLink} target="_blank" rel="noreferrer">
                  <button className="btn-icon"><ExternalLink size={18} /></button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--cream)', borderRadius: 12, padding: 4, border: '1px solid var(--border)', width: 'fit-content' }}>
        {[
          { key: 'products', label: '👗 Товары', icon: <ShoppingBag size={16} /> },
          { key: 'brands', label: '🏷️ Бренды', icon: null },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 600,
              background: tab === t.key ? 'var(--saffron)' : 'transparent',
              color: tab === t.key ? 'var(--cream)' : 'var(--choco-mid)',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {tab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {products.length === 0 ? (
            <p style={{ color: 'var(--choco-light)', gridColumn: '1/-1', padding: 40, textAlign: 'center' }}>
              Товаров пока нет
            </p>
          ) : products.map(p => (
            <Link to={`/product/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{
                  height: 200,
                  background: p.images?.[0] ? `url(${p.images[0]}) center/cover` : 'var(--dust)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {!p.images?.[0] && <ShoppingBag size={40} style={{ color: 'var(--choco-light)' }} />}
                </div>
                <div style={{ padding: 14 }}>
                  <p style={{ fontWeight: 600, color: 'var(--choco)', marginBottom: 4 }}>{p.name}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--saffron)' }}>
                      {p.price.toLocaleString()} ₽
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--choco-light)', fontSize: '0.8rem' }}>
                      <Heart size={12} /> {p.likesCount}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Brands grid */}
      {tab === 'brands' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {brands.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60 }}>
              <p style={{ color: 'var(--choco-light)', marginBottom: 20 }}>Брендов пока нет</p>
              {isOwnProfile && (
                <Link to="/brand/create">
                  <button className="btn-primary">Создать бренд</button>
                </Link>
              )}
            </div>
          ) : brands.map(b => (
            <Link to={`/brand/${b.id}`} key={b.id} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 20, cursor: 'pointer' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                    background: b.logo ? `url(${b.logo}) center/cover` : 'var(--saffron)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--cream)', fontWeight: 700, fontSize: '1.2rem',
                  }}>
                    {!b.logo && b.name[0]}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--choco)' }}>{b.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--choco-light)' }}>{b.type || 'Бренд одежды'} · {b.productCount} товаров</p>
                  </div>
                </div>
                {b.description && (
                  <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--choco-mid)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {b.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
          {isOwnProfile && (
            <Link to="/brand/create" style={{ textDecoration: 'none' }}>
              <div style={{
                border: '2px dashed var(--border-dark)', borderRadius: 16,
                padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 8, minHeight: 120, cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--saffron)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-dark)')}
              >
                <span style={{ fontSize: '1.5rem' }}>+</span>
                <span style={{ color: 'var(--choco-light)', fontSize: '0.875rem', fontWeight: 600 }}>Новый бренд</span>
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
