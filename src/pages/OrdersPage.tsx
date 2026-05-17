import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Clock, CheckCircle, Truck, ShoppingBag } from 'lucide-react'
import { orderApi } from '../api/services'
import type { Order, OrderStatus } from '../types'
import toast from 'react-hot-toast'
import BackButton from '../components/ui/BackButton'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:    { label: 'Ожидает',      color: '#C8873A', icon: <Clock size={14} /> },
  CONFIRMED:  { label: 'Подтверждён',  color: '#1976D2', icon: <CheckCircle size={14} /> },
  PRINTING:   { label: 'Печать',       color: '#7B1FA2', icon: <Package size={14} /> },
  SEWING:     { label: 'Пошив',        color: '#F57C00', icon: <Package size={14} /> },
  PACKAGING:  { label: 'Упаковка',     color: '#0288D1', icon: <Package size={14} /> },
  READY:      { label: 'Готов',        color: '#388E3C', icon: <CheckCircle size={14} /> },
  SHIPPED:    { label: 'В доставке',   color: '#00796B', icon: <Truck size={14} /> },
  DELIVERED:  { label: 'Доставлен',    color: '#2E7D32', icon: <CheckCircle size={14} /> },
  CANCELLED:  { label: 'Отменён',      color: '#C62828', icon: <Clock size={14} /> },
}

function OrderCard({ order }: { order: Order }) {
  const status = STATUS_CONFIG[order.status]

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Product image */}
        <div style={{
          width: 80, height: 80, borderRadius: 12, flexShrink: 0,
          background: order.productImage ? `url(${order.productImage}) center/cover` : 'var(--dust)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--border)',
        }}>
          {!order.productImage && <ShoppingBag size={24} style={{ color: 'var(--choco-light)', opacity: 0.5 }} />}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <Link to={`/product/${order.productId}`} style={{ textDecoration: 'none' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--choco)', marginBottom: 4 }}>{order.productName}</h3>
              </Link>
              <p style={{ fontSize: '0.82rem', color: 'var(--choco-light)', marginBottom: 8 }}>
                {order.brandName} · {order.quantity} шт · {order.size || 'размер не указан'}
              </p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px',
              borderRadius: 999, background: `${status.color}18`,
              color: status.color, fontSize: '0.78rem', fontWeight: 700,
            }}>
              {status.icon} {status.label}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--choco)' }}>
              {order.totalPrice.toLocaleString()} ₽
            </span>
            <div style={{ fontSize: '0.78rem', color: 'var(--choco-light)' }}>
              Заказ #{order.id} · {new Date(order.createdAt).toLocaleDateString('ru')}
            </div>
          </div>

          {order.estimatedDeliveryDate && (
            <p style={{ fontSize: '0.78rem', color: 'var(--choco-light)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Truck size={12} />
              Ожидаемая доставка: {new Date(order.estimatedDeliveryDate).toLocaleDateString('ru', { day: 'numeric', month: 'long' })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all')

  useEffect(() => {
    orderApi.getMyOrders()
      .then(setOrders)
      .catch(() => toast.error('Ошибка загрузки заказов'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter(o => {
    if (filter === 'active') return !['DELIVERED', 'CANCELLED'].includes(o.status)
    if (filter === 'done') return ['DELIVERED', 'CANCELLED'].includes(o.status)
    return true
  })

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
      <BackButton to='/' />
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--choco)', marginBottom: 28 }}>
        Мои заказы
      </h1>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--cream)', borderRadius: 12, padding: 4, border: '1px solid var(--border)', width: 'fit-content' }}>
        {[
          { key: 'all', label: `Все (${orders.length})` },
          { key: 'active', label: 'Активные' },
          { key: 'done', label: 'Завершённые' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key as any)} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 600,
            background: filter === f.key ? 'var(--saffron)' : 'transparent',
            color: filter === f.key ? 'var(--cream)' : 'var(--choco-mid)',
            transition: 'all 0.2s',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--saffron)', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <ShoppingBag size={48} style={{ color: 'var(--border-dark)', margin: '0 auto 16px' }} />
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--choco-mid)', marginBottom: 12 }}>
            {filter === 'all' ? 'Заказов пока нет' : 'Нет заказов в этой категории'}
          </p>
          <Link to="/feed">
            <button className="btn-primary">Перейти в ленту</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  )
}
