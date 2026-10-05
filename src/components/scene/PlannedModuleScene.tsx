import { Html } from '@react-three/drei'
import type { LabModuleRuntimeConfig } from '../../config/labModuleRegistry'
import { getLabModule } from '../../data/labModules'
import { EarthModel } from './EarthModel'

interface PlannedModuleSceneProps {
  config: LabModuleRuntimeConfig
}

export function PlannedModuleScene({ config }: PlannedModuleSceneProps) {
  const module = getLabModule(config.id)

  return (
    <>
      <EarthModel />
      <Html fullscreen zIndexRange={[20, 0]}>
        <section className="planned-scene-notice" aria-label={`${module.name}模块建设状态`}>
          <small>MODULE PLANNED</small>
          <strong>{module.name}</strong>
          <span>{config.plannedSummary}</span>
        </section>
      </Html>
    </>
  )
}
