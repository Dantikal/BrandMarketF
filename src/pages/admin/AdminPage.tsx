import { useEffect, useState } from 'react'
import { factoryApi } from '../../api/services'
import type { FactoryOrder } from '../../types'
import { useAuthStore } from '../../store/authStore'
import { Navigate } from 'react-router-dom'
import { Calendar, User } from 'lucide-react'
import toast from 'react-hot-toast'
import BackButton from '../../components/ui/BackButton'

type FactoryStage = 'NEW' | 'IN_PROGRESS' | 'PRINTING' | 'SEWING' | 'DONE'

const STAGES: { key: FactoryStage; label: string; emoji: string; color: string }[] = [
  { key: 'NEW',         label: 'Новые',      emoji: '📥', color: '#9C7A5A' },
  { key: 'IN_PROGRESS', label: 'В работе',   emoji: '⚙️',  color: 'var(--saffron)' },
  { key: 'PRINTING',    label: 'Печать',     emoji: '🖨️', color: '#7B6B3A' },
  { key: 'SEWING',      label: 'Пошив',      emoji: '🧵', color: '#5C4A28' },
  { key: 'DONE',        label: 'Готово',     emoji: '✅', color: '#2E7D32' },
]

function KanbanCard({ order, isWorker, onMove }: {
  order: FactoryOrder
  isWorker: boolean
  onMove: (id: number, stage: FactoryStage) => void
}) {
  const isOverdue = order.deadline && new Date(order.deadline) < new Date()

  return (
    <div style={{
      background: 'var(--cream)',
      border: `1px solid ${isOverdue ? 'rgba(183,28,28,0.3)' : 'var(--border)'}`,
      borderRadius: 12, padding: 14, marginBottom: 10,
      boxShadow: isOverdue ? '0 0 0 2px rgba(183,28,28,0.08)' : 'none',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: order.brandLogo ? `url(${order.brandLogo}) center/cover` : 'var(--saffron)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--cream)', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
        }}>
          {!order.brandLogo && order.brandName[0]}
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--choco)' }}>{order.brandName}</p>
          <p style={{ fontSize: '0.72rem', color: 'var(--choco-light)' }}>#{order.id}</p>
        </div>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {order.clothingType && <span className="badge" style={{ background: 'var(--dust)', color: 'var(--choco-mid)', fontSize: '0.68rem' }}>{order.clothingType}</span>}
        {order.color && <span className="badge" style={{ background: 'var(--dust)', color: 'var(--choco-mid)', fontSize: '0.68rem' }}>{order.color}</span>}
        <span className="badge" style={{ background: 'var(--dust)', color: 'var(--choco-mid)', fontSize: '0.68rem' }}>{order.quantity} шт</span>
      </div>

      {/* Deadline */}
      {order.deadline && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: '0.72rem', color: isOverdue ? '#C62828' : 'var(--choco-light)',
          marginBottom: 10, fontWeight: isOverdue ? 700 : 400,
        }}>
          <Calendar size={11} />
          {new Date(order.deadline).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
          {isOverdue && ' — Просрочен!'}
        </div>
      )}

      {/* Worker */}
      {order.workerUsername && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--choco-light)', marginBottom: 10 }}>
          <User size={11} /> @{order.workerUsername}
        </div>
      )}

      {/* Move buttons */}
      {isWorker && order.stage !== 'DONE' && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {order.stage === 'NEW' && (
            <button className="btn-primary" onClick={() => onMove(order.id, 'IN_PROGRESS')}
              style={{ fontSize: '0.72rem', padding: '4px 10px' }}>Взять</button>
          )}
          {order.stage === 'IN_PROGRESS' && (
            <button className="btn-primary" onClick={() => onMove(order.id, 'PRINTING')}
              style={{ fontSize: '0.72rem', padding: '4px 10px' }}>→ Печать</button>
          )}
          {order.stage === 'PRINTING' && (
            <button className="btn-primary" onClick={() => onMove(order.id, 'SEWING')}
              style={{ fontSize: '0.72rem', padding: '4px 10px' }}>→ Пошив</button>
          )}
          {order.stage === 'SEWING' && (
            <button className="btn-primary" onClick={() => onMove(order.id, 'DONE')}
              style={{ fontSize: '0.72rem', padding: '4px 10px' }}>✓ Готово</button>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  const { role } = useAuthStore()
  const [orders, setOrders] = useState<FactoryOrder[]>([])
  const [loading, setLoading] = useState(true)
  const isWorker = role === 'WORKER'
  const isAdmin = role === 'ADMIN'

  if (!isWorker && !isAdmin) return <Navigate to="/" replace />

  useEffect(() => {
    const loader = isWorker
      ? Promise.all([factoryApi.getAvailable(), factoryApi.getMy()])
          .then(([avail, my]) => [...my, ...avail.filter(a => !my.find(m => m.id === a.id))])
      : factoryApi.getAll()

    loader.then(setOrders)
      .catch(() => toast.error('Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [isWorker])

  const handleMove = async (id: number, stage: FactoryStage) => {
    try {
      const updated = isWorker
        ? await factoryApi.take(id).catch(() => factoryApi.complete(id))
        : await factoryApi.moveStage(id, stage)
      setOrders(prev => prev.map(o => o.id === id ? updated : o))
      toast.success('Статус обновлён')
    } catch { toast.error('Ошибка обновления') }
  }

  const grouped = STAGES.reduce((acc, s) => {
    acc[s.key] = orders.filter(o => o.stage === s.key)
    return acc
  }, {} as Record<FactoryStage, FactoryOrder[]>)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <BackButton to='/' />
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--choco)', marginBottom: 4 }}>
          {isAdmin ? 'Панель администратора' : 'Мои задачи'}
        </h1>
        <p style={{ color: 'var(--choco-light)' }}>
          Производственный Kanban · {orders.length} заказов
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--saffron)', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, overflowX: 'auto' }}>
          {STAGES.map(stage => (
            <div key={stage.key} style={{ minWidth: 200 }}>
              {/* Column header */}
              <div style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 12,
                background: `${stage.color}18`, border: `1px solid ${stage.color}30`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: stage.color }}>
                  {stage.emoji} {stage.label}
                </span>
                <span style={{
                  background: stage.color, color: 'var(--cream)',
                  borderRadius: 999, width: 20, height: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 700,
                }}>
                  {grouped[stage.key]?.length || 0}
                </span>
              </div>

              {/* Cards */}
              <div>
                {grouped[stage.key]?.length === 0 ? (
                  <div style={{
                    padding: '20px 14px', textAlign: 'center',
                    border: '1px dashed var(--border)', borderRadius: 10,
                    color: 'var(--choco-light)', fontSize: '0.78rem',
                  }}>
                    Пусто
                  </div>
                ) : (
                  grouped[stage.key].map(order => (
                    <KanbanCard
                      key={order.id}
                      order={order}
                      isWorker={true}
                      onMove={handleMove}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
