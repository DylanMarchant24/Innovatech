import React, { useState } from 'react'

const ROLES = [
  { value: 'Administrador', icon: '◆', color: { bg:'rgba(139,92,246,0.12)', border:'rgba(139,92,246,0.38)', text:'#c4b5fd' } },
  { value: 'Desarrollador', icon: '◈', color: { bg:'rgba(0,229,255,0.10)',   border:'rgba(0,229,255,0.35)',  text:'#67e8f9' } },
  { value: 'Supervisor',    icon: '◉', color: { bg:'rgba(244,63,94,0.10)',    border:'rgba(244,63,94,0.38)',  text:'#fda4af' } },
]

function validate(form) {
  const e = {}
  if (!form.nombre.trim()) e.nombre = 'El nombre es requerido.'
  if (!form.email.trim())  e.email  = 'El email es requerido.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Ingresa un email válido.'
  if (!form.rol) e.rol = 'Selecciona un rol.'
  return e
}

export default function RegisterForm({ onSubmit, apiOnline }) {
  const [form,    setForm]    = useState({ nombre: '', email: '', rol: '' })
  const [errors,  setErrors]  = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    const next = { ...form, [name]: value }
    setForm(next)
    if (touched[name]) setErrors(prev => ({ ...prev, [name]: validate(next)[name] }))
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    setErrors(prev => ({ ...prev, [name]: validate(form)[name] }))
  }

  const pickRol = (rol) => {
    setForm(prev => ({ ...prev, rol }))
    setErrors(prev => ({ ...prev, rol: undefined }))
    setTouched(prev => ({ ...prev, rol: true }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) {
      setErrors(errs)
      setTouched({ nombre: true, email: true, rol: true })
      return
    }
    setLoading(true)
    try {
      await onSubmit(form)
      setForm({ nombre: '', email: '', rol: '' })
      setErrors({})
      setTouched({})
    } catch { /* padre maneja toast */ }
    finally { setLoading(false) }
  }

  return (
    <div style={card}>

      {/* ── Encabezado de tarjeta ── */}
      <div style={cardHeader}>
        <p style={eyebrow}>Nuevo registro</p>
        <h2 style={cardTitle}>
          Agregar <span style={{ color:'var(--cyan)' }}>empleado</span>
        </h2>
        <p style={cardDesc}>
          Completa los campos para registrar un usuario en el sistema.
        </p>
      </div>

      {/* ── Separador ── */}
      <div style={divider} />

      {/* ── Formulario ── */}
      <form onSubmit={handleSubmit} noValidate style={{ display:'flex', flexDirection:'column', gap:20 }}>

        {/* Nombre */}
        <div>
          <label style={label} htmlFor="nombre">Nombre completo</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            placeholder="Ej: Ana Pérez"
            value={form.nombre}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
            style={inputCss(!!errors.nombre)}
            onFocus={e  => applyFocus(e, !!errors.nombre)}
            onBlurCapture={e => removeFocus(e, !!errors.nombre)}
          />
          {errors.nombre && touched.nombre && <p style={errMsg}>{errors.nombre}</p>}
        </div>

        {/* Email */}
        <div>
          <label style={label} htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="ana@innovatech.cl"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
            style={inputCss(!!errors.email)}
            onFocus={e  => applyFocus(e, !!errors.email)}
            onBlurCapture={e => removeFocus(e, !!errors.email)}
          />
          {errors.email && touched.email && <p style={errMsg}>{errors.email}</p>}
        </div>

        {/* Rol — pills */}
        <div>
          <label style={label}>Rol en la empresa</label>
          <div style={{ display:'flex', gap:8 }}>
            {ROLES.map(({ value, icon, color }) => {
              const active = form.rol === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => pickRol(value)}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    borderRadius: 12,
                    border: `1px solid ${active ? color.border : 'var(--border)'}`,
                    background: active ? color.bg : 'rgba(255,255,255,0.03)',
                    color: active ? color.text : 'var(--text-2)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8rem',
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 5,
                    transform: active ? 'scale(1.03)' : 'scale(1)',
                  }}
                >
                  <span style={{ fontSize:'1.1rem', lineHeight:1 }}>{icon}</span>
                  <span>{value}</span>
                </button>
              )
            })}
          </div>
          {errors.rol && touched.rol && <p style={errMsg}>{errors.rol}</p>}
        </div>

        {/* ── Separador ── */}
        <div style={divider} />

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          style={{ ...submitBtn, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 32px rgba(0,229,255,0.42)' }}}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(0,229,255,0.26)' }}
        >
          {loading
            ? <><span style={spinner} /> Registrando…</>
            : '✦  Registrar usuario'
          }
        </button>
      </form>

      {/* ── Estado API ── */}
      <div style={apiBar}>
        <span style={{
          width:7, height:7, borderRadius:'50%', flexShrink:0,
          background: apiOnline === true ? 'var(--success)' : apiOnline === false ? 'var(--error)' : '#444',
          boxShadow:  apiOnline === true ? '0 0 6px var(--success)' : apiOnline === false ? '0 0 6px var(--error)' : 'none',
        }} />
        <span style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>
          {apiOnline === true  ? 'API conectada · localhost:8080'
          : apiOnline === false ? 'API no disponible'
          : 'Verificando conexión…'}
        </span>
      </div>
    </div>
  )
}

