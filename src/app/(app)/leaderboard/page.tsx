import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: mem } = await supabase
    .from('memberships')
    .select('group_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!mem) {
    return (
      <div className="min-h-screen bg-background p-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Clasificación</h1>
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🏆</p>
          <p className="text-muted-foreground">Únete a un grupo para ver el ranking</p>
        </div>
      </div>
    )
  }

  const { data: gs } = await supabase
    .from('group_standings')
    .select('*')
    .eq('group_id', mem.group_id)
    .order('total_points', { ascending: false })

  const userIds = (gs ?? []).map(s => s.user_id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds.length > 0 ? userIds : ['none'])

  const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]) ?? [])
  const standings = (gs ?? []).map(s => ({ ...s, name: profileMap.get(s.user_id) ?? 'Usuario' }))
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Clasificación</h1>
        <p className="text-muted-foreground mb-8">Ranking del grupo</p>

        {standings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🏆</p>
            <p className="text-muted-foreground">Aún no hay predicciones puntuadas</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {standings.map((s, i) => (
              <div key={s.user_id} className={`flex items-center gap-4 p-4 rounded-xl border ${
                i === 0 ? 'bg-yellow-500/10 border-yellow-500/30' :
                i === 1 ? 'bg-gray-400/10 border-gray-400/30' :
                i === 2 ? 'bg-orange-600/10 border-orange-600/30' :
                'bg-card border-border'
              }`}>
                <span className="text-2xl w-8 text-center">{medals[i] ?? `#${i + 1}`}</span>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-lg">
                  {s.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.predictions_scored} predicciones · {s.exact_scores} exactas
                    {s.current_streak > 2 && ` · 🔥 ${s.current_streak}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{s.total_points}</p>
                  <p className="text-xs text-muted-foreground">puntos</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}