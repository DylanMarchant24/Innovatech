import React, { useState, useMemo } from 'react'
import UserCard from './UserCard'

const ROL_FILTERS = ['Todos', 'Administrador', 'Desarrollador', 'Supervisor']

const FILTER_COLORS = {
  Administrador: { active: 'rgba(139,92,246,0.18)', border: 'rgba(139,92,246,0.45)', text: '#c4b5fd' },
  Desarrollador:  { active: 'rgba(0,229,255,0.13)',  border: 'rgba(0,229,255,0.40)',  text: '#67e8f9' },
  Supervisor:     { active: 'rgba(244,63,94,0.12)',   border: 'rgba(244,63,94,0.42)',  text: '#fda4af' },
  Todos:          { active: 'rgba(255,255,255,0.09)', border: 'rgba(255,255,255,0.25)', text: '#eef2f8' },
}

function Skeleton() {
  return (
    <div style={skelWrap}>
      <div style={{ ...skel, width:40, height:40, borderRadius:10, flexShrink:0 }} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ ...skel, width:'52%', height:12, borderRadius:6 }} />
        <div style={{ ...skel, width:'36%', height:10, borderRadius:6 }} />
      </div>
      <div style={{ ...skel, width:76, height:20, borderRadius:99 }} />
    </div>
  )
}

export default function UserList({ usuarios, loading }) {
  const [query,     setQuery]     = useState('')
  const [rolFilter, setRolFilter] = useState('Todos')

  const filtered = useMemo(() => {
    let list = usuarios
    if (rolFilter !== 'Todos') list = list.filter(u => u.rol === rolFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(u =>
        (u.nombre || '').toLowerCase().includes(q) ||
        (u.email  || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [usuarios, query, rolFilter])

  /* conteos por rol */
  const counts = useMemo(() => {
    const c = { Todos: usuarios.length }
    usuarios.forEach(u => { c[u.rol] = (c[u.rol] || 0) + 1 })
    return c
  }, [usuarios])

  return (
    <div style={panel}>

      {/* ── Panel header ── */}
      <div style={panelHeader}>
        <div>
          <p style={eyebrow}>Directorio</p>
          <h2 style={panelTitle}>Empleados</h2>
        </div>
        <span style={totalBadge}>{usuarios.length} total</span>
      </div>

      {/* ── Búsqueda ── */}
      <div style={{ position:'relative', marginBottom:16 }}>
        <span style={searchIconStyle} aria-hidden>⌕</span>
        <input
          type="text"
          placeholder="Buscar por nombre o email…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={searchInputStyle}
          onFocus={e  => { e.target.style.borderColor='var(--violet)'; e.target.style.boxShadow='0 0 0 3px rgba(139,92,246,0.13)' }}
          onBlur={e   => { e.target.style.borderColor='var(--border)';  e.target.style.boxShadow='none' }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={clearXBtn} aria-label="Limpiar">✕</button>
        )}
      </div>

      {/* ── Filtros por rol ── */}
      <div style={filterRow}>
        {ROL_FILTERS.map(rol => {
          const active = rolFilter === rol
          const c = FILTER_COLORS[rol]
          return (
            <button
              key={rol}
              onClick={() => setRolFilter(rol)}
              style={{
                padding: '5px 13px',
                borderRadius: 99,
                border: `1px solid ${active ? c.border : 'var(--border)'}`,
                background: active ? c.active : 'transparent',
                color: active ? c.text : 'var(--text-3)',
                fontSize: '0.75rem',
                fontWeight: active ? 600 : 400,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                transition: 'all 0.16s',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              {rol}
              <span style={{
                fontSize: '0.65rem',
                background: active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)',
                padding: '1px 6px',
                borderRadius: 99,
                color: active ? 'inherit' : 'var(--text-3)',
              }}>
                {counts[rol] ?? 0}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Separador ── */}
      <div style={divider} />

      {/* ── Lista ── */}
      <div style={listWrap}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
        ) : filtered.length === 0 ? (
          <div style={emptyStyle}>
            <span style={{ fontSize:'2.2rem', opacity:0.25 }}>◎</span>
            <p style={{ marginTop:10 }}>
              {query || rolFilter !== 'Todos'
                ? 'Sin resultados para este filtro.'
                : 'Aún no hay usuarios registrados.'}
            </p>
            {(query || rolFilter !== 'Todos') && (
              <button
                onClick={() => { setQuery(''); setRolFilter('Todos') }}
                style={clearAllBtn}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          filtered.map((u, i) => (
            <UserCard key={u.id ?? `${u.email}-${i}`} usuario={u} index={i} />
          ))
        )}
      </div>

      {/* ── Footer ── */}
      {!loading && (query || rolFilter !== 'Todos') && filtered.length > 0 && (
        <p style={footerNote}>
          Mostrando {filtered.length} de {usuarios.length} empleados
        </p>
      )}
    </div>
  )
}

/* ── Estilos ── */
const panel = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 20,
  backdropFilter: 'var(--blur)',
  WebkitBackdropFilter: 'var(--blur)',
  padding: '28px 28px 24px',
  animation: 'fadeUp 0.45s 0.08s ease both',
}

const panelHeader = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: 20,
}

const eyebrow = {
  fontSize: '0.68rem',
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--violet)',
  marginBottom: 4,
}

const panelTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.45rem',
  fontWeight: 800,
  letterSpacing: '-0.03em',
}

const totalBadge = {
  marginTop: 2,
  padding: '4px 12px',
  borderRadius: 99,
  fontSize: '0.72rem',
  fontWeight: 600,
  background: 'var(--violet-dim)',
  border: '1px solid rgba(139,92,246,0.28)',
  color: '#c4b5fd',
  flexShrink: 0,
}

const searchIconStyle = {
  position: 'absolute',
  left: 13,
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-3)',
  fontSize: 15,
  pointerEvents: 'none',
  lineHeight: 1,
}

const searchInputStyle = {
  width: '100%',
  padding: '11px 38px',
  background: 'rgba(255,255,255,0.038)',
  border: '1px solid var(--border)',
  borderRadius: 11,
  color: 'var(--text)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.87rem',
  outline: 'none',
  transition: 'border-color 0.18s, box-shadow 0.18s',
}

const clearXBtn = {
  position: 'absolute',
  right: 10,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  color: 'var(--text-3)',
  cursor: 'pointer',
  fontSize: 11,
  padding: '2px 4px',
  lineHeight: 1,
}

const filterRow = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap',
  marginBottom: 0,
}

const divider = {
  height: 1,
  background: 'var(--border)',
  margin: '16px 0',
}

const listWrap = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  maxHeight: 'calc(100vh - 320px)',
  overflowY: 'auto',
  paddingRight: 2,
}

const emptyStyle = {
  textAlign: 'center',
  padding: '48px 20px',
  color: 'var(--text-2)',
  fontSize: '0.87rem',
  lineHeight: 1.6,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

const clearAllBtn = {
  marginTop: 14,
  background: 'none',
  border: '1px solid var(--border)',
  borderRadius: 99,
  color: 'var(--text-2)',
  fontSize: '0.77rem',
  padding: '6px 16px',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
}

const footerNote = {
  fontSize: '0.73rem',
  color: 'var(--text-3)',
  marginTop: 14,
  textAlign: 'center',
}

const skelWrap = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '14px 18px',
  display: 'flex',
  alignItems: 'center',
  gap: 14,
}

const skel = {
  background: 'rgba(255,255,255,0.07)',
  animation: 'shimmer 1.4s ease-in-out infinite',
}
