import { Link } from 'react-router-dom'
import { ArrowRight, Zap, ShoppingBag, Users } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function HomePage() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px' }}>

      {/* Hero */}
      <div style={{
        textAlign: 'center', marginBottom: 80,
        animation: 'pageIn 0.6s ease-out',
      }}>
        <style>{`@keyframes pageIn { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:none } }`}</style>

        <div className="badge badge-saffron" style={{ marginBottom: 20, fontSize: '0.8rem' }}>
          🚀 Платформа нового поколения
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.5rem, 7vw, 5rem)',
          fontWeight: 700, lineHeight: 1.1,
          color: 'var(--choco)',
          marginBottom: 24,
        }}>
          Создай бренд.<br />
          <span style={{ color: 'var(--saffron)' }}>Продавай идею.</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
          color: 'var(--choco-mid)', maxWidth: 560, margin: '0 auto 40px',
          lineHeight: 1.7,
        }}>
          BrandMarket — это маркетплейс, соцсеть и производство в одном месте.
          Ты придумываешь — мы делаем.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/feed">
            <button className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              Смотреть ленту <ArrowRight size={18} />
            </button>
          </Link>
          {!isAuthenticated && (
            <Link to="/register">
              <button className="btn-ghost" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                Создать бренд
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 80 }}>
        {[
          {
            icon: '📱',
            title: 'Лента как TikTok',
            desc: 'Листай товары вертикальным скроллом. Каждый свайп — новый бренд, новая история.',
            link: '/feed', cta: 'Открыть ленту',
          },
          {
            icon: '🎨',
            title: '3D Конструктор',
            desc: 'Создавай одежду в браузере. Выбирай цвет, принт, модель — и отправляй в производство.',
            link: '/brand/create', cta: 'Создать бренд',
          },
          {
            icon: '🏭',
            title: 'Своё производство',
            desc: 'Мы сами шьём, печатаем и доставляем. Минимум 20 штук — и бренд уже существует.',
            link: '/feed', cta: 'Узнать больше',
          },
        ].map((f, i) => (
          <div
            key={i}
            className="card"
            style={{
              padding: 28,
              animationDelay: `${i * 0.1}s`,
              animation: 'pageIn 0.6s ease-out both',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{f.icon}</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--choco)', marginBottom: 10 }}>
              {f.title}
            </h3>
            <p style={{ color: 'var(--choco-mid)', lineHeight: 1.6, marginBottom: 20, fontSize: '0.9rem' }}>
              {f.desc}
            </p>
            <Link to={f.link} style={{ textDecoration: 'none' }}>
              <button className="btn-ghost" style={{ fontSize: '0.85rem' }}>{f.cta} →</button>
            </Link>
          </div>
        ))}
      </div>

      {/* Stats banner */}
      <div style={{
        background: 'var(--choco)',
        borderRadius: 24, padding: '48px 40px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 32, textAlign: 'center',
      }}>
        {[
          { icon: <Zap size={24} />, value: '3 в 1', label: 'Соцсеть + маркетплейс + производство' },
          { icon: <ShoppingBag size={24} />, value: 'от 20 шт', label: 'Минимальный заказ бренда' },
          { icon: <Users size={24} />, value: '∞', label: 'Брендов которые можно создать' },
        ].map((s, i) => (
          <div key={i}>
            <div style={{ color: 'var(--saffron)', marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
              {s.icon}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--cream)', marginBottom: 6 }}>
              {s.value}
            </div>
            <div style={{ color: 'rgba(255,248,240,0.6)', fontSize: '0.85rem', lineHeight: 1.4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
