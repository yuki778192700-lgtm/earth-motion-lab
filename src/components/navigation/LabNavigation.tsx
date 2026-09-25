import { LAB_MODULE_GROUPS, LAB_MODULES } from '../../data/labModules'
import { useEarthLabStore } from '../../store/useEarthLabStore'

export function LabNavigation() {
  const activeModuleId = useEarthLabStore((state) => state.activeModuleId)
  const setActiveModule = useEarthLabStore((state) => state.setActiveModule)
  const learningMode = useEarthLabStore((state) => state.learningMode)

  return (
    <nav className="lab-navigation" aria-label="实验功能导航">
      <div className="navigation-heading">
        <span>实验目录</span>
        <small>13 个主题</small>
      </div>

      <div className="navigation-groups">
        {LAB_MODULE_GROUPS.map((group) => (
          <section className="navigation-group" key={group} aria-labelledby={`group-${group}`}>
            <h2 id={`group-${group}`}>{group}</h2>
            <div className="navigation-items">
              {LAB_MODULES.filter((module) => module.group === group).map((module) => {
                const isActive = module.id === activeModuleId

                return (
                  <button
                    className="navigation-item"
                    data-active={isActive}
                    key={module.id}
                    type="button"
                    disabled={learningMode !== 'explore'}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setActiveModule(module.id)}
                  >
                    <span className="module-index">{String(module.index).padStart(2, '0')}</span>
                    <span className="module-name">{module.name}</span>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </nav>
  )
}
