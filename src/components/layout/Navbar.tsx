import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingCart, LogOut, LayoutGrid, Bell, Briefcase } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useState, useEffect } from 'react'
import { notificationApi } from '../../api/services'

export default function Navbar() {
  const { isAuthenticated, user, logout, role } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) return
    notificationApi.getUnreadCount()
      .then(d => setUnread(d.count))
      .catch(() => {})
    // Poll every 30s
    const interval = setInterval(() => {
      notificationApi.getUnreadCount()
        .then(d => setUnread(d.count))
        .catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  const handleLogout = () => { logout(); navigate('/') }
  const isActive = (path: string) => location.pathname === path

  return (
    <header style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 24 }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--choco)' }}>
            Brand<span style={{ color: 'var(--saffron)' }}>Market</span>
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--choco-light)' }} />
            <input className="input" style={{ paddingLeft: 40 }}
              placeholder="Поиск товаров, брендов..."
              value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </form>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
          <Link to="/feed" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" style={{
              borderColor: isActive('/feed') ? 'var(--saffron)' : undefined,
              color: isActive('/feed') ? 'var(--saffron)' : undefined,
            }}>Лента</button>
          </Link>

          {isAuthenticated ? (
            <>
              {/* Add product */}
              <Link to="/product/create" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
                  + Товар
                </button>
              </Link>

              {/* Creator dashboard */}
              <Link to="/creator" style={{ textDecoration: 'none' }}>
                <button className="btn-icon" title="Панель создателя">
                  <Briefcase size={19} />
                </button>
              </Link>

              {/* Notifications */}
              <Link to="/notifications" style={{ textDecoration: 'none' }}>
                <button className="btn-icon" title="Уведомления" style={{ position: 'relative' }}>
                  <Bell size={19} />
                  {unread > 0 && (
                    <span style={{
                      position: 'absolute', top: 4, right: 4,
                      width: 16, height: 16, borderRadius: '50%',
                      background: 'var(--saffron)', color: 'var(--cream)',
                      fontSize: '0.6rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid var(--cream)',
                    }}>
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>
              </Link>

              {/* Orders */}
              <Link to="/orders" style={{ textDecoration: 'none' }}>
                <button className="btn-icon" title="Мои заказы">
                  <ShoppingCart size={20} />
                </button>
              </Link>

              {/* Admin/Worker panel */}
              {(role === 'ADMIN' || role === 'WORKER') && (
                <Link to="/admin" style={{ textDecoration: 'none' }}>
                  <button className="btn-icon" title="Панель управления">
                    <LayoutGrid size={20} />
                  </button>
                </Link>
              )}

              {/* Profile */}
              <Link to={`/profile/${user?.username}`} style={{ textDecoration: 'none' }}>
                <button className="btn-icon" title="Профиль">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.username} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: 'var(--saffron)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--cream)', fontSize: '0.8rem', fontWeight: 700,
                    }}>
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </button>
              </Link>

              {/* Logout */}
              <button className="btn-icon" onClick={handleLogout} title="Выйти">
                <LogOut size={18} style={{ color: 'var(--choco-light)' }} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button className="btn-ghost">Войти</button>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <button className="btn-primary">Регистрация</button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
