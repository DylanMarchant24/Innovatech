import React from 'react'

const ROL_STYLE = {
  Administrador: { bg:'rgba(139,92,246,0.12)', border:'rgba(139,92,246,0.35)', text:'#c4b5fd', av:'linear-gradient(135deg,#7c3aed,#a78bfa)' },
  Desarrollador:  { bg:'rgba(0,229,255,0.09)',  border:'rgba(0,229,255,0.32)',  text:'#67e8f9', av:'linear-gradient(135deg,#0891b2,#22d3ee)' },
  Supervisor:     { bg:'rgba(244,63,94,0.09)',   border:'rgba(244,63,94,0.35)',  text:'#fda4af', av:'linear-gradient(135deg,#be123c,#fb7185)' },
  default:        { bg:'rgba(255,255,255,0.06)', border:'rgba(255,255,255,0.18)',text:'#e2e8f0', av:'linear-gradient(135deg,#475569,#94a3b8)' },
}

function initials(nombre) {
  return (nombre || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
}

export default function UserCard({ usuario, index }) {
  const rs = ROL_STYLE[usuario.rol] || ROL_STYLE.default

  return (
    <div
      style={{ ...card, animationDelay: `${index * 0.05}s` }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-hv)'
        e.currentTarget.style.background  = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.transform   = 'translateX(3px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.background  = 'rgba(255,255,255,0.025)'
        e.currentTarget.style.transform   = 'translateX(0)'
      }}
    >
      {/* Avatar */}
      <div style={{ ...avatar, background: rs.av }}>
        {initials(usuario.nombre)}
      </div>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <p style={nameStyle}>{usuario.nombre}</p>
        <p style={emailStyle}>{usuario.email}</p>
      </div>

      {/* Rol badge */}
      <span style={{ ...badge, background:rs.bg, border:`1px solid ${rs.border}`, color:rs.text }}>
        {usuario.rol || '—'}
      </span>
    </div>
  )
}

const card = {
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '13px 16px',
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  transition: 'border-color 0.18s, background 0.18s, transform 0.18s',
  animation: 'fadeUp 0.3s ease both',
  cursor: 'default',
}

const avatar = {
  width: 38, height: 38,
  borderRadius: 10,
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: '0.82rem',
  color: '#fff',
  letterSpacing: '0.02em',
}

const nameStyle = {
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: '0.87rem',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: 1.2,
}

const emailStyle = {
  fontSize: '0.76rem',
  color: 'var(--text-2)',
  marginTop: 3,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: 1.2,
}

const badge = {
  padding: '3px 10px',
  borderRadius: 99,
  fontSize: '0.67rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  whiteSpace: 'nowrap',
  flexShrink: 0,
}
