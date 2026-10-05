import type { LabModuleRuntimeConfig } from '../../config/labModuleRegistry'
import { DayNightScene } from '../day-night/DayNightScene'
import { EarthModel } from './EarthModel'
import { OrbitSystem } from './OrbitSystem'
import { PlannedModuleScene } from './PlannedModuleScene'

interface ModuleSceneRouterProps {
  config: LabModuleRuntimeConfig
}

export function ModuleSceneRouter({ config }: ModuleSceneRouterProps) {
  switch (config.scene) {
    case 'earth':
      return <EarthModel />
    case 'orbit':
      return <OrbitSystem />
    case 'day-night':
      return <DayNightScene />
    case 'planned':
      return <PlannedModuleScene config={config} />
  }
}