/* helpers de focus */
function applyFocus(e, hasError) {
  e.target.style.borderColor = hasError ? 'var(--error)' : 'var(--cyan)'
  e.target.style.boxShadow   = hasError ? '0 0 0 3px rgba(244,63,94,0.13)' : '0 0 0 3px rgba(0,229,255,0.12)'
}
function removeFocus(e, hasError) {
  e.target.style.borderColor = hasError ? 'var(--error)' : 'var(--border)'
  e.target.style.boxShadow   = hasError ? '0 0 0 3px rgba(244,63,94,0.13)' : 'none'
}

/* ── Estilos ── */
const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 20,
  backdropFilter: 'var(--blur)',
  WebkitBackdropFilter: 'var(--blur)',
  padding: '28px 28px 24px',
  animation: 'fadeUp 0.45s ease both',
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
}

const cardHeader = {
  paddingBottom: 20,
}

const eyebrow = {
  fontSize: '0.68rem',
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--cyan)',
  marginBottom: 8,
}

const cardTitle = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.55rem',
  fontWeight: 800,
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
}

const cardDesc = {
  fontSize: '0.82rem',
  color: 'var(--text-2)',
  marginTop: 8,
  lineHeight: 1.55,
}

const divider = {
  height: 1,
  background: 'var(--border)',
  margin: '0 0 20px',
}

const label = {
  display: 'block',
  fontSize: '0.71rem',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--text-2)',
  marginBottom: 8,
}

const inputCss = (hasError) => ({
  width: '100%',
  padding: '12px 15px',
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${hasError ? 'var(--error)' : 'var(--border)'}`,
  borderRadius: 11,
  color: 'var(--text)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.18s, box-shadow 0.18s',
  boxShadow: hasError ? '0 0 0 3px rgba(244,63,94,0.13)' : 'none',
})

const errMsg = {
  fontSize: '0.73rem',
  color: 'var(--error)',
  marginTop: 5,
}

const submitBtn = {
  width: '100%',
  padding: '13px 20px',
  border: 'none',
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  fontFamily: 'var(--font-display)',
  fontSize: '0.93rem',
  fontWeight: 700,
  letterSpacing: '0.01em',
  background: 'linear-gradient(135deg, #00e5ff 0%, #0097a7 100%)',
  color: '#061018',
  transition: 'transform 0.18s, box-shadow 0.18s, opacity 0.18s',
  boxShadow: '0 4px 20px rgba(0,229,255,0.26)',
}

const spinner = {
  display: 'inline-block',
  width: 16, height: 16,
  border: '2px solid rgba(6,16,24,0.3)',
  borderTopColor: '#061018',
  borderRadius: '50%',
  animation: 'spin 0.7s linear infinite',
}

const apiBar = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginTop: 20,
  paddingTop: 16,
  borderTop: '1px solid var(--border)',
}
