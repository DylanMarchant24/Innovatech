import { useState, useEffect, useCallback } from 'react'

const API_URL = '/api/usuarios'

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading]   = useState(true)
  const [apiOnline, setApiOnline] = useState(null)

  const fetchUsuarios = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()
      setUsuarios(data)
      setApiOnline(true)
    } catch {
      setApiOnline(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const crearUsuario = useCallback(async (payload) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const nuevo = await res.json()
    setUsuarios(prev => [nuevo, ...prev])
    setApiOnline(true)
    return nuevo
  }, [])

  useEffect(() => { fetchUsuarios() }, [fetchUsuarios])

  return { usuarios, loading, apiOnline, crearUsuario }
}
