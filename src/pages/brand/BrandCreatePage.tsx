import { useState, useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF, Center } from '@react-three/drei'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'
import { brandApi } from '../../api/services'
import BackButton from '../../components/ui/BackButton'
import { Upload, X, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────
type ClothingType = 'hoodie' | 'pants' | 'tshirt'
type Step = 0 | 1 | 2

// ─── 3D Models ────────────────────────────────────────────────────────────────
// Real GLB model for pants, programmatic primitives for tshirt/hoodie

function PantsModel({ bodyColor }: { bodyColor: string }) {
  const ref = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/clothing.glb')

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(bodyColor),
          roughness: 0.82,
          metalness: 0.04,
        })
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
    return clone
  }, [scene, bodyColor])

  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.25 })

  return (
    <Center>
      <group ref={ref} scale={0.025}>
        <primitive object={clonedScene} />
      </group>
    </Center>
  )
}

useGLTF.preload('/models/clothing.glb')

function HoodieModel({ bodyColor }: { bodyColor: string }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.25 })
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(bodyColor), roughness: 0.82, metalness: 0.04 })
  return (
    <group ref={ref} position={[0, -0.5, 0]}>
      <mesh castShadow material={mat}><capsuleGeometry args={[0.55, 1.1, 8, 16]} /></mesh>
      <mesh castShadow material={mat} position={[-0.85, 0.15, 0]} rotation={[0, 0, Math.PI / 5]}><capsuleGeometry args={[0.22, 0.7, 6, 12]} /></mesh>
      <mesh castShadow material={mat} position={[0.85, 0.15, 0]} rotation={[0, 0, -Math.PI / 5]}><capsuleGeometry args={[0.22, 0.7, 6, 12]} /></mesh>
      <mesh castShadow material={mat} position={[0, 0.92, -0.1]}><sphereGeometry args={[0.38, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.65]} /></mesh>
      <mesh material={new THREE.MeshStandardMaterial({ color: new THREE.Color(bodyColor).multiplyScalar(0.8), roughness: 0.9 })} position={[0, -0.35, 0.54]}><boxGeometry args={[0.55, 0.22, 0.04]} /></mesh>
    </group>
  )
}

function TshirtModel({ bodyColor }: { bodyColor: string }) {
  const ref = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/tshirt.glb')

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(bodyColor),
          roughness: 0.85,
          metalness: 0.04,
        })
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
    return clone
  }, [scene, bodyColor])

  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.25 })

  return (
    <Center>
      <group ref={ref} scale={0.004}>
        <primitive object={clonedScene} />
      </group>
    </Center>
  )
}

useGLTF.preload('/models/tshirt.glb')

function Scene3D({ type, color }: { type: ClothingType; color: string }) {
  return (
    <Canvas shadows camera={{ position: [0, 0, 3.5], fov: 45 }} style={{ background: 'transparent' }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 4]} intensity={1.4} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#E8A856" />
      <Suspense fallback={null}>
        {type === 'pants' && <PantsModel bodyColor={color} />}
        {type === 'hoodie' && <HoodieModel bodyColor={color} />}
        {type === 'tshirt' && <TshirtModel bodyColor={color} />}
        <Environment preset="sunset" />
      </Suspense>
      <OrbitControls enablePan={false} minDistance={2} maxDistance={6} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI * 0.8} />
    </Canvas>
  )
}

// ─── Color palette ────────────────────────────────────────────────────────────
const COLORS = [
  { hex: '#1a1a1a', name: 'Чёрный' }, { hex: '#f5f5f0', name: 'Белый' },
  { hex: '#2C1A0E', name: 'Шоколад' }, { hex: '#C8873A', name: 'Горчица' },
  { hex: '#5C3D22', name: 'Каштан' }, { hex: '#4a6741', name: 'Хаки' },
  { hex: '#3a5a7a', name: 'Индиго' }, { hex: '#8B4A6B', name: 'Бордо' },
  { hex: '#9C7A5A', name: 'Песок' }, { hex: '#E8D9CC', name: 'Пудра' },
]

