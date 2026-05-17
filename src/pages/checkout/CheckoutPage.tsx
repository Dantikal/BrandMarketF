import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { ShoppingCart, MapPin, Store, CreditCard, Check, ChevronRight } from 'lucide-react'
import { productApi, orderApi } from '../../api/services'
import { useAuthStore } from '../../store/authStore'
import BackButton from '../../components/ui/BackButton'
import type { Product } from '../../types'
import toast from 'react-hot-toast'

type DeliveryType = 'ADDRESS' | 'STORE'
type PayMethod = 'DEMO_CARD' | 'DEMO_CASH'

const DEMO_CARDS = [
  { last4: '4242', brand: 'Visa', color: '#1a1a6e' },
  { last4: '5353', brand: 'Mastercard', color: '#8B0000' },
]

export default function CheckoutPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const productId = Number(params.get('product'))
  const qty = Number(params.get('qty') || '1')

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<0 | 1 | 2>(0) // delivery → payment → confirm
  const [placing, setPlacing] = useState(false)
  const [done, setDone] = useState(false)

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('ADDRESS')
  const [address, setAddress] = useState('')
  const [size, setSize] = useState('')
  const [quantity, setQuantity] = useState(qty)
  const [payMethod, setPayMethod] = useState<PayMethod>('DEMO_CARD')
  const [selectedCard, setSelectedCard] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (!productId) { navigate('/feed'); return }
    productApi.getById(productId)
      .then(p => { setProduct(p); if (p.size) setSize(p.size.split(',')[0]) })
      .catch(() => navigate('/feed'))
      .finally(() => setLoading(false))
  }, [productId])

  const total = product ? (Number(product.price) * quantity).toLocaleString() : '0'

  const handlePlaceOrder = async () => {
    if (deliveryType === 'ADDRESS' && !address.trim()) {
      toast.error('Введите адрес доставки')
      return
    }
    setPlacing(true)
    try {
      await orderApi.create({
        productId,
        quantity,
        size,
        deliveryAddress: deliveryType === 'ADDRESS' ? address : 'Самовывоз из магазина',
        deliveryType,
      })
      setDone(true)
    } catch { toast.error('Ошибка оформления заказа') }
    finally { setPlacing(false) }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--cream)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '0.75rem 1rem', fontFamily: 'var(--font-body)',
    fontSize: '0.9rem', color: 'var(--choco)', outline: 'none',
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '60vh', alignItems: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--saffron)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // ── Success screen ──
  if (done) return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%', background: 'rgba(46,125,50,0.1)',
        border: '2px solid #2E7D32', display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 24px',
        animation: 'pop 0.4s ease-out',
      }}>
        <Check size={40} stroke="#2E7D32" strokeWidth={2.5} />
      </div>
      <style>{`@keyframes pop{from{transform:scale(0.5);opacity:0}to{transform:scale(1);opacity:1}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--choco)', marginBottom: 10 }}>
        Заказ оформлен!
      </h1>
      <p style={{ color: 'var(--choco-light)', marginBottom: 8 }}>
        Мы получили ваш заказ и начинаем работу
      </p>
      <p style={{ color: 'var(--choco-mid)', fontSize: '0.9rem', marginBottom: 32 }}>
        Ожидаемая доставка: ~14 дней
      </p>

      <div className="card" style={{ padding: 20, marginBottom: 28, textAlign: 'left' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: product?.images?.[0] ? `url(${product.images[0]}) center/cover` : 'var(--dust)',
            border: '1px solid var(--border)',
          }} />
          <div>
            <p style={{ fontWeight: 700, color: 'var(--choco)' }}>{product?.name}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--choco-light)' }}>
              {quantity} шт · {size || 'размер не указан'}
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--saffron)', fontWeight: 700 }}>
              {total} ₽
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <Link to="/orders" style={{ flex: 1, textDecoration: 'none' }}>
          <button className="btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
            Мои заказы
          </button>
        </Link>
        <Link to="/feed" style={{ flex: 1, textDecoration: 'none' }}>
          <button className="btn-ghost" style={{ width: '100%', padding: '0.85rem' }}>
            В ленту
          </button>
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>
      <BackButton />

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--choco)', marginBottom: 28 }}>
        Оформление заказа
      </h1>

      {/* Step tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32, borderBottom: '1px solid var(--border)' }}>
        {['Доставка', 'Оплата', 'Подтверждение'].map((s, i) => (
          <button key={i} onClick={() => i < step + 1 && setStep(i as any)} style={{
            flex: 1, padding: '10px 0', border: 'none', background: 'none',
            borderBottom: `2px solid ${step === i ? 'var(--saffron)' : 'transparent'}`,
            color: step === i ? 'var(--saffron)' : step > i ? 'var(--choco-mid)' : 'var(--choco-light)',
            fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: step === i ? 700 : 500,
            cursor: i <= step ? 'pointer' : 'default', transition: 'all 0.2s',
          }}>
            {step > i ? '✓ ' : ''}{s}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

        {/* Left: step content */}
        <div>

          {/* Step 0: Delivery */}
          {step === 0 && (
            <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--choco-mid)', marginBottom: 10 }}>
                  Способ получения
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { type: 'ADDRESS' as DeliveryType, icon: <MapPin size={20} />, label: 'Доставка', desc: 'По адресу' },
                    { type: 'STORE' as DeliveryType, icon: <Store size={20} />, label: 'Самовывоз', desc: 'Из магазина' },
                  ].map(opt => (
                    <button key={opt.type} onClick={() => setDeliveryType(opt.type)} style={{
                      padding: '16px', borderRadius: 14, cursor: 'pointer',
                      background: deliveryType === opt.type ? 'var(--saffron)' : 'var(--cream)',
                      border: `2px solid ${deliveryType === opt.type ? 'var(--saffron)' : 'var(--border)'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
                      transition: 'all 0.2s',
                    }}>
                      <div style={{ color: deliveryType === opt.type ? 'var(--cream)' : 'var(--saffron)' }}>{opt.icon}</div>
                      <p style={{ fontWeight: 700, color: deliveryType === opt.type ? 'var(--cream)' : 'var(--choco)', fontSize: '0.9rem' }}>{opt.label}</p>
                      <p style={{ fontSize: '0.75rem', color: deliveryType === opt.type ? 'rgba(255,248,240,0.7)' : 'var(--choco-light)' }}>{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {deliveryType === 'ADDRESS' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--choco-mid)', marginBottom: 8 }}>
                    Адрес доставки
                  </label>
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 90 } as any}
                    placeholder="Город, улица, дом, квартира"
                    value={address} onChange={e => setAddress(e.target.value)} />
                </div>
              )}

              {product?.size && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--choco-mid)', marginBottom: 8 }}>Размер</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {product.size.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                      <button key={s} onClick={() => setSize(s)} style={{
                        padding: '7px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 600,
                        background: size === s ? 'var(--saffron)' : 'var(--dust)',
                        color: size === s ? 'var(--cream)' : 'var(--choco-mid)',
                        transition: 'all 0.18s',
                      }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--choco-mid)', marginBottom: 8 }}>Количество</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--cream)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700 }}>−</button>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, minWidth: 30, textAlign: 'center', color: 'var(--choco)' }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--cream)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700 }}>+</button>
                </div>
              </div>

              <button className="btn-primary" onClick={() => setStep(1)} style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                Далее — Оплата <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ padding: 16, background: 'rgba(200,135,58,0.08)', borderRadius: 12, border: '1px solid rgba(200,135,58,0.2)' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--choco-mid)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  🔒 Это демо-оплата. Реальные деньги не списываются.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--choco-mid)', marginBottom: 10 }}>
                  Способ оплаты
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { method: 'DEMO_CARD' as PayMethod, label: 'Банковская карта' },
                    { method: 'DEMO_CASH' as PayMethod, label: 'Наличными при получении' },
                  ].map(opt => (
                    <button key={opt.method} onClick={() => setPayMethod(opt.method)} style={{
                      padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                      background: payMethod === opt.method ? 'rgba(200,135,58,0.08)' : 'var(--cream)',
                      border: `2px solid ${payMethod === opt.method ? 'var(--saffron)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s',
                    }}>
                      <CreditCard size={18} style={{ color: payMethod === opt.method ? 'var(--saffron)' : 'var(--choco-light)' }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--choco)', fontSize: '0.9rem' }}>{opt.label}</span>
                      {payMethod === opt.method && <span style={{ marginLeft: 'auto', color: 'var(--saffron)', fontSize: '0.8rem', fontWeight: 700 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {payMethod === 'DEMO_CARD' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--choco-mid)', marginBottom: 10 }}>
                    Выберите карту
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {DEMO_CARDS.map((card, i) => (
                      <button key={i} onClick={() => setSelectedCard(i)} style={{
                        flex: 1, padding: '16px', borderRadius: 14, cursor: 'pointer',
                        background: selectedCard === i ? card.color : 'var(--cream)',
                        border: `2px solid ${selectedCard === i ? card.color : 'var(--border)'}`,
                        transition: 'all 0.2s',
                      }}>
                        <p style={{ fontSize: '0.75rem', color: selectedCard === i ? 'rgba(255,255,255,0.7)' : 'var(--choco-light)', marginBottom: 8 }}>{card.brand}</p>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: selectedCard === i ? '#fff' : 'var(--choco)', letterSpacing: '0.1em' }}>
                          •••• {card.last4}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" onClick={() => setStep(0)}>← Назад</button>
                <button className="btn-primary" onClick={() => setStep(2)} style={{ flex: 1, padding: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  Подтвердить оплату <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === 2 && (
            <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--choco)' }}>Проверьте заказ</h3>

              {[
                ['Товар', product?.name],
                ['Размер', size || '—'],
                ['Количество', `${quantity} шт`],
                ['Доставка', deliveryType === 'ADDRESS' ? address || '—' : 'Самовывоз'],
                ['Оплата', payMethod === 'DEMO_CARD' ? `Карта •••• ${DEMO_CARDS[selectedCard].last4}` : 'Наличные'],
              ].map(([k, v]) => (
                <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--choco-light)', fontSize: '0.875rem' }}>{k}</span>
                  <span style={{ color: 'var(--choco)', fontWeight: 600, fontSize: '0.875rem', maxWidth: '60%', textAlign: 'right' }}>{v}</span>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--choco)' }}>Итого</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--saffron)' }}>{total} ₽</span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" onClick={() => setStep(1)}>← Назад</button>
                <button className="btn-primary" onClick={handlePlaceOrder} disabled={placing}
                  style={{ flex: 1, padding: '0.9rem', fontSize: '1rem', opacity: placing ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <ShoppingCart size={18} />
                  {placing ? 'Оформляем...' : 'Оформить заказ'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: product summary */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{
              height: 180, borderRadius: 12, marginBottom: 14,
              background: product?.images?.[0] ? `url(${product.images[0]}) center/cover` : 'var(--dust)',
              border: '1px solid var(--border)',
            }} />
            <p style={{ fontWeight: 700, color: 'var(--choco)', marginBottom: 4 }}>{product?.name}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--choco-light)', marginBottom: 12 }}>{product?.brandName}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--choco-light)' }}>{quantity} шт</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--choco)' }}>
                {total} ₽
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
