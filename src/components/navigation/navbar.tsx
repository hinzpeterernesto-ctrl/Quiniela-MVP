'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { Home, Calendar, Trophy, LogOut, User } from 'lucide-react'

const NAV_ITEMS = [
    { href: '/dashboard',   label: 'Inicio',         icon: Home },
    { href: '/matches',     label: 'Partidos',        icon: Calendar },
    { href: '/leaderboard', label: 'Clasificación',   icon: Trophy },
    { href: '/groups',      label: 'Mi Grupo',        icon: User },
  ]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, signOut } = useAuth()

  async function handleSignOut() {
    await signOut()
    toast.success('Sesión cerrada')
    router.push('/login')
  }

  return (
    <>
      {/* SIDEBAR — desktop */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 h-screen sticky top-0 border-r border-border bg-card">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-16 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm">Q</div>
          <span className="font-bold text-foreground">Quiniela <span className="text-primary">2026</span></span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col gap-1 px-2 py-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User + logout */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 px-2 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
              {profile?.display_name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{profile?.display_name}</p>
              <p className="text-[10px] text-muted-foreground truncate">@{profile?.username}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* BOTTOM NAV — mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur safe-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link key={href} href={href} className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}>
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}
          <button onClick={handleSignOut} className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-muted-foreground hover:text-red-400 transition-colors">
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] font-medium">Salir</span>
          </button>
        </div>
      </nav>
    </>
  )
}