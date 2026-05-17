import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, Image, AlertCircle } from 'lucide-react'
import { productApi, brandApi } from '../../api/services'
import { useAuthStore } from '../../store/authStore'
import BackButton from '../../components/ui/BackButton'
import type { Brand } from '../../types'
import toast from 'react-hot-toast'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size']
const TYPES = ['Худи', 'Футболка', 'Штаны', 'Куртка', 'Рубашка', 'Свитшот', 'Шорты', 'Платье', 'Юбка', 'Аксессуар']

export default function ProductCreatePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [brands, setBrands] = useState<Brand[]>([])
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    size: 'M',
    clothingType: 'Худи',
    color: '#2C1A0E',
    stock: '50',
    brandId: '',
  })

  // Multi-image URLs (up to 10)
  const [images, setImages] = useState<string[]>([''])

  useEffect(() => {
    if (!user) return
    brandApi.getByUser(user.id).then(setBrands).catch(() => {})
  }, [user])

  const addImageSlot = () => {
    if (images.length >= 10) { toast.error('Максимум 10 фотографий'); return }
    setImages(prev => [...prev, ''])
  }

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  const updateImage = (idx: number, url: string) => {
    setImages(prev => prev.map((img, i) => i === idx ? url : img))
  }

  const validImages = images.filter(img => img.trim() !== '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.brandId) { toast.error('Выберите бренд'); return }
    if (!form.name.trim()) { toast.error('Введите название'); return }
    if (!form.price || Number(form.price) <= 0) { toast.error('Введите цену'); return }

    setSubmitting(true)
    try {
      const created = await productApi.create({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        size: form.size,
        clothingType: form.clothingType,
        color: form.color,
        stock: Number(form.stock),
        brandId: Number(form.brandId),
        images: validImages,
      })
      toast.success('Товар добавлен! 🎉')
      navigate(`/product/${created.id}`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка создания товара')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--cream)',
    border: '1px solid var(--border)', borderRadius: 12,
    padding: '0.72rem 1rem', fontFamily: 'var(--font-body)',
    fontSize: '0.875rem', color: 'var(--choco)', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.82rem', fontWeight: 600,
    color: 'var(--choco-mid)', marginBottom: 7,
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <BackButton />

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--choco)', marginBottom: 6 }}>
        Добавить товар
      </h1>
      <p style={{ color: 'var(--choco-light)', marginBottom: 32 }}>
        Заполните данные о товаре — он появится в ленте
      </p>

      {brands.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <AlertCircle size={36} style={{ color: 'var(--saffron)', margin: '0 auto 14px' }} />
          <p style={{ color: 'var(--choco-mid)', marginBottom: 16 }}>
            Сначала создайте бренд — товар можно добавить только к бренду
          </p>
          <button className="btn-primary" onClick={() => navigate('/brand/create')}>
            Создать бренд
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Brand select */}
            <div>
              <label style={labelStyle}>Бренд *</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.brandId}
                onChange={e => setForm(f => ({ ...f, brandId: e.target.value }))}
                required
              >
                <option value="">Выберите бренд...</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div>
              <label style={labelStyle}>Название товара *</label>
              <input style={inputStyle} placeholder="AIRU Hoodie Black" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Описание</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: 100 } as any}
                placeholder="Расскажите о материале, особенностях кроя, уходе за вещью..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            {/* Price + Stock row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Цена (₽) *</label>
                <input style={inputStyle} type="number" min="1" placeholder="15900"
                  value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
              </div>
              <div>
                <label style={labelStyle}>Количество в наличии</label>
                <input style={inputStyle} type="number" min="0" placeholder="50"
                  value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
              </div>
            </div>

            {/* Type + Size row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Тип одежды</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.clothingType} onChange={e => setForm(f => ({ ...f, clothingType: e.target.value }))}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Размер</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))}>
                  {SIZES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Color */}
            <div>
              <label style={labelStyle}>Цвет</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  style={{ width: 44, height: 40, borderRadius: 10, border: '1px solid var(--border)', cursor: 'pointer', padding: 2 }} />
                <input style={{ ...inputStyle, flex: 1 }} value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="#2C1A0E" />
              </div>
            </div>

            {/* ── Multi-image upload ── */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ ...labelStyle, margin: 0 }}>
                  Фотографии товара
                  <span style={{ fontWeight: 400, color: 'var(--choco-light)', marginLeft: 6 }}>({validImages.length}/10)</span>
                </label>
                {images.length < 10 && (
                  <button type="button" onClick={addImageSlot} className="btn-ghost"
                    style={{ fontSize: '0.78rem', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Plus size={13} /> Добавить фото
                  </button>
                )}
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--choco-light)', marginBottom: 12 }}>
                Вставьте ссылки на фото (до 10 штук). Первое фото — обложка в ленте.
              </p>

              {/* Image grid preview + inputs */}
              {validImages.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8, marginBottom: 14 }}>
                  {validImages.map((url, i) => (
                    <div key={i} style={{
                      aspectRatio: '1', borderRadius: 10, overflow: 'hidden',
                      background: `url(${url}) center/cover`,
                      border: '1px solid var(--border)', position: 'relative',
                    }}>
                      {i === 0 && (
                        <div style={{
                          position: 'absolute', top: 5, left: 5,
                          background: 'var(--saffron)', color: 'var(--cream)',
                          fontSize: '0.6rem', fontWeight: 700,
                          padding: '1px 6px', borderRadius: 999,
                        }}>
                          Обложка
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {images.map((url, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: url ? `url(${url}) center/cover` : 'var(--dust)',
                      border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {!url && <Image size={14} style={{ color: 'var(--choco-light)' }} />}
                    </div>
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder={`Ссылка на фото ${idx + 1}${idx === 0 ? ' (обложка)' : ''}`}
                      value={url}
                      onChange={e => updateImage(idx, e.target.value)}
                    />
                    {images.length > 1 && (
                      <button type="button" onClick={() => removeImage(idx)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--choco-light)', padding: 4, borderRadius: 6, flexShrink: 0 }}>
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {images.length < 10 && (
                <button type="button" onClick={addImageSlot}
                  style={{
                    width: '100%', marginTop: 10, padding: '10px',
                    border: '1.5px dashed var(--border-dark)', borderRadius: 10,
                    background: 'none', cursor: 'pointer',
                    color: 'var(--choco-light)', fontSize: '0.82rem', fontFamily: 'var(--font-body)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--saffron)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--saffron)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-dark)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--choco-light)' }}
                >
                  <Plus size={14} /> Ещё фото ({images.length}/10)
                </button>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !form.brandId || !form.name}
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: 8, opacity: (submitting || !form.brandId || !form.name) ? 0.6 : 1 }}
            >
              {submitting ? 'Добавляем товар...' : '✓ Опубликовать товар'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
