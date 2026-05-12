import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: matches } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
    .order('kickoff_at')

  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id)

  const predMap = new Map(predictions?.map(p => [p.match_id, p]) ?? [])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Partidos</h1>
          <p className="text-muted-foreground mt-1">Haz tus predicciones antes del inicio</p>
        </div>

        <div className="flex flex-col gap-4">
          {matches?.map(match => {
            const pred = predMap.get(match.id)
            const kickoff = new Date(match.kickoff_at)
            const canPredict = kickoff > new Date() && match.status === 'scheduled'
            const isLive = match.status === 'live' || match.status === 'halftime'
            const isFinished = match.status === 'finished'

            return (
              <div key={match.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-muted-foreground">
                    Grupo {match.group_letter} · {kickoff.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })} {kickoff.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    isLive ? 'bg-red-500/20 text-red-400' :
                    isFinished ? 'bg-green-500/20 text-green-400' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {isLive ? '🔴 EN VIVO' : isFinished ? 'Finalizado' : 'Programado'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-center">
                    <div className="text-3xl mb-1">{match.home_team?.flag_url}</div>
                    <p className="font-semibold text-foreground">{match.home_team?.name}</p>
                  </div>

                  <div className="text-center px-4">
                    {isFinished || isLive ? (
                      <p className="text-3xl font-bold text-foreground tabular-nums">
                        {match.home_score ?? 0} - {match.away_score ?? 0}
                      </p>
                    ) : (
                      <p className="text-2xl text-muted-foreground font-light">vs</p>
                    )}
                  </div>

                  <div className="flex-1 text-center">
                    <div className="text-3xl mb-1">{match.away_team?.flag_url}</div>
                    <p className="font-semibold text-foreground">{match.away_team?.name}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  {pred ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Tu predicción:</span>
                        <span className="font-bold text-primary text-lg tabular-nums">
                          {pred.home_score} - {pred.away_score}
                        </span>
                      </div>
                      {pred.points_awarded !== null && (
                        <span className="text-sm font-bold text-primary">
                          +{pred.points_awarded} pts
                        </span>
                      )}
                      {canPredict && (
                        <Link
                          href={`/matches/${match.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          Editar
                        </Link>
                      )}
                    </div>
                  ) : canPredict ? (
                    <Link
                      href={`/matches/${match.id}`}
                      className="block w-full text-center py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Predecir resultado
                    </Link>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">
                      {isFinished ? 'No predijiste este partido' : 'Mercado cerrado'}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
