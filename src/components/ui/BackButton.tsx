import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  to?: string
  label?: string
}

export default function BackButton({ to, label = 'Назад' }: BackButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (to) navigate(to)
    else if (window.history.length > 1) navigate(-1)
    else navigate('/')
  }

  return (
    <button
      onClick={handleClick}
      className="btn-ghost"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        marginBottom: 24, fontSize: '0.875rem',
      }}
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  )
}
