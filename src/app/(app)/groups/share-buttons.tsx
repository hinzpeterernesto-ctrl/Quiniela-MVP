'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface Props {
  inviteCode: string
  groupName: string
}

export function ShareButtons({ inviteCode, groupName }: Props) {
  const [copied, setCopied] = useState(false)
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const inviteLink = `${siteUrl}/join?code=${inviteCode}`
  
  const whatsappMessage = encodeURIComponent(
    `🏆 ¡Te invito a mi Quiniela del Mundial 2026!\n\n` +
    `Grupo: ${groupName}\n` +
    `Únete aquí: ${inviteLink}\n\n` +
    `O usa el código: ${inviteCode}`
  )

  async function copyCode() {
    await navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    toast.success('Código copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(inviteLink)
    toast.success('Link copiado')
  }

  function shareWhatsapp() {
    window.open(`https://wa.me/?text=${whatsappMessage}`, '_blank')
  }

  async function shareNative() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Quiniela Mundial 2026',
          text: `Te invito a la quiniela ${groupName}`,
          url: inviteLink,
        })
      } catch {}
    } else {
      copyLink()
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Compartir
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={shareWhatsapp} className="bg-green-600 hover:bg-green-700 text-white">
          📱 WhatsApp
        </Button>
        <Button onClick={shareNative} variant="outline">
          📤 Compartir
        </Button>
        <Button onClick={copyLink} variant="outline">
          🔗 Copiar link
        </Button>
        <Button onClick={copyCode} variant="outline">
          {copied ? '✅ Copiado' : '📋 Copiar código'}
        </Button>
      </div>
      <div className="mt-4 p-3 bg-background border border-border rounded-lg">
        <p className="text-xs text-muted-foreground mb-1">Link directo:</p>
        <p className="text-xs font-mono text-foreground break-all">{inviteLink}</p>
      </div>
    </div>
  )
}