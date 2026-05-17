import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import { brandApi, productApi } from '../../api/services'
import type { Brand, Product } from '../../types'
import toast from 'react-hot-toast'
import BackButton from '../../components/ui/BackButton'

export default function BrandPage() {
  const { id } = useParams<{ id: string }>()
  const [brand, setBrand] = useState<Brand | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      brandApi.getById(Number(id)),
      productApi.getByBrand(Number(id)),
    ])
      .then(([b, p]) => { setBrand(b); setProducts(p) })
      .catch(() => toast.error('Бренд не найден'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--saffron)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!brand) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--choco-mid)' }}>Бренд не найден</h2>
    </div>
  )

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>

      <BackButton />
      {/* Brand header */}
      <div className="card" style={{ padding: 36, marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Logo */}
          <div style={{
            width: 88, height: 88, borderRadius: 18, flexShrink: 0,
            background: brand.logo ? `url(${brand.logo}) center/cover` : 'var(--saffron)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 700, color: 'var(--cream)',
            border: '2px solid var(--border)',
          }}>
            {!brand.logo && brand.name[0]}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--choco)' }}>
                {brand.name}
              </h1>
              {brand.type && <span className="badge badge-saffron">{brand.type}</span>}
            </div>

            <Link to={`/profile/${brand.ownerUsername}`} style={{ textDecoration: 'none' }}>
              <p style={{ color: 'var(--choco-light)', fontSize: '0.875rem', marginBottom: 14 }}>
                от <span style={{ color: 'var(--saffron)', fontWeight: 600 }}>@{brand.ownerUsername}</span>
              </p>
            </Link>

            {brand.description && (
              <p style={{ color: 'var(--choco-mid)', lineHeight: 1.7, maxWidth: 560, marginBottom: 16 }}>
                {brand.description}
              </p>
            )}

            {/* Brand details */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {brand.color && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: brand.color, border: '1px solid var(--border)' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--choco-light)' }}>Основной цвет</span>
                </div>
              )}
              <span style={{ fontSize: '0.8rem', color: 'var(--choco-light)' }}>
                📦 Минимальный заказ: <strong>{brand.minQuantity} шт</strong>
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--choco-light)' }}>
                🛍 {brand.productCount} товаров
              </span>
            </div>
          </div>
        </div>

        {/* Positioning & history */}
        {(brand.positioning || brand.history) && (
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {brand.positioning && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--choco)', marginBottom: 8 }}>Позиционирование</h3>
                <p style={{ color: 'var(--choco-mid)', fontSize: '0.875rem', lineHeight: 1.6 }}>{brand.positioning}</p>
              </div>
            )}
            {brand.history && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--choco)', marginBottom: 8 }}>История бренда</h3>
                <p style={{ color: 'var(--choco-mid)', fontSize: '0.875rem', lineHeight: 1.6 }}>{brand.history}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Products */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--choco)', marginBottom: 20 }}>
        Товары бренда
      </h2>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--choco-light)' }}>
          Товаров пока нет
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {products.map(p => (
            <Link to={`/product/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{
                  height: 200,
                  background: p.images?.[0] ? `url(${p.images[0]}) center/cover` : 'var(--dust)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {!p.images?.[0] && <ShoppingBag size={36} style={{ color: 'var(--choco-light)' }} />}
                </div>
                <div style={{ padding: 14 }}>
                  <p style={{ fontWeight: 600, color: 'var(--choco)', marginBottom: 6 }}>{p.name}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--saffron)' }}>
                      {p.price.toLocaleString()} ₽
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--choco-light)', fontSize: '0.8rem' }}>
                      <Heart size={12} fill={p.isLiked ? 'var(--saffron)' : 'none'} stroke="currentColor" /> {p.likesCount}
                    </span>
                  </div>
                  {p.size && <p style={{ fontSize: '0.75rem', color: 'var(--choco-light)', marginTop: 4 }}>Размер: {p.size}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
