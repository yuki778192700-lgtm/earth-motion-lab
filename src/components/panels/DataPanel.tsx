import { getLabModule } from '../../data/labModules'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { MetricCard } from './MetricCard'
import { getLabModuleRuntimeConfig } from '../../config/labModuleRegistry'
import { ModuleDataPanelRouter } from './ModuleDataPanelRouter'

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'UTC',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const timeFormatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'UTC',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

export function DataPanel() {
  const activeModuleId = useEarthLabStore((state) => state.activeModuleId)
  const simulationTimeMs = useEarthLabStore((state) => state.simulationTimeMs)
  const isPlaying = useEarthLabStore((state) => state.isPlaying)
  const speed = useEarthLabStore((state) => state.speed)
  const annualPlaying = useEarthLabStore(state => state.isAnnualOrbitPlaying)
  const annualDuration = useEarthLabStore(state => state.annualOrbitDurationSeconds)
  const activeModule = getLabModule(activeModuleId)
  const moduleConfig = getLabModuleRuntimeConfig(activeModuleId)
  const date = new Date(simulationTimeMs)

  return (
    <aside
      className="data-panel"
      data-mode={moduleConfig.panel}
      aria-label="实验数据面板"
    >
      <div className="panel-heading">
        <span>
          <small>DATA PANEL</small>
          <strong>观测数据</strong>
        </span>
        <span className="panel-sequence">{String(activeModule.index).padStart(2, '0')}</span>
      </div>

      <section className="data-section" aria-labelledby="time-data-heading">
        <h2 id="time-data-heading">模拟时间</h2>
        <div className="metric-grid">
          <MetricCard label="日期（UTC）" value={dateFormatter.format(date)} accent="cyan" />
          <MetricCard label="时刻（UTC）" value={timeFormatter.format(date)} note="统一时间基准" />
        </div>
      </section>

      <section className="data-section" aria-labelledby="model-data-heading">
        <h2 id="model-data-heading">基础参数</h2>
        <div className="metric-grid metric-grid-two">
          <MetricCard label="地轴倾角" value="23°26′" accent="orange" />
          {activeModuleId === 'revolution' ? <MetricCard label="全年演示时长" value={annualDuration} unit="秒／年" note={`原自转倍率设置保留：${speed}×`} /> : <MetricCard label="播放速度" value={speed} unit="×" />}
        </div>
        <div className="status-row">
          <span>运行状态</span>
          <strong data-playing={isPlaying || annualPlaying}>{isPlaying || annualPlaying ? '运行中' : '已暂停'}</strong>
        </div>
      </section>

      <ModuleDataPanelRouter config={moduleConfig} />

      <section className="data-section note-section" aria-labelledby="stage-note-heading">
        <h2 id="stage-note-heading">模型说明</h2>
        <p>{moduleConfig.modelNote}</p>
      </section>
    </aside>
  )
}
