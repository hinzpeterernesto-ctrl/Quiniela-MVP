'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/auth-context'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

interface ProvidersProps {
  children: React.ReactNode
  initialSession: Session | null
  initialProfile: Profile | null
}

export function Providers({ children, initialSession, initialProfile }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <AuthProvider initialSession={initialSession} initialProfile={initialProfile}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'hsl(155 20% 8%)',
              border: '1px solid hsl(155 20% 18%)',
              color: 'hsl(0 0% 95%)',
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  )
}
