import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Send, ArrowLeft, Circle } from 'lucide-react'
import { chatApi, userApi } from '../api/services'
import { useAuthStore } from '../store/authStore'
import type { ChatMessage, User } from '../types'
import toast from 'react-hot-toast'

// Use @stomp/stompjs with native WebSocket (no sockjs-client needed)
import { Client } from '@stomp/stompjs'

export default function ChatPage() {
  const { userId } = useParams<{ userId: string }>()
  const { user: me } = useAuthStore()
  const token = localStorage.getItem('token')

  const [partner, setPartner] = useState<User | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [connected, setConnected] = useState(false)
  const [wsError, setWsError] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const stompRef = useRef<Client | null>(null)

  // Load partner + history
  useEffect(() => {
    if (!userId) return
    userApi.getById(Number(userId))
      .then(setPartner)
      .catch(() => toast.error('Пользователь не найден'))
    chatApi.getConversation(Number(userId))
      .then(setMessages)
      .catch(() => {})
  }, [userId])

  // WebSocket connect — native WS, no SockJS
  useEffect(() => {
    if (!me?.id || !token) return

    // Determine WebSocket URL
    let wsUrl: string
    const apiUrl = import.meta.env.VITE_API_URL as string | undefined
    if (apiUrl) {
      // Production: derive WS URL from backend API URL
      const base = apiUrl.replace(/\/api\/?$/, '').replace(/^http/, 'ws')
      wsUrl = `${base}/ws/websocket`
    } else {
      // Dev: proxy through Vite
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      wsUrl = `${proto}//${window.location.hostname}:8080/ws/websocket`
    }

    const client = new Client({
      // Native WebSocket — no SockJS dependency
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        login: me.email || '',
      },
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        setConnected(true)
        setWsError(false)

        // Subscribe to personal message queue
        client.subscribe(`/user/${me.id}/queue/messages`, (frame) => {
          try {
            const msg: ChatMessage = JSON.parse(frame.body)
            setMessages(prev => {
              // Deduplicate by id
              if (prev.find(m => m.id === msg.id)) return prev
              return [...prev, msg]
            })
          } catch {}
        })
      },

      onDisconnect: () => setConnected(false),
      onStompError: () => { setConnected(false); setWsError(true) },
      onWebSocketError: () => { setConnected(false); setWsError(true) },
    })

    client.activate()
    stompRef.current = client

    return () => {
      client.deactivate()
    }
  }, [me?.id, token])

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message — REST fallback always works, WS is bonus real-time
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !userId || sending) return
    setSending(true)
    try {
      const msg = await chatApi.send(Number(userId), text.trim())
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
      setText('')
    } catch {
      toast.error('Ошибка отправки')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleDateString('ru', { day: 'numeric', month: 'long' })

  // Group by date
  type Group = { date: string; msgs: ChatMessage[] }
  const grouped: Group[] = []
  messages.forEach(m => {
    const d = new Date(m.timestamp).toDateString()
    const last = grouped[grouped.length - 1]
    if (last?.date === d) last.msgs.push(m)
    else grouped.push({ date: d, msgs: [m] })
  })

  return (
    <div style={{
      height: 'calc(100vh - 64px)',
      display: 'flex', flexDirection: 'column',
      maxWidth: 720, margin: '0 auto', padding: '0 16px',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 0 12px', borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button className="btn-icon"><ArrowLeft size={20} /></button>
        </Link>

        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: partner?.avatar ? `url(${partner.avatar}) center/cover` : 'var(--saffron)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--cream)', fontWeight: 700, fontSize: '1rem',
          }}>
            {!partner?.avatar && partner?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{
            position: 'absolute', bottom: 1, right: 1,
            width: 11, height: 11, borderRadius: '50%',
            background: connected ? '#4CAF50' : 'var(--choco-light)',
            border: '2px solid var(--cream)',
          }} />
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, color: 'var(--choco)', fontSize: '0.95rem', marginBottom: 1 }}>
            {partner?.name || '...'}
          </p>
          <p style={{
            fontSize: '0.72rem',
            color: connected ? '#4CAF50' : 'var(--choco-light)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Circle size={6} fill={connected ? '#4CAF50' : 'var(--border-dark)'} stroke="none" />
            {connected ? 'онлайн' : wsError ? 'офлайн (сообщения всё равно отправляются)' : `@${partner?.username || ''}`}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 0',
        display: 'flex', flexDirection: 'column', gap: 0,
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', margin: 'auto', padding: 40 }}>
            <p style={{ fontSize: '2rem', marginBottom: 10 }}>💬</p>
            <p style={{ color: 'var(--choco-light)', fontSize: '0.9rem' }}>
              Начните диалог с {partner?.name || 'пользователем'}
            </p>
          </div>
        )}

        {grouped.map(group => (
          <div key={group.date}>
            {/* Date separator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0 10px' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--choco-light)', whiteSpace: 'nowrap' }}>
                {formatDate(group.msgs[0].timestamp)}
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {group.msgs.map((msg, i) => {
              const isMe = msg.senderId === me?.id
              const prevSame = i > 0 && group.msgs[i - 1].senderId === msg.senderId
              const nextSame = i < group.msgs.length - 1 && group.msgs[i + 1].senderId === msg.senderId

              return (
                <div key={msg.id} style={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: 8,
                  marginBottom: nextSame ? 2 : 8,
                  paddingLeft: isMe ? 48 : 0,
                  paddingRight: isMe ? 0 : 48,
                }}>
                  {/* Partner avatar (only on last message of a sequence) */}
                  {!isMe && (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: !nextSame
                        ? (partner?.avatar ? `url(${partner.avatar}) center/cover` : 'var(--saffron)')
                        : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--cream)', fontSize: '0.65rem', fontWeight: 700,
                      visibility: !nextSame ? 'visible' : 'hidden',
                    }}>
                      {!nextSame && !partner?.avatar && partner?.name?.[0]?.toUpperCase()}
                    </div>
                  )}

                  <div style={{ maxWidth: '72%' }}>
                    {/* Product image share */}
                    {msg.productImageUrl && (
                      <div style={{
                        width: 180, height: 100, borderRadius: 10, marginBottom: 4,
                        background: `url(${msg.productImageUrl}) center/cover`,
                        border: '1px solid var(--border)',
                      }} />
                    )}

                    {/* Bubble */}
                    <div style={{
                      padding: '8px 14px',
                      borderRadius: isMe
                        ? (prevSame ? '16px 4px 4px 16px' : '16px 4px 16px 16px')
                        : (prevSame ? '4px 16px 16px 4px' : '4px 16px 16px 16px'),
                      background: isMe ? 'var(--saffron)' : 'var(--cream)',
                      border: isMe ? 'none' : '1px solid var(--border)',
                      boxShadow: '0 1px 3px rgba(44,26,14,0.07)',
                    }}>
                      <p style={{
                        color: isMe ? 'var(--cream)' : 'var(--choco)',
                        fontSize: '0.9rem', lineHeight: 1.45, margin: 0,
                        wordBreak: 'break-word',
                      }}>
                        {msg.message}
                      </p>
                    </div>

                    {/* Time — only on last in a sequence */}
                    {!nextSame && (
                      <p style={{
                        fontSize: '0.62rem', color: 'var(--choco-light)',
                        textAlign: isMe ? 'right' : 'left',
                        marginTop: 3, paddingLeft: 4,
                      }}>
                        {formatTime(msg.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{
        display: 'flex', gap: 10,
        padding: '12px 0 20px', flexShrink: 0,
        borderTop: '1px solid var(--border)',
      }}>
        <input
          className="input"
          placeholder={partner ? `Написать ${partner.name}...` : 'Написать сообщение...'}
          value={text}
          onChange={e => setText(e.target.value)}
          style={{ flex: 1 }}
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) } }}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="btn-primary"
          style={{
            padding: '0 18px', display: 'flex', alignItems: 'center', gap: 6,
            opacity: (!text.trim() || sending) ? 0.45 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
