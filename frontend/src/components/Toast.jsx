import React, { useState, useCallback, useRef } from 'react'

const s = {
  base: {
    position: 'fixed',
    bottom: 36,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    padding: '13px 22px',
    borderRadius: 99,
    fontSize: '0.875rem',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    whiteSpace: 'nowrap',
    animation: 'toast-up 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
    pointerEvents: 'none',
  },
  success: {
    background: 'rgba(16,185,129,0.13)',
    border: '1px solid rgba(16,185,129,0.4)',
    color: '#6ee7b7',
  },
  error: {
    background: 'rgba(244,63,94,0.12)',
    border: '1px solid rgba(244,63,94,0.4)',
    color: '#fda4af',
  },
  icon: { fontSize: '1rem', lineHeight: 1 },
}

export function useToast() {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const show = useCallback((message, type = 'success') => {
    clearTimeout(timerRef.current)
    setToast({ message, type, key: Date.now() })
    timerRef.current = setTimeout(() => setToast(null), 3500)
  }, [])

  return { toast, show }
}

export default function Toast({ toast }) {
  if (!toast) return null
  const typeStyle = toast.type === 'success' ? s.success : s.error
  const icon = toast.type === 'success' ? '✓' : '✕'

  return (
    <div key={toast.key} style={{ ...s.base, ...typeStyle }}>
      <span style={s.icon}>{icon}</span>
      {toast.message}
    </div>
  )
}
