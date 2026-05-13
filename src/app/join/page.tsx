'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

function JoinContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')?.toUpperCase() ?? ''
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [groupName, setGroupName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [alreadyMember, setAlreadyMember] = useState(false)

  useEffect(() => {
    async function init() {
      if (!code) {
        setError('Código de invitación no válido')
        setChecking(false)
        return
      }

      const { data: group } = await supabase
        .from('groups')
        .select('id, name')
        .eq('invite_code', code)
        .maybeSingle()

      if (!group) {
        setError('El código de invitación no existe')
        setChecking(false)
        return
      }

      setGroupName(group.name)

      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        setUser(currentUser)
        const { data: membership } = await supabase
          .from('memberships')
          .select('group_id')
          .eq('user_id', currentUser.id)
          .eq('group_id', group.id)
          .maybeSingle()
        if (membership) setAlreadyMember(true)
      }

      setChecking(false)
    }
    init()
  }, [code])

  async function handleJoin() {
    if (!user) {
      router.push(`/register?next=/join?code=${code}`)
      return
    }
    setLoading(true)
    const { error } = await supabase.rpc('join_group_by_code', { p_invite_code: code })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success(`¡Te uniste a ${groupName}!`)
    router.push('/dashboard')
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-muted-foreground">Verificando invitación...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary mb-4">
            <span className="text-2xl font-black text-primary-foreground">Q</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Quiniela <span className="text-primary">2026</span>
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {error ? 'Invitación no válida' : '🎉 Te han invitado'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center">
                <p className="text-muted-foreground mb-6">{error}</p>
                <Link href="/login">
                  <Button className="w-full">Volver al inicio</Button>
                </Link>
              </div>
            ) : alreadyMember ? (
              <div className="text-center">
                <p className="text-muted-foreground mb-2">
                  Ya eres miembro del grupo
                </p>
                <p className="text-xl font-bold text-primary mb-6">{groupName}</p>
                <Link href="/dashboard">
                  <Button className="w-full">Ir al dashboard</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    Te invitan a unirte a
                  </p>
                  <p className="text-2xl font-bold text-primary mb-1">{groupName}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    Código: {code}
                  </p>
                </div>
                {user ? (
                  <Button onClick={handleJoin} loading={loading} className="w-full" size="lg">
                    Unirme al grupo
                  </Button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-center text-muted-foreground mb-2">
                      Necesitas una cuenta para unirte
                    </p>
                    <Link href={`/register?next=${encodeURIComponent(`/join?code=${code}`)}`}>
                      <Button className="w-full" size="lg">
                        Crear cuenta
                      </Button>
                    </Link>
                    <Link href={`/login?next=${encodeURIComponent(`/join?code=${code}`)}`}>
                      <Button variant="outline" className="w-full">
                        Ya tengo cuenta
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    }>
      <JoinContent />
    </Suspense>
  )
}