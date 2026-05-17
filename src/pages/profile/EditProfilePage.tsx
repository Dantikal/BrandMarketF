import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Link as LinkIcon } from 'lucide-react'
import { userApi } from '../../api/services'
import { useAuthStore } from '../../store/authStore'
import BackButton from '../../components/ui/BackButton'
import toast from 'react-hot-toast'

export default function EditProfilePage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    bio: '',
    avatar: '',
    tiktokLink: '',
    instagramLink: '',
    facebookLink: '',
  })

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        tiktokLink: user.tiktokLink || '',
        instagramLink: user.instagramLink || '',
        facebookLink: user.facebookLink || '',
      })
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await userApi.update(form)
      setUser(updated)
      toast.success('Профиль обновлён!')
      navigate(`/profile/${user?.username}`)
    } catch {
      toast.error('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--cream)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '0.75rem 1rem',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    color: 'var(--choco)',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--choco-mid)',
    marginBottom: 7,
    letterSpacing: '0.02em',
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 24px' }}>
      <BackButton to={`/profile/${user?.username}`} />

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--choco)', marginBottom: 6 }}>
        Редактировать профиль
      </h1>
      <p style={{ color: 'var(--choco-light)', marginBottom: 32, fontSize: '0.9rem' }}>
        Изменения сохранятся сразу
      </p>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Avatar preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: form.avatar ? `url(${form.avatar}) center/cover` : 'var(--saffron)',
              border: '3px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 700, color: 'var(--cream)',
            }}>
              {!form.avatar && user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--saffron)', border: '2px solid var(--cream)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Camera size={13} stroke="var(--cream)" />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Ссылка на аватар</label>
            <input
              style={inputStyle}
              placeholder="https://..."
              value={form.avatar}
              onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>Имя</label>
            <input style={inputStyle} placeholder="Ваше имя" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>

          {/* Bio */}
          <div>
            <label style={labelStyle}>О себе</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 90 } as any}
              placeholder="Расскажите о себе..."
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              maxLength={300}
            />
            <p style={{ fontSize: '0.72rem', color: 'var(--choco-light)', textAlign: 'right', marginTop: 4 }}>
              {form.bio.length}/300
            </p>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ color: 'var(--choco-light)', fontSize: '0.78rem', fontWeight: 600 }}>Соцсети</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {[
            { key: 'instagramLink', label: 'Instagram', placeholder: 'https://instagram.com/yourname', icon: <LinkIcon size={16} /> },
            { key: 'tiktokLink', label: 'TikTok', placeholder: 'https://tiktok.com/@yourname', icon: <LinkIcon size={16} /> },
            { key: 'facebookLink', label: 'Facebook', placeholder: 'https://facebook.com/yourname', icon: <LinkIcon size={16} /> },
          ].map(field => (
            <div key={field.key}>
              <label style={labelStyle}>{field.label}</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--choco-light)' }}>
                  {field.icon}
                </div>
                <input
                  style={{ ...inputStyle, paddingLeft: 42 }}
                  placeholder={field.placeholder}
                  value={form[field.key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          <BackButton to={`/profile/${user?.username}`} label="Отмена" />
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
            style={{ flex: 1, padding: '0.8rem', fontSize: '0.95rem', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Сохраняем...' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
    </div>
  )
}
