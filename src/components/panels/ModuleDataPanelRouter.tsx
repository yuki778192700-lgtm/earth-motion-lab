import type { LabModuleRuntimeConfig } from '../../config/labModuleRegistry'
import { DayNightDataPanel } from '../day-night/DayNightDataPanel'
import { OrbitExperimentPanel } from './OrbitExperimentPanel'
import { PlannedModulePanel } from './PlannedModulePanel'
import { RotationExperimentPanel } from './RotationExperimentPanel'
import { ThermalZonePanel } from './ThermalZonePanel'
import { LocalTimePanel } from './LocalTimePanel'
import { DateLinePanel } from './DateLinePanel'
import { SubsolarAnnualPanel } from './SubsolarAnnualPanel'
import { SolarNoonAnnualPanel } from './SolarNoonAnnualPanel'
import { HemisphereSeasonsPanel } from './HemisphereSeasonsPanel'
import { PolarAnnualPanel } from './PolarAnnualPanel'
import { ObliquityPanel } from './ObliquityPanel'
import { DayLengthAnnualPanel } from './DayLengthAnnualPanel'
import { OrbitLessonPanel } from './OrbitLessonPanel'
import { OrbitAnnualTrendsPanel } from './OrbitAnnualTrendsPanel'

interface ModuleDataPanelRouterProps {
  config: LabModuleRuntimeConfig
}

export function ModuleDataPanelRouter({ config }: ModuleDataPanelRouterProps) {
  switch (config.panel) {
    case 'day-length-annual':
      return <DayLengthAnnualPanel />
    case 'obliquity':
      return <ObliquityPanel />
    case 'polar-annual':
      return <PolarAnnualPanel />
    case 'seasons':
      return <HemisphereSeasonsPanel />
    case 'noon-annual':
      return <SolarNoonAnnualPanel />
    case 'subsolar-annual':
      return <SubsolarAnnualPanel />
    case 'date-line':
      return <DateLinePanel />
    case 'local-time':
      return <LocalTimePanel />
    case 'thermal-zones':
      return <ThermalZonePanel />
    case 'rotation':
      return <RotationExperimentPanel />
    case 'orbit':
      return <><OrbitExperimentPanel />{config.id === 'revolution' ? <><OrbitLessonPanel /><OrbitAnnualTrendsPanel /></> : null}</>
    case 'day-night':
      return <DayNightDataPanel />
    case 'planned':
      return <PlannedModulePanel config={config} />
  }
}
