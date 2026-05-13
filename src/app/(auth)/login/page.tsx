'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    router.push(next)
    router.refresh()
  }

  const registerHref = next !== '/dashboard' 
    ? `/register?next=${encodeURIComponent(next)}` 
    : '/register'

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Bienvenido</h2>
        <p className="text-sm text-zinc-400 mt-1">Inicia sesión para continuar</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">
            Email
          </label>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">
            Contraseña
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-3 bg-gradient-to-b from-green-400 to-green-500 hover:from-green-300 hover:to-green-400 text-black font-semibold rounded-xl py-3.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-green-500/20"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="text-center text-sm text-zinc-500 mt-5">
          ¿No tienes cuenta?{' '}
          <Link href={registerHref} className="text-green-400 hover:text-green-300 font-medium transition-colors">
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8">
        <p className="text-center text-zinc-500">Cargando...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}