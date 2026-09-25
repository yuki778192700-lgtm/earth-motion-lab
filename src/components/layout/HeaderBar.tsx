import { getLabModule } from '../../data/labModules'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { LearningModeSwitcher } from '../education/LearningModeSwitcher'

export function HeaderBar() {
  const activeModuleId = useEarthLabStore((state) => state.activeModuleId)
  const learningMode = useEarthLabStore((state) => state.learningMode)
  const activeModule = getLabModule(activeModuleId)

  return (
    <header className="header-bar">
      <div className="brand-lockup" aria-label="Earth Motion Lab 地球运动实验室">
        <span className="brand-mark" aria-hidden="true">
          <span className="brand-orbit" />
          <span className="brand-planet" />
        </span>
        <span>
          <strong>Earth Motion Lab</strong>
          <small>地球运动实验室</small>
        </span>
      </div>

      <div className="header-center">
        <div className="current-lab" aria-live="polite">
          <span>当前实验</span>
          <strong>{activeModule.name}</strong>
        </div>
        <LearningModeSwitcher />
      </div>

      <div className="model-status" title="科学模型由 geographyEngine 驱动">
        <span className="status-indicator" aria-hidden="true" />
        <span>{learningMode === 'explore' ? '自由探索' : learningMode === 'teach' ? '教师演示' : '练习模式'}</span>
        <small>geographyEngine</small>
      </div>
    </header>
  )
}
