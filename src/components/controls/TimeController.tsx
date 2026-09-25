import { useMemo } from 'react'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import type { SimulationSpeed } from '../../types/lab'
import { calculateSeasonalEvents } from '../../domain/orbit/earthOrbit'

const SPEED_OPTIONS: SimulationSpeed[] = [1, 10, 100, 1000]
const DAY_MILLISECONDS = 86_400_000

const simulationTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'UTC',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

function dateToDayOfYear(timeMs: number): number {
  const date = new Date(timeMs)
  const start = Date.UTC(date.getUTCFullYear(), 0, 1)
  return Math.floor((date.getTime() - start) / DAY_MILLISECONDS)
}

function getDaysInYear(year: number): number {
  return Math.round((Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / DAY_MILLISECONDS)
}

function dayOfYearToTimeMs(dayOfYear: number, currentTimeMs: number): number {
  const current = new Date(currentTimeMs)
  return Date.UTC(
    current.getUTCFullYear(),
    0,
    dayOfYear + 1,
    current.getUTCHours(),
    current.getUTCMinutes(),
    current.getUTCSeconds(),
    current.getUTCMilliseconds(),
  )
}

export function TimeController() {
  const activeModuleId = useEarthLabStore((state) => state.activeModuleId)
  const simulationTimeMs = useEarthLabStore((state) => state.simulationTimeMs)
  const isPlaying = useEarthLabStore((state) => state.isPlaying)
  const speed = useEarthLabStore((state) => state.speed)
  const setSimulationTime = useEarthLabStore((state) => state.setSimulationTime)
  const togglePlaying = useEarthLabStore((state) => state.togglePlaying)
  const setSpeed = useEarthLabStore((state) => state.setSpeed)
  const resetSimulation = useEarthLabStore((state) => state.resetSimulation)

  const currentDate = useMemo(() => new Date(simulationTimeMs), [simulationTimeMs])
  const currentYear = currentDate.getUTCFullYear()
  const daysInYear = getDaysInYear(currentYear)
  const currentDay = dateToDayOfYear(simulationTimeMs)
  const progress = (currentDay / (daysInYear - 1)) * 100
  const seasonalEvents = useMemo(
    () => calculateSeasonalEvents(currentYear),
    [currentYear],
  )

  return (
    <section className="time-controller" aria-label="时间控制器">
      <button
        type="button"
        className="play-button"
        onClick={togglePlaying}
        aria-label={isPlaying ? '暂停模拟' : '开始模拟'}
      >
        <span aria-hidden="true">{isPlaying ? 'Ⅱ' : '▶'}</span>
      </button>

      <div className="timeline-block">
        <div className="timeline-labels">
          <span>{currentYear} / 01 / 01</span>
          <strong>{simulationTimeFormatter.format(currentDate)} UTC</strong>
          <span>{currentYear} / 12 / 31</span>
        </div>
        {activeModuleId === 'revolution' ? (
          <div className="season-shortcuts" aria-label="四个关键日期快捷按钮">
            {seasonalEvents.map((event) => {
              const eventDate = new Date(event.timeMs)
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSimulationTime(event.timeMs)}
                  title={`${event.label}：${simulationTimeFormatter.format(eventDate)} UTC`}
                >
                  <strong>{event.label}</strong>
                  <span>{eventDate.getUTCMonth() + 1}/{eventDate.getUTCDate()}</span>
                </button>
              )
            })}
          </div>
        ) : null}
        <input
          aria-label="调整模拟日期"
          className="timeline-range"
          type="range"
          min="0"
          max={daysInYear - 1}
          value={currentDay}
          style={{ '--timeline-progress': `${progress}%` } as React.CSSProperties}
          onChange={(event) =>
            setSimulationTime(dayOfYearToTimeMs(Number(event.target.value), simulationTimeMs))
          }
        />
      </div>

      <div className="speed-control" aria-label="播放速度">
        {SPEED_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            data-active={speed === option}
            onClick={() => setSpeed(option)}
          >
            {option}×
          </button>
        ))}
      </div>

      <button type="button" className="reset-button" onClick={resetSimulation}>
        重置
      </button>
    </section>
  )
}
