import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: matches } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
    .order('kickoff_at')
    .limit(5)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Hola, <span className="text-primary">{profile?.display_name ?? 'Jugador'}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">Bienvenido a la Quiniela del Mundial 2026</p>
        </div>

        <div className="grid gap-4">
          <h2 className="text-xl font-semibold text-foreground">Próximos partidos</h2>
          {matches?.map(match => (
            <div key={match.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{match.home_team?.flag_url}</p>
                  <p className="font-semibold text-foreground">{match.home_team?.name}</p>
                </div>
                <div className="text-center px-4">
                  {match.status === 'finished' ? (
                    <p className="text-2xl font-bold text-foreground">{match.home_score} - {match.away_score}</p>
                  ) : match.status === 'live' ? (
                    <span className="text-red-400 font-bold text-sm animate-pulse">EN VIVO</span>
                  ) : (
                    <p className="text-sm text-muted-foreground">vs</p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{match.away_team?.flag_url}</p>
                  <p className="font-semibold text-foreground">{match.away_team?.name}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  match.status === 'live' ? 'bg-red-500/20 text-red-400' :
                  match.status === 'finished' ? 'bg-green-500/20 text-green-400' :
                  'bg-secondary text-muted-foreground'
                }`}>
                  {match.status === 'live' ? 'En vivo' :
                   match.status === 'finished' ? 'Finalizado' : 'Programado'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
