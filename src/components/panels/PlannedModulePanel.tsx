import type { LabModuleRuntimeConfig } from '../../config/labModuleRegistry'
import { getLabModule } from '../../data/labModules'

interface PlannedModulePanelProps {
  config: LabModuleRuntimeConfig
}

export function PlannedModulePanel({ config }: PlannedModulePanelProps) {
  const module = getLabModule(config.id)

  return (
    <section className="data-section planned-module-panel" aria-labelledby="planned-module-heading">
      <span className="module-status-badge">规划中</span>
      <h2 id="planned-module-heading">{module.name}实验</h2>
      <p>{config.plannedSummary}</p>
      <p className="planned-module-safety">当前场景只提供地球与地理边界参考，不显示未经实现或未经验证的专题结果。</p>
    </section>
  )
}
