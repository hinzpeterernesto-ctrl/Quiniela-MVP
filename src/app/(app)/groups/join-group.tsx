'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function JoinGroup() {
  const router = useRouter()
  const supabase = createClient()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    const trimmedCode = code.trim().toUpperCase()
    
    if (trimmedCode.length === 0) {
      toast.error('Ingresa un código')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.rpc('join_group_by_code', { 
        p_invite_code: trimmedCode 
      })

      if (error) {
        console.error('Error joining group:', error)
        toast.error(error.message || 'Error al unirse al grupo')
        setLoading(false)
        return
      }

      toast.success('¡Te uniste al grupo!')
      setCode('')
      router.refresh()
    } catch (err) {
      console.error('Unexpected error:', err)
      toast.error('Error inesperado al unirse al grupo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-bold text-foreground mb-2">Unirse a un grupo</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Ingresa el código que te compartió el organizador de la quiniela
      </p>
      <form onSubmit={handleJoin} className="flex flex-col gap-3">
        <Input
          placeholder="Ej: QUINIELA1"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          maxLength={20}
          className="font-mono uppercase"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || code.trim().length === 0}>
          {loading ? 'Uniéndose...' : 'Unirse al grupo'}
        </Button>
      </form>
      
      <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
          ¿No tienes código?
        </p>
        <p className="text-sm text-foreground">
          Pídele el código al organizador de tu quiniela. Cada grupo tiene un código único de invitación.
        </p>
      </div>
    </div>
  )
}
