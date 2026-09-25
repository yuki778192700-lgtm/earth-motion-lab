import { getLabModule } from '../../data/labModules'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { MetricCard } from './MetricCard'
import { RotationExperimentPanel } from './RotationExperimentPanel'
import { OrbitExperimentPanel } from './OrbitExperimentPanel'
import { DayNightDataPanel } from '../day-night/DayNightDataPanel'

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
  const activeModule = getLabModule(activeModuleId)
  const date = new Date(simulationTimeMs)

  return (
    <aside
      className="data-panel"
      data-mode={activeModuleId === 'day-night' || activeModuleId === 'terminator' ? 'day-night' : activeModuleId}
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
          <MetricCard label="播放倍率" value={speed} unit="×" />
        </div>
        <div className="status-row">
          <span>运行状态</span>
          <strong data-playing={isPlaying}>{isPlaying ? '运行中' : '已暂停'}</strong>
        </div>
      </section>

      {activeModuleId === 'rotation' ? <RotationExperimentPanel /> : null}
      {activeModuleId === 'revolution' ? <OrbitExperimentPanel /> : null}
      {activeModuleId === 'day-night' || activeModuleId === 'terminator' ? (
        <DayNightDataPanel />
      ) : null}

      <section className="data-section note-section" aria-labelledby="stage-note-heading">
        <h2 id="stage-note-heading">模型说明</h2>
        {activeModuleId === 'rotation' ? (
          <p>采用 24 小时平均太阳日。太阳大小与日地距离为非等比例教学示意。</p>
        ) : activeModuleId === 'revolution' ? (
          <p>采用开普勒椭圆轨道和太阳视黄经近似模型。轨道离心率按真实值计算，天体大小与距离非等比例。</p>
        ) : activeModuleId === 'day-night' || activeModuleId === 'terminator' ? (
          <p>昼长和升落时刻采用太阳中心与几何地平线模型，不包含大气折射、太阳视半径和地形影响。</p>
        ) : activeModuleId === 'local-time' ? (
          <p>当前仅完成地方平均太阳时计算；法定时区、区时与夏令时尚未实现，不能用地方时结果代替区时。</p>
        ) : activeModuleId === 'date-line' ? (
          <p>当前仅校验 ±180° 的日期偏移边界；现实国际日期变更线的折线走向和跨线日期规则尚未实现。</p>
        ) : (
          <p>太阳赤纬、昼长等专题计算将在对应实验模块中接入。</p>
        )}
      </section>
    </aside>
  )
}
