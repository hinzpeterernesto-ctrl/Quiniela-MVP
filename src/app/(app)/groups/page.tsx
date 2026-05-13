import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { JoinGroup } from './join-group'
import { ShareButtons } from './share-buttons'
import { CreateGroup } from './create-group'
import { SetActiveGroup } from './set-active-group'

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('active_group_id')
    .eq('id', user.id)
    .maybeSingle()

  const { data: memberships } = await supabase
    .from('memberships')
    .select('group_id, role, groups(*)')
    .eq('user_id', user.id)

  const groups = (memberships ?? []).map(m => ({
    ...(m.groups as Record<string, unknown>),
    role: m.role,
  }))

  const activeGroupId = profile?.active_group_id as string | null
  const activeGroup = groups.find(g => g.id === activeGroupId) ?? groups[0]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Mis Grupos</h1>
        <p className="text-muted-foreground mb-8">
          {groups.length === 0
            ? 'Crea un grupo o únete con un código'
            : 'Cambia de grupo o crea uno nuevo'}
        </p>

        {groups.length > 0 && activeGroup && (
          <div className="flex flex-col gap-6 mb-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">
                    {String(activeGroup.name)}
                  </h2>
                  <p className="text-sm text-muted-foreground capitalize">
                    {String(activeGroup.role)} · Grupo activo
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-primary/30 rounded-xl p-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Código de invitación
              </h3>
              <div className="bg-background border border-border rounded-lg px-4 py-3 mb-4">
                <span className="text-2xl font-mono font-bold text-primary tracking-widest">
                  {String(activeGroup.invite_code)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Comparte este código o el link directo con tus amigos
              </p>
            </div>

            <ShareButtons
              inviteCode={String(activeGroup.invite_code)}
              groupName={String(activeGroup.name)}
            />

            {groups.length > 1 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Otros grupos
                </h3>
                <div className="flex flex-col gap-2">
                  {groups
                    .filter(g => g.id !== activeGroup.id)
                    .map(g => (
                      <SetActiveGroup
                        key={String(g.id)}
                        groupId={String(g.id)}
                        groupName={String(g.name)}
                        role={String(g.role)}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <CreateGroup />
          <JoinGroup />
        </div>
      </div>
    </div>
  )
}