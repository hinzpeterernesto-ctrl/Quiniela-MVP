import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { createClient } from '@/lib/supabase/server'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Quiniela Mundial 2026',
    template: '%s · Quiniela 2026',
  },
  description: 'Predice los resultados del Mundial y compite con tus amigos',
  keywords: ['quiniela', 'mundial', 'fútbol', 'predicciones'],
}

export const viewport: Viewport = {
  themeColor: '#0a0f0c',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Pre-load session server-side to avoid hydration flash
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  let initialProfile = null
  if (session?.user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    initialProfile = data
  }

  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers initialSession={session} initialProfile={initialProfile}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
