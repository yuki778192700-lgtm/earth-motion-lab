import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: ReactNode
  unit?: string
  note?: string
  accent?: 'cyan' | 'orange' | 'neutral'
}

export function MetricCard({ label, value, unit, note, accent = 'neutral' }: MetricCardProps) {
  return (
    <article className="metric-card" data-accent={accent}>
      <span className="metric-label">{label}</span>
      <div className="metric-value">
        <strong>{value}</strong>
        {unit ? <span>{unit}</span> : null}
      </div>
      {note ? <small>{note}</small> : null}
    </article>
  )
}
