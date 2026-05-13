import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { JoinGroup } from './join-group'

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('group_id, role, groups(*)')
    .eq('user_id', user.id)
    .maybeSingle()

    const group = membership?.groups as Record<string, unknown>


  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Mi Grupo</h1>
        <p className="text-muted-foreground mb-8">Invita amigos a tu quiniela</p>

        {group ? (
          <div className="flex flex-col gap-6">
            {/* Info del grupo */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{group.name}</h2>
                  <p className="text-sm text-muted-foreground capitalize">{membership?.role}</p>
                </div>
              </div>
            </div>

            {/* Código de invitación */}
            <div className="bg-card border border-primary/30 rounded-xl p-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Código de invitación
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-background border border-border rounded-lg px-4 py-3">
                  <span className="text-2xl font-mono font-bold text-primary tracking-widest">
                    {group.invite_code}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Comparte este código con tus amigos para que se unan a tu quiniela
              </p>
            </div>

            {/* Instrucciones para compartir */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Cómo unirse
              </h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">1.</span>
                  Tu amigo entra a la quiniela y crea una cuenta
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">2.</span>
                  Va a Mi Grupo en el menú
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">3.</span>
                  Escribe el código <span className="text-primary font-mono font-bold">{group.invite_code}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">4.</span>
                  ¡Ya está dentro de la quiniela!
                </li>
              </ol>
            </div>
          </div>
        ) : (
          <JoinGroup />
        )}
      </div>
    </div>
  )
}