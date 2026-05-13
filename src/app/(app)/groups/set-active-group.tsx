'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Props {
  groupId: string
  groupName: string
  role: string
}

export function SetActiveGroup({ groupId, groupName, role }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleSetActive() {
    setLoading(true)
    const { error } = await supabase.rpc('set_active_group', { p_group_id: groupId })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success(`Cambiaste a "${groupName}"`)
    router.refresh()
  }

  return (
    <button
      onClick={handleSetActive}
      disabled={loading}
      className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent hover:border-primary/50 transition-colors disabled:opacity-50 flex items-center justify-between"
    >
      <div>
        <p className="font-medium text-foreground">{groupName}</p>
        <p className="text-xs text-muted-foreground capitalize">{role}</p>
      </div>
      <span className="text-sm text-primary">Activar →</span>
    </button>
  )
}