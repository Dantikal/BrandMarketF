import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, ShoppingBag, Package, Eye, Plus } from 'lucide-react'
import { creatorApi, brandApi } from '../../api/services'
import { useAuthStore } from '../../store/authStore'
import BackButton from '../../components/ui/BackButton'
import type { Order, Brand } from '../../types'

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#C8873A', CONFIRMED: '#1976D2', PRINTING: '#7B1FA2',
  SEWING: '#F57C00', PACKAGING: '#0288D1', READY: '#388E3C',
  SHIPPED: '#00796B', DELIVERED: '#2E7D32', CANCELLED: '#C62828',
}
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ожидает', CONFIRMED: 'Подтверждён', PRINTING: 'Печать',
  SEWING: 'Пошив', PACKAGING: 'Упаковка', READY: 'Готов',
  SHIPPED: 'Отправлен', DELIVERED: 'Доставлен', CANCELLED: 'Отменён',
}

export default function CreatorDashboardPage() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'orders' | 'brands'>('orders')

  useEffect(() => {
    if (!user) return
    Promise.all([
      creatorApi.getMyOrders().catch(() => []),
      brandApi.getByUser(user.id).catch(() => []),
    ]).then(([o, b]) => {
      setOrders(o)
      setBrands(b)
    }).finally(() => setLoading(false))
  }, [user])

  // Stats
  const totalRevenue = orders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Number(o.totalPrice), 0)
  const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length
  const totalProducts = brands.reduce((s, b) => s + b.productCount, 0)

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
      <BackButton to="/" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', color: 'var(--choco)', marginBottom: 4 }}>
            Панель создателя
          </h1>
          <p style={{ color: 'var(--choco-light)' }}>@{user?.username}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/brand/create" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={15} /> Бренд
            </button>
          </Link>
          <Link to="/product/create" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={15} /> Товар
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 32 }}>
        {[
          { icon: <TrendingUp size={22} />, label: 'Выручка', value: `${totalRevenue.toLocaleString()} ₽`, color: 'var(--saffron)' },
          { icon: <ShoppingBag size={22} />, label: 'Активных заказов', value: activeOrders, color: '#1976D2' },
          { icon: <Package size={22} />, label: 'Всего заказов', value: orders.length, color: '#7B1FA2' },
          { icon: <Eye size={22} />, label: 'Товаров', value: totalProducts, color: '#2E7D32' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ color: s.color, marginBottom: 10 }}>{s.icon}</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--choco)', marginBottom: 2 }}>
              {s.value}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--choco-light)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--cream)', borderRadius: 12, padding: 4, border: '1px solid var(--border)', width: 'fit-content' }}>
        {[
          { key: 'orders', label: `📦 Заказы (${orders.length})` },
          { key: 'brands', label: `🏷️ Бренды (${brands.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 600,
            background: tab === t.key ? 'var(--saffron)' : 'transparent',
            color: tab === t.key ? 'var(--cream)' : 'var(--choco-mid)',
            transition: 'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--saffron)', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : tab === 'orders' ? (
        // Orders table
        orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <ShoppingBag size={40} style={{ color: 'var(--border-dark)', margin: '0 auto 16px', display: 'block' }} />
            <p style={{ color: 'var(--choco-light)' }}>Заказов пока нет</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {orders.map(order => (
              <div key={order.id} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Product image */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 10, flexShrink: 0,
                    background: order.productImage ? `url(${order.productImage}) center/cover` : 'var(--dust)',
                    border: '1px solid var(--border)',
                  }} />

                  <div style={{ flex: 1, minWidth: 160 }}>
                    <p style={{ fontWeight: 700, color: 'var(--choco)', marginBottom: 2 }}>{order.productName}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--choco-light)' }}>
                      Заказ #{order.id} · @{order.username} · {order.quantity} шт {order.size ? `· ${order.size}` : ''}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 999,
                      background: `${STATUS_COLORS[order.status]}18`,
                      color: STATUS_COLORS[order.status],
                      fontSize: '0.78rem', fontWeight: 700,
                    }}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--choco)' }}>
                      {Number(order.totalPrice).toLocaleString()} ₽
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--choco-light)' }}>
                      {new Date(order.createdAt).toLocaleDateString('ru')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // Brands grid
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {brands.map(b => (
            <Link to={`/brand/${b.id}`} key={b.id} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: b.logo ? `url(${b.logo}) center/cover` : (b.color || 'var(--saffron)'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--cream)', fontWeight: 700,
                  }}>
                    {!b.logo && b.name[0]}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--choco)' }}>{b.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--choco-light)' }}>{b.type || 'Бренд'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--choco-light)' }}>{b.productCount} товаров</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--choco-light)' }}>от {b.minQuantity} шт</span>
                </div>
              </div>
            </Link>
          ))}
          <Link to="/brand/create" style={{ textDecoration: 'none' }}>
            <div style={{
              border: '2px dashed var(--border-dark)', borderRadius: 16, padding: 20,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 8, minHeight: 120, cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--saffron)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-dark)')}
            >
              <Plus size={22} style={{ color: 'var(--choco-light)' }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--choco-light)', fontWeight: 600 }}>Новый бренд</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