// ─── Quantity options (multiples of 10 starting from 20) ─────────────────────
const QUANTITIES = [20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200]

// ─── Clothing type selector card ──────────────────────────────────────────────
const CLOTHING_OPTIONS: { type: ClothingType; emoji: string; label: string; desc: string }[] = [
  { type: 'hoodie', emoji: '🧥', label: 'Худи', desc: 'Оверсайз, с карманом кенгуру' },
  { type: 'tshirt', emoji: '👕', label: 'Футболка', desc: 'Базовая, свободный крой' },
  { type: 'pants', emoji: '👖', label: 'Штаны', desc: 'Карго или широкие' },
]

// ─── Input helpers ────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--cream)', border: '1px solid var(--border)',
  borderRadius: 12, padding: '0.72rem 1rem', fontFamily: 'var(--font-body)',
  fontSize: '0.875rem', color: 'var(--choco)', outline: 'none',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.82rem', fontWeight: 600,
  color: 'var(--choco-mid)', marginBottom: 7,
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BrandCreatePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(0)
  const [submitting, setSubmitting] = useState(false)

  // Step 0
  const [selectedType, setSelectedType] = useState<ClothingType | null>(null)

  // Step 1 — editor
  const [bgColor, setBgColor] = useState('#FAF4EF')
  const [clothingColor, setClothingColor] = useState('#2C1A0E')
  const [prints, setPrints] = useState<{ url: string; position: string }[]>([])
  const [brandPhotos, setBrandPhotos] = useState<string[]>([''])

  // Step 2 — brand info
  const [brandData, setBrandData] = useState({
    name: '', type: '', description: '', positioning: '',
    history: '', uniqueness: '', quality: '',
    minQuantity: 20, logo: '',
  })

  // ── Prints ──
  const addPrint = () => {
    if (prints.length >= 5) { toast.error('Максимум 5 принтов'); return }
    setPrints(p => [...p, { url: '', position: 'грудь' }])
  }
  const removePrint = (i: number) => setPrints(p => p.filter((_, idx) => idx !== i))
  const updatePrint = (i: number, field: 'url' | 'position', val: string) =>
    setPrints(p => p.map((pr, idx) => idx === i ? { ...pr, [field]: val } : pr))

  // ── Brand photos ──
  const addPhoto = () => {
    if (brandPhotos.length >= 10) { toast.error('Максимум 10 фото'); return }
    setBrandPhotos(p => [...p, ''])
  }
  const removePhoto = (i: number) => setBrandPhotos(p => p.filter((_, idx) => idx !== i))
  const updatePhoto = (i: number, val: string) =>
    setBrandPhotos(p => p.map((ph, idx) => idx === i ? val : ph))

  // ── Submit ──
  const handleSubmit = async () => {
    if (!brandData.name.trim()) { toast.error('Введите название бренда'); return }
    setSubmitting(true)
    try {
      const validPhotos = brandPhotos.filter(p => p.trim())
      const created = await brandApi.create({
        name: brandData.name,
        type: brandData.type || (selectedType === 'hoodie' ? 'Худи' : selectedType === 'tshirt' ? 'Футболка' : 'Штаны'),
        color: clothingColor,
        description: brandData.description,
        logo: brandData.logo || validPhotos[0] || '',
        print: prints.filter(p => p.url).map(p => p.url).join(','),
        positioning: brandData.positioning,
        history: brandData.history,
        uniqueness: brandData.uniqueness,
        quality: brandData.quality,
        minQuantity: brandData.minQuantity,
      })
      toast.success(`Бренд "${created.name}" создан! 🎉`)
      navigate(`/brand/${created.id}`)
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Ошибка создания бренда')
    } finally {
      setSubmitting(false)
    }
  }

  const STEPS = ['Тип одежды', 'Редактор', 'Данные бренда']

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <BackButton to="/" />

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', maxWidth: 460, margin: '0 auto 40px', gap: 0 }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: i <= step ? 'var(--saffron)' : 'var(--dust-dark)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: i <= step ? 'var(--cream)' : 'var(--choco-light)',
                fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.3s',
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '0.7rem', color: i === step ? 'var(--saffron)' : 'var(--choco-light)', fontWeight: i === step ? 700 : 400, whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < step ? 'var(--saffron)' : 'var(--border)', margin: '0 8px', marginBottom: 22, transition: 'background 0.3s' }} />
            )}
          </div>
        ))}
      </div>

      {/* ══ STEP 0 — Choose clothing type ══ */}
      {step === 0 && (
        <div className="animate-slide-up" style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', color: 'var(--choco)', marginBottom: 8, textAlign: 'center' }}>
            Какую одежду создаём?
          </h2>
          <p style={{ color: 'var(--choco-light)', textAlign: 'center', marginBottom: 36 }}>
            Выберите один тип — его можно изменить позже
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {CLOTHING_OPTIONS.map(opt => (
              <button key={opt.type} onClick={() => setSelectedType(opt.type)} style={{
                display: 'flex', alignItems: 'center', gap: 20,
                padding: '22px 24px', borderRadius: 18, cursor: 'pointer',
                background: selectedType === opt.type ? 'var(--saffron)' : 'var(--cream)',
                border: `2px solid ${selectedType === opt.type ? 'var(--saffron)' : 'var(--border)'}`,
                transition: 'all 0.2s', textAlign: 'left',
                boxShadow: selectedType === opt.type ? '0 8px 24px rgba(200,135,58,0.3)' : 'none',
              }}>
                <span style={{ fontSize: '2.4rem', flexShrink: 0 }}>{opt.emoji}</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: selectedType === opt.type ? 'var(--cream)' : 'var(--choco)', marginBottom: 3 }}>
                    {opt.label}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: selectedType === opt.type ? 'rgba(255,248,240,0.8)' : 'var(--choco-light)' }}>
                    {opt.desc}
                  </p>
                </div>
                {selectedType === opt.type && (
                  <div style={{ marginLeft: 'auto', width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>✓</div>
                )}
              </button>
            ))}
          </div>

          <button className="btn-primary" disabled={!selectedType} onClick={() => setStep(1)}
            style={{ width: '100%', marginTop: 28, padding: '0.9rem', fontSize: '1rem', opacity: !selectedType ? 0.45 : 1 }}>
            Далее → Редактор
          </button>
        </div>
      )}

      {/* ══ STEP 1 — 3D Editor ══ */}
      {step === 1 && (
        <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'start' }}>

          {/* 3D Canvas */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{
              height: 500, borderRadius: 22, overflow: 'hidden',
              background: bgColor, border: '1px solid var(--border)',
              boxShadow: '0 20px 60px rgba(44,26,14,0.2)',
              transition: 'background 0.4s',
            }}>
              <Scene3D type={selectedType!} color={clothingColor} />
            </div>
            <p style={{ textAlign: 'center', color: 'var(--choco-light)', fontSize: '0.78rem', marginTop: 10 }}>
              🖱️ Тяни чтобы вращать · Колёсико — зум
            </p>
          </div>

          {/* Controls panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--choco)', marginBottom: 4 }}>
                Редактор
              </h2>
              <p style={{ color: 'var(--choco-light)', fontSize: '0.82rem' }}>
                {CLOTHING_OPTIONS.find(o => o.type === selectedType)?.emoji}{' '}
                {CLOTHING_OPTIONS.find(o => o.type === selectedType)?.label}
              </p>
            </div>

            {/* Clothing color */}
            <div>
              <label style={{ ...labelStyle, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Цвет одежды</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {COLORS.map(c => (
                  <button key={c.hex} onClick={() => setClothingColor(c.hex)} title={c.name} style={{
                    width: 34, height: 34, borderRadius: '50%', background: c.hex,
                    border: clothingColor === c.hex ? '3px solid var(--saffron)' : '2px solid var(--border)',
                    cursor: 'pointer', transition: 'all 0.15s',
                    transform: clothingColor === c.hex ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: clothingColor === c.hex ? '0 0 0 2px var(--cream), 0 0 0 4px var(--saffron)' : 'none',
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="color" value={clothingColor} onChange={e => setClothingColor(e.target.value)}
                  style={{ width: 38, height: 36, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', padding: 2 }} />
                <code style={{ fontSize: '0.8rem', color: 'var(--choco-mid)', background: 'var(--dust)', padding: '4px 10px', borderRadius: 8 }}>{clothingColor}</code>
              </div>
            </div>

            {/* Background color */}
            <div>
              <label style={{ ...labelStyle, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Цвет фона</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {['#FAF4EF', '#0F0705', '#1a1a2e', '#2d4a2d', '#2a1a3e', '#3a2000'].map(c => (
                  <button key={c} onClick={() => setBgColor(c)} style={{
                    width: 32, height: 32, borderRadius: 8, background: c,
                    border: bgColor === c ? '3px solid var(--saffron)' : '2px solid var(--border)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }} />
                ))}
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', padding: 1 }} />
              </div>
            </div>

            {/* Prints */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ ...labelStyle, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Принты ({prints.length}/5)
                </label>
                {prints.length < 5 && (
                  <button onClick={addPrint} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Plus size={12} /> Добавить
                  </button>
                )}
              </div>

              {prints.length === 0 && (
                <div style={{ padding: '14px', textAlign: 'center', border: '1.5px dashed var(--border)', borderRadius: 10, color: 'var(--choco-light)', fontSize: '0.82rem' }}>
                  Нет принтов — добавьте логотип или рисунок
                </div>
              )}

              {prints.map((pr, i) => (
                <div key={i} style={{ marginBottom: 10, padding: 12, background: 'var(--dust)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                      background: pr.url ? `url(${pr.url}) center/cover` : 'var(--cream)',
                      border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {!pr.url && <Upload size={14} style={{ color: 'var(--choco-light)' }} />}
                    </div>
                    <input style={{ ...inputStyle, flex: 1, fontSize: '0.8rem', padding: '0.55rem 0.8rem' }}
                      placeholder="Ссылка на принт/логотип"
                      value={pr.url} onChange={e => updatePrint(i, 'url', e.target.value)} />
                    <button onClick={() => removePrint(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--choco-light)', flexShrink: 0 }}>
                      <X size={16} />
                    </button>
                  </div>
                  <select style={{ ...inputStyle, fontSize: '0.8rem', padding: '0.5rem 0.8rem' }}
                    value={pr.position} onChange={e => updatePrint(i, 'position', e.target.value)}>
                    {['грудь', 'спина', 'рукав', 'низ', 'воротник'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {/* Brand photos */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ ...labelStyle, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Фото бренда ({brandPhotos.filter(p => p).length}/10)
                </label>
                {brandPhotos.length < 10 && (
                  <button onClick={addPhoto} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Plus size={12} /> Фото
                  </button>
                )}
              </div>

              {brandPhotos.filter(p => p).length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
                  {brandPhotos.filter(p => p).map((url, i) => (
                    <div key={i} style={{ aspectRatio: '1', borderRadius: 8, background: `url(${url}) center/cover`, border: '1px solid var(--border)', position: 'relative' }}>
                      {i === 0 && <div style={{ position: 'absolute', bottom: 3, left: 3, background: 'var(--saffron)', color: 'var(--cream)', fontSize: '0.55rem', padding: '1px 5px', borderRadius: 999, fontWeight: 700 }}>лого</div>}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {brandPhotos.map((url, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input style={{ ...inputStyle, flex: 1, fontSize: '0.8rem', padding: '0.55rem 0.8rem' }}
                      placeholder={i === 0 ? 'Логотип (первое фото)' : `Фото ${i + 1}`}
                      value={url} onChange={e => updatePhoto(i, e.target.value)} />
                    {brandPhotos.length > 1 && (
                      <button onClick={() => removePhoto(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--choco-light)' }}>
                        <X size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" onClick={() => setStep(0)}>← Назад</button>
              <button className="btn-primary" onClick={() => setStep(2)} style={{ flex: 1, padding: '0.85rem' }}>
                Далее → Данные
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ STEP 2 — Brand info ══ */}
      {step === 2 && (
        <div className="animate-slide-up" style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--choco)', marginBottom: 8 }}>
            Данные бренда
          </h2>
          <p style={{ color: 'var(--choco-light)', marginBottom: 28 }}>Последний шаг — расскажите о бренде</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { key: 'name', label: 'Название бренда *', placeholder: 'AIRU, NOMAD CLOTH...' },
              { key: 'type', label: 'Категория / стиль', placeholder: 'Streetwear, Минимализм...' },
              { key: 'positioning', label: 'Для кого этот бренд', placeholder: 'Молодые люди 18-25 лет...' },
              { key: 'uniqueness', label: 'Уникальность', placeholder: 'Чем отличаетесь от других...' },
              { key: 'quality', label: 'Материалы', placeholder: 'Хлопок 100%, 380gsm...' },
            ].map(f => (
              <div key={f.key}>
                <label style={labelStyle}>{f.label}</label>
                <input style={inputStyle} placeholder={f.placeholder}
                  value={brandData[f.key as keyof typeof brandData] as string}
                  onChange={e => setBrandData(d => ({ ...d, [f.key]: e.target.value }))} />
              </div>
            ))}

            {[
              { key: 'description', label: 'Описание', placeholder: 'Концепция бренда...' },
              { key: 'history', label: 'История', placeholder: 'Как появился бренд...' },
            ].map(f => (
              <div key={f.key}>
                <label style={labelStyle}>{f.label}</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 } as any}
                  placeholder={f.placeholder}
                  value={brandData[f.key as keyof typeof brandData] as string}
                  onChange={e => setBrandData(d => ({ ...d, [f.key]: e.target.value }))} />
              </div>
            ))}

            {/* Quantity — multiples of 10 */}
            <div>
              <label style={labelStyle}>Минимальный тираж</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {QUANTITIES.map(q => (
                  <button key={q} onClick={() => setBrandData(d => ({ ...d, minQuantity: q }))} style={{
                    padding: '7px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 600,
                    background: brandData.minQuantity === q ? 'var(--saffron)' : 'var(--dust)',
                    color: brandData.minQuantity === q ? 'var(--cream)' : 'var(--choco-mid)',
                    transition: 'all 0.18s',
                  }}>
                    {q} шт
                  </button>
                ))}
              </div>
            </div>

            {/* Summary card */}
            <div style={{ padding: 18, background: 'var(--dust)', borderRadius: 14, border: '1px solid var(--border)', marginTop: 4 }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--choco-mid)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Итог</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                {[
                  ['Тип', CLOTHING_OPTIONS.find(o => o.type === selectedType)?.label],
                  ['Цвет', clothingColor],
                  ['Принтов', prints.filter(p => p.url).length],
                  ['Фото', brandPhotos.filter(p => p).length],
                  ['Тираж', `от ${brandData.minQuantity} шт`],
                ].map(([k, v]) => (
                  <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--choco-light)' }}>{k}</span>
                    <span style={{ color: 'var(--choco)', fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button className="btn-ghost" onClick={() => setStep(1)}>← Назад</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting || !brandData.name.trim()}
              style={{ flex: 1, padding: '0.9rem', fontSize: '1rem', opacity: (submitting || !brandData.name.trim()) ? 0.6 : 1 }}>
              {submitting ? 'Создаём...' : '🚀 Создать бренд'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
