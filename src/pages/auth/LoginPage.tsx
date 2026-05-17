import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { authApi } from '../../api/services'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await authApi.login(form)
      setAuth(data)
      toast.success('Добро пожаловать!')
      navigate('/feed')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Неверный email или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--dust-light)',
      padding: 24,
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'fixed', top: -100, right: -100,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,135,58,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: -80, left: -80,
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,135,58,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-slide-up" style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--choco)',
            }}>
              Brand<span style={{ color: 'var(--saffron)' }}>Market</span>
            </h1>
          </Link>
          <p style={{ color: 'var(--choco-light)', marginTop: 8, fontSize: '0.9rem' }}>
            Войдите в свой аккаунт
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 36 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--choco-mid)', marginBottom: 8 }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--choco-light)' }} />
                <input
                  className="input"
                  style={{ paddingLeft: 40 }}
                  type="email"
                  placeholder="you@gmail.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Password */}
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
                  placeholder="••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--choco-light)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', marginTop: 4, fontSize: '1rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ color: 'var(--choco-light)', fontSize: '0.8rem' }}>или</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <p style={{ textAlign: 'center', color: 'var(--choco-mid)', fontSize: '0.9rem' }}>
            Нет аккаунта?{' '}
            <Link to="/register" style={{ color: 'var(--saffron)', fontWeight: 600, textDecoration: 'none' }}>
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
