import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { MatchStatus, MatchStage } from '@/types/database'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatKickoff(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return `Hoy ${format(date, 'HH:mm')}`
  if (isTomorrow(date)) return `Mañana ${format(date, 'HH:mm')}`
  return format(date, "EEE d MMM · HH:mm", { locale: es })
}

export function formatRelative(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: es })
}

export function formatPoints(pts: number | null | undefined): string {
  if (pts === null || pts === undefined) return '—'
  return pts % 1 === 0 ? String(pts) : pts.toFixed(1)
}

export function isLive(status: MatchStatus): boolean {
  return status === 'live' || status === 'halftime'
}

export function isFinished(status: MatchStatus): boolean {
  return status === 'finished'
}

export function isScheduled(status: MatchStatus): boolean {
  return status === 'scheduled'
}

export function isBeforeKickoff(kickoffAt: string): boolean {
  return new Date(kickoffAt) > new Date()
}

const STAGE_LABELS: Record<MatchStage, string> = {
  group: 'Fase de Grupos',
  round_of_16: 'Octavos',
  quarter: 'Cuartos',
  semi: 'Semifinal',
  third_place: '3er Puesto',
  final: 'FINAL',
}

export function formatStage(stage: MatchStage): string {
  return STAGE_LABELS[stage] ?? stage
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase() ?? '')
    .join('')
}

export function sanitize(str: string): string {
  return str.normalize('NFC').replace(/[\x00-\x1F\x7F]/g, '').trim()
}
