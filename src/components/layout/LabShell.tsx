import { TimeController } from '../controls/TimeController'
import { LabNavigation } from '../navigation/LabNavigation'
import { DataPanel } from '../panels/DataPanel'
import { EarthCanvas } from '../scene/EarthCanvas'
import { HeaderBar } from './HeaderBar'
import { useSimulationClock } from '../../hooks/useSimulationClock'
import { useTeacherPlayback } from '../../hooks/useTeacherPlayback'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { EducationControls } from '../education/EducationControls'
import { PracticePanel } from '../education/PracticePanel'
import { TeacherPanel } from '../education/TeacherPanel'

export function LabShell() {
  useSimulationClock()
  useTeacherPlayback()
  const learningMode = useEarthLabStore((state) => state.learningMode)
  const activeModuleId = useEarthLabStore(state => state.activeModuleId)

  return (
    <div className="lab-shell" data-annual-orbit={learningMode === 'explore' && activeModuleId === 'revolution'}>
      <HeaderBar />
      <LabNavigation />
      <main className="scene-region" aria-label="三维地球实验区">
        <EarthCanvas />
      </main>
      {learningMode === 'explore' ? (
        <DataPanel />
      ) : learningMode === 'teach' ? (
        <TeacherPanel />
      ) : (
        <PracticePanel />
      )}
      {learningMode === 'explore' ? <TimeController /> : <EducationControls />}
    </div>
  )
}
