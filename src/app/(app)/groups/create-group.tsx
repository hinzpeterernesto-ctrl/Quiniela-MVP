'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function CreateGroup() {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 3) {
      toast.error('El nombre debe tener al menos 3 caracteres')
      return
    }
    setLoading(true)
    const { error } = await supabase.rpc('create_group', { p_name: name.trim() })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success(`¡Grupo "${name}" creado!`)
    setName('')
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="lg" className="w-full">
        ➕ Crear nuevo grupo
      </Button>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Crear nuevo grupo</h3>
      <form onSubmit={handleCreate} className="flex flex-col gap-4">
        <Input
          placeholder="Nombre del grupo (ej. Familia, Oficina...)"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={50}
          required
        />
        <div className="flex gap-2">
          <Button type="submit" loading={loading} className="flex-1">
            Crear
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}