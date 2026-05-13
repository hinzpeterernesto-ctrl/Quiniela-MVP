import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { JoinGroup } from './join-group'
import { ShareButtons } from './share-buttons'

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
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{String(group.name)}</h2>
                  <p className="text-sm text-muted-foreground capitalize">{membership?.role}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-primary/30 rounded-xl p-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Código de invitación
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 bg-background border border-border rounded-lg px-4 py-3">
                  <span className="text-2xl font-mono font-bold text-primary tracking-widest">
                    {String(group.invite_code)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Comparte este código o el link directo con tus amigos
              </p>
            </div>

            <ShareButtons 
              inviteCode={String(group.invite_code)} 
              groupName={String(group.name)} 
            />
          </div>
        ) : (
          <JoinGroup />
        )}
      </div>
    </div>
  )
}
