'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 12) {
      toast.error('La contraseña debe tener al menos 12 caracteres')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: displayName },
      },
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('¡Cuenta creada! Revisa tu email para confirmar.')
    router.push('/login')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>Únete a la quiniela del Mundial</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <Input
            placeholder="Nombre completo"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
          />
          <Input
            placeholder="Nombre de usuario"
            value={username}
            onChange={e => setUsername(e.target.value.toLowerCase())}
            required
          />
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Contraseña (mínimo 12 caracteres)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button type="submit" loading={loading}>
            Crear cuenta
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
