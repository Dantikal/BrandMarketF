import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Heart, UserPlus, MessageCircle, ShoppingBag, Package, CheckCheck } from 'lucide-react'
import { notificationApi } from '../../api/services'
import BackButton from '../../components/ui/BackButton'
import toast from 'react-hot-toast'

type Notif = {
  id: number; type: string; message: string
  actorId?: number; actorUsername?: string; actorAvatar?: string
  referenceId?: number; referenceType?: string
  isRead: boolean; createdAt: string
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  LIKE:         { icon: <Heart size={16} />,         color: '#C8873A', label: 'Лайк' },
  FOLLOW:       { icon: <UserPlus size={16} />,      color: '#1976D2', label: 'Подписка' },
  COMMENT:      { icon: <MessageCircle size={16} />, color: '#7B1FA2', label: 'Комментарий' },
  ORDER_STATUS: { icon: <Package size={16} />,       color: '#2E7D32', label: 'Заказ' },
  NEW_ORDER:    { icon: <ShoppingBag size={16} />,   color: '#E65100', label: 'Новый заказ' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'только что'
  if (m < 60) return `${m} мин назад`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч назад`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} дн назад`
  return new Date(dateStr).toLocaleDateString('ru', { day: 'numeric', month: 'short' })
}

function getLink(n: Notif): string {
  if (n.referenceType === 'PRODUCT') return `/product/${n.referenceId}`
  if (n.referenceType === 'ORDER') return `/orders`
  if (n.referenceType === 'USER' && n.actorUsername) return `/profile/${n.actorUsername}`
  return '/'
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationApi.getAll()
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    await notificationApi.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    toast.success('Все прочитаны')
  }

  const markRead = async (id: number) => {
    await notificationApi.markRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
      <BackButton to="/" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--choco)', marginBottom: 4 }}>
            Уведомления
          </h1>
          {unreadCount > 0 && (
            <span style={{ fontSize: '0.85rem', color: 'var(--choco-light)' }}>
              {unreadCount} непрочитанных
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
            <CheckCheck size={15} /> Прочитать все
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--saffron)', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Bell size={48} style={{ color: 'var(--border-dark)', margin: '0 auto 16px', display: 'block' }} />
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--choco-mid)', marginBottom: 8 }}>
            Пока тихо
          </p>
          <p style={{ color: 'var(--choco-light)', fontSize: '0.9rem' }}>
            Здесь появятся лайки, подписки и обновления заказов
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {notifications.map(n => {
            const cfg = TYPE_CONFIG[n.type] || { icon: <Bell size={16} />, color: 'var(--choco-light)', label: '' }
            return (
              <Link key={n.id} to={getLink(n)} style={{ textDecoration: 'none' }}
                onClick={() => !n.isRead && markRead(n.id)}>
                <div style={{
                  display: 'flex', gap: 14, padding: '14px 16px',
                  borderRadius: 14, cursor: 'pointer',
                  background: n.isRead ? 'transparent' : 'rgba(200,135,58,0.05)',
                  border: `1px solid ${n.isRead ? 'transparent' : 'rgba(200,135,58,0.15)'}`,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--dust)')}
                onMouseLeave={e => (e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(200,135,58,0.05)')}
                >
                  {/* Actor avatar or type icon */}
                  <div style={{ flexShrink: 0, position: 'relative' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: n.actorAvatar ? `url(${n.actorAvatar}) center/cover` : 'var(--dust-dark)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', fontWeight: 700, color: 'var(--choco-mid)',
                    }}>
                      {!n.actorAvatar && (n.actorUsername?.[0]?.toUpperCase() || '?')}
                    </div>
                    {/* Type badge */}
                    <div style={{
                      position: 'absolute', bottom: -2, right: -2,
                      width: 20, height: 20, borderRadius: '50%',
                      background: cfg.color, border: '2px solid var(--cream)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff',
                    }}>
                      <div style={{ transform: 'scale(0.7)' }}>{cfg.icon}</div>
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      color: 'var(--choco)', fontSize: '0.9rem', lineHeight: 1.45,
                      fontWeight: n.isRead ? 400 : 600,
                      marginBottom: 3,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {n.message}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--choco-light)' }}>
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>

                  {!n.isRead && (
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--saffron)', flexShrink: 0, marginTop: 6,
                    }} />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
