'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function JoinGroup() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin() {
    if (!code.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.rpc('join_group_by_code',  {
      p_invite_code: code.toUpperCase().trim()
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('¡Te uniste al grupo!')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-foreground mb-2">Unirse a un grupo</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Ingresa el código que te compartió el organizador de la quiniela
        </p>
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Ej: QUINIELA1"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            className="text-center text-xl font-mono tracking-widest h-14"
          />
          <Button onClick={handleJoin} loading={loading} size="lg">
            Unirse al grupo
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          ¿No tienes código?
        </h3>
        <p className="text-sm text-muted-foreground">
          Pídele el código al organizador de tu quiniela. 
          Cada grupo tiene un código único de invitación.
        </p>
      </div>
    </div>
  )
}