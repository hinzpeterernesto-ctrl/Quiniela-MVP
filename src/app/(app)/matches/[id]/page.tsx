'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface Match {
  id: string
  home_score: number | null
  away_score: number | null
  kickoff_at: string
  status: string
  group_letter: string
  home_team: { name: string; flag_url: string }
  away_team: { name: string; flag_url: string }
}

export default function PredictPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const [match, setMatch] = useState<Match | null>(null)
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [existing, setExisting] = useState<{ id: string } | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data: matchData } = await supabase.from('matches').select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)').eq('id', id).single()
      if (matchData) setMatch(matchData)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: pred } = await supabase.from('predictions').select('*').eq('match_id', id).eq('user_id', user.id).maybeSingle()
        if (pred) { setExisting(pred); setHomeScore(pred.home_score); setAwayScore(pred.away_score) }
      }
      setReady(true)
    }
    load()
  }, [id, supabase])

  async function handleSubmit() {
    if (!match) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: membership } = await supabase.from('memberships').select('group_id').eq('user_id', user.id).limit(1).maybeSingle()
    if (!membership) { toast.error('Debes unirte a un grupo'); setLoading(false); return }
    const payload = { match_id: id, user_id: user.id, group_id: membership.group_id, home_score: homeScore, away_score: awayScore }
    let error
    if (existing) { const res = await supabase.from('predictions').update(payload).eq('id', existing.id); error = res.error }
    else { const res = await supabase.from('predictions').insert(payload); error = res.error }
    if (error) { toast.error('Error: ' + error.message) }
    else { toast.success('Prediccion guardada!'); router.push('/matches') }
    setLoading(false)
  }

  if (!ready) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Cargando...</p></div>
  if (!match) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">No encontrado</p></div>

  const canPredict = new Date(match.kickoff_at) > new Date() && match.status === 'scheduled'

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground mb-6 text-sm">Volver</button>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{canPredict ? 'Tu prediccion' : 'Partido'}</CardTitle>
            <p className="text-center text-sm text-muted-foreground">Grupo {match.group_letter}</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex-1 text-center">
                <div className="text-4xl mb-2">{match.home_team.flag_url}</div>
                <p className="font-semibold text-sm">{match.home_team.name}</p>
              </div>
              <div className="flex items-center gap-3">
                {canPredict ? (
                  <>
                    <div className="flex flex-col items-center gap-2">
                      <button onClick={() => setHomeScore(s => Math.min(s+1,20))} className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">+</button>
                      <span className="text-4xl font-bold w-12 text-center">{homeScore}</span>
                      <button onClick={() => setHomeScore(s => Math.max(s-1,0))} className="w-10 h-10 rounded-full bg-secondary text-foreground font-bold text-lg">-</button>
                    </div>
                    <span className="text-2xl text-muted-foreground">-</span>
                    <div className="flex flex-col items-center gap-2">
                      <button onClick={() => setAwayScore(s => Math.min(s+1,20))} className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">+</button>
                      <span className="text-4xl font-bold w-12 text-center">{awayScore}</span>
                      <button onClick={() => setAwayScore(s => Math.max(s-1,0))} className="w-10 h-10 rounded-full bg-secondary text-foreground font-bold text-lg">-</button>
                    </div>
                  </>
                ) : (
                  <span className="text-4xl font-bold">{match.home_score ?? 0} - {match.away_score ?? 0}</span>
                )}
              </div>
              <div className="flex-1 text-center">
                <div className="text-4xl mb-2">{match.away_team.flag_url}</div>
                <p className="font-semibold text-sm">{match.away_team.name}</p>
              </div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3 mb-6 text-xs text-muted-foreground space-y-1">
              <p>Marcador exacto: 5 puntos</p>
              <p>Resultado correcto: 3 puntos</p>
              <p>Diferencia correcta: +1 punto</p>
            </div>
            {canPredict ? (
              <Button onClick={handleSubmit} loading={loading} className="w-full" size="lg">{existing ? 'Actualizar' : 'Guardar prediccion'}</Button>
            ) : (
              <div className="text-center py-3 rounded-lg bg-secondary text-muted-foreground text-sm">Mercado cerrado</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}