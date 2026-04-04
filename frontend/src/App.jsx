import React from 'react'
import Background   from './components/Background'
import Header       from './components/Header'
import RegisterForm from './components/RegisterForm'
import UserList     from './components/UserList'
import Toast, { useToast } from './components/Toast'
import { useUsuarios } from './hooks/useUsuarios'

export default function App() {
  const { usuarios, loading, apiOnline, crearUsuario } = useUsuarios()
  const { toast, show: showToast } = useToast()

  const handleSubmit = async (form) => {
    try {
      const nuevo = await crearUsuario(form)
      showToast(`"${nuevo.nombre}" registrado correctamente.`, 'success')
    } catch {
      showToast('Error al registrar. ¿Está el backend activo?', 'error')
      throw new Error('submit failed')
    }
  }

  return (
    <div style={root}>
      <Background />

      <div style={shell}>
        <Header />

        <main style={layout}>
          {/* Columna izquierda — formulario fijo */}
          <aside style={sidebar}>
            <RegisterForm onSubmit={handleSubmit} apiOnline={apiOnline} />
          </aside>

          {/* Columna derecha — lista */}
          <section style={content}>
            <UserList usuarios={usuarios} loading={loading} />
          </section>
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  )
}

const root = {
  position: 'relative',
  minHeight: '100vh',
}

const shell = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
}

const layout = {
  display: 'grid',
  gridTemplateColumns: '400px 1fr',
  gap: '24px',
  padding: '32px 40px 48px',
  alignItems: 'start',
  flex: 1,
  maxWidth: 1400,
  margin: '0 auto',
  width: '100%',
}

const sidebar = {
  position: 'sticky',
  top: 88,   /* header height + breathing room */
}

const content = {
  minWidth: 0,
}
