import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, ShoppingBag, Tag } from 'lucide-react'
import { searchApi } from '../api/services'
import type { Product, Brand } from '../types'
import toast from 'react-hot-toast'
import BackButton from '../components/ui/BackButton'

export default function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'all' | 'products' | 'brands'>('all')

  useEffect(() => {
    if (!q) return
    setLoading(true)
    searchApi.all(q)
      .then(res => { setProducts(res.products); setBrands(res.brands) })
      .catch(() => toast.error('Ошибка поиска'))
      .finally(() => setLoading(false))
  }, [q])

  const total = products.length + brands.length

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
      <BackButton to='/' />
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Search size={20} style={{ color: 'var(--saffron)' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--choco)' }}>
            Поиск: «{q}»
          </h1>
        </div>
        {!loading && (
          <p style={{ color: 'var(--choco-light)', fontSize: '0.9rem' }}>
            Найдено: {total} результатов
          </p>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--cream)', borderRadius: 12, padding: 4, border: '1px solid var(--border)', width: 'fit-content' }}>
        {[
          { key: 'all', label: `Все (${total})` },
          { key: 'products', label: `Товары (${products.length})` },
          { key: 'brands', label: `Бренды (${brands.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 600,
            background: tab === t.key ? 'var(--saffron)' : 'transparent',
            color: tab === t.key ? 'var(--cream)' : 'var(--choco-mid)',
            transition: 'all 0.2s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--saffron)', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!loading && total === 0 && q && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--choco-mid)', marginBottom: 8 }}>Ничего не найдено</p>
          <p style={{ color: 'var(--choco-light)' }}>Попробуйте другой запрос</p>
        </div>
      )}

      {/* Products */}
      {!loading && (tab === 'all' || tab === 'products') && products.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          {tab === 'all' && (
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--choco)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={18} style={{ color: 'var(--saffron)' }} /> Товары
            </h2>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {products.map(p => (
              <Link to={`/product/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{
                    height: 180,
                    background: p.images?.[0] ? `url(${p.images[0]}) center/cover` : 'var(--dust)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {!p.images?.[0] && <ShoppingBag size={36} style={{ color: 'var(--choco-light)', opacity: 0.5 }} />}
                  </div>
                  <div style={{ padding: 14 }}>
                    <p style={{ fontWeight: 600, color: 'var(--choco)', marginBottom: 4, fontSize: '0.9rem' }}>{p.name}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--choco-light)', marginBottom: 8 }}>{p.brandName}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--saffron)', fontWeight: 700 }}>
                        {p.price.toLocaleString()} ₽
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Brands */}
      {!loading && (tab === 'all' || tab === 'brands') && brands.length > 0 && (
        <div>
          {tab === 'all' && (
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--choco)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag size={18} style={{ color: 'var(--saffron)' }} /> Бренды
            </h2>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {brands.map(b => (
              <Link to={`/brand/${b.id}`} key={b.id} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: 20, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: 12, flexShrink: 0,
                      background: b.logo ? `url(${b.logo}) center/cover` : (b.color || 'var(--saffron)'),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--cream)', fontWeight: 700, fontSize: '1.2rem',
                    }}>
                      {!b.logo && b.name[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--choco)', marginBottom: 2 }}>{b.name}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--choco-light)' }}>@{b.ownerUsername} · {b.productCount} товаров</p>
                    </div>
                  </div>
                  {b.description && (
                    <p style={{ marginTop: 10, fontSize: '0.82rem', color: 'var(--choco-mid)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {b.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
