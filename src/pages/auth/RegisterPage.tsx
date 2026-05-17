import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, AtSign } from 'lucide-react'
import { authApi } from '../../api/services'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', username: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Пароль должен быть не менее 6 символов')
      return
    }
    setLoading(true)
    try {
      const data = await authApi.register(form)
      setAuth(data)
      toast.success('Аккаунт создан! Добро пожаловать 🎉')
      navigate('/feed')
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.email || 'Ошибка регистрации'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const field = (key: keyof typeof form, label: string, placeholder: string, icon: React.ReactNode, type = 'text') => (
    <div>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--choco-mid)', marginBottom: 8 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--choco-light)' }}>
          {icon}
        </div>
        <input
          className="input"
          style={{ paddingLeft: 40 }}
          type={type}
          placeholder={placeholder}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          required
        />
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--dust-light)',
      padding: 24,
    }}>
      <div style={{
        position: 'fixed', top: -100, left: -100,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,135,58,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-slide-up" style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--choco)' }}>
              Brand<span style={{ color: 'var(--saffron)' }}>Market</span>
            </h1>
          </Link>
          <p style={{ color: 'var(--choco-light)', marginTop: 8, fontSize: '0.9rem' }}>
            Создайте свой бренд сегодня
          </p>
        </div>

        <div className="card" style={{ padding: 36 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {field('name', 'Ваше имя', 'Иван Иванов', <User size={16} />)}
            {field('username', 'Никнейм', '@username', <AtSign size={16} />)}
            {field('email', 'Email', 'you@gmail.com', <Mail size={16} />, 'email')}

            {/* Password with toggle */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--choco-mid)', marginBottom: 8 }}>
                Пароль
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--choco-light)' }} />
                <input
                  className="input"
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Минимум 6 символов"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--choco-light)', display: 'flex' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', padding: '0.75rem', marginTop: 4, fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Создаём аккаунт...' : 'Создать аккаунт'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ color: 'var(--choco-light)', fontSize: '0.8rem' }}>или</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <p style={{ textAlign: 'center', color: 'var(--choco-mid)', fontSize: '0.9rem' }}>
            Уже есть аккаунт?{' '}
            <Link to="/login" style={{ color: 'var(--saffron)', fontWeight: 600, textDecoration: 'none' }}>
              Войти
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--choco-light)', fontSize: '0.75rem', marginTop: 20 }}>
          Регистрируясь, вы принимаете условия использования платформы
        </p>
      </div>
    </div>
  )
}
