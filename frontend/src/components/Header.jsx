import React from 'react'

export default function Header() {
  return (
    <header style={headerStyle}>
      <div style={left}>
        <div style={logoMark}>I</div>
        <div style={logoGroup}>
          <span style={logoText}>Innova<span style={{ color: 'var(--cyan)' }}>tech</span></span>
          <span style={logoSub}>Gestión de Empleados</span>
        </div>
      </div>

      <nav style={right}>
        <span style={statusDot} title="Sistema operativo" />
        <span style={navLabel}>Sistema activo</span>
      </nav>
    </header>
  )
}

const headerStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 10,
  height: 64,
  padding: '0 40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid var(--border)',
  backdropFilter: 'var(--blur)',
  WebkitBackdropFilter: 'var(--blur)',
  background: 'rgba(6,10,18,0.72)',
  animation: 'fadeIn 0.4s ease both',
}

const left = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
}

const logoMark = {
  width: 36,
  height: 36,
  borderRadius: 10,
  background: 'linear-gradient(135deg, var(--cyan) 0%, #0097a7 100%)',
  display: 'grid',
  placeItems: 'center',
  fontFamily: 'var(--font-display)',
  fontWeight: 800,
  fontSize: 15,
  color: '#061018',
  flexShrink: 0,
  boxShadow: '0 0 16px rgba(0,229,255,0.28)',
}

const logoGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
}

const logoText = {
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: '1.05rem',
  letterSpacing: '-0.025em',
  lineHeight: 1,
}

const logoSub = {
  fontSize: '0.68rem',
  color: 'var(--text-3)',
  letterSpacing: '0.04em',
  lineHeight: 1,
}

const right = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

const statusDot = {
  display: 'block',
  width: 7,
  height: 7,
  borderRadius: '50%',
  background: 'var(--success)',
  boxShadow: '0 0 6px var(--success)',
  animation: 'pulse-glow 2.4s ease-in-out infinite',
}

const navLabel = {
  fontSize: '0.73rem',
  color: 'var(--text-3)',
  letterSpacing: '0.06em',
}
