import { useState } from 'react'
import { applyUtcClock } from '../../domain/simulation/utcTimeInput'
import { useEarthLabStore } from '../../store/useEarthLabStore'

export function UtcTimeEditor() {
  const timeMs = useEarthLabStore(state => state.simulationTimeMs)
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const currentClock = new Date(timeMs).toISOString().slice(11, 19)

  return <form className="local-time-utc" onSubmit={event => {
    event.preventDefault()
    const state = useEarthLabStore.getState()
    const result = applyUtcClock(state.simulationTimeMs, draft ?? currentClock)
    if (result === null) { setError(true); return }
    state.setSimulationTime(result)
    setDraft(null)
    setError(false)
  }}>
    <label>UTC 时刻<input type="text" inputMode="text" maxLength={8}
      value={draft ?? currentClock} aria-label="地方时实验UTC时刻"
      aria-invalid={error} aria-describedby={error ? 'utc-clock-error' : undefined}
      placeholder="HH:mm:ss"
      onChange={event => { setDraft(event.target.value); setError(false) }} /></label>
    <button type="submit">应用UTC时刻</button>
    {error ? <small id="utc-clock-error" role="alert">请输入00:00:00—23:59:59（也可省略秒）。</small> : null}
  </form>
}
