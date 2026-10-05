import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import { calculateWorldTerminatorGeometry } from '../../domain/dayNight/solarReferenceFrame'
import { TeachingLabel } from '../scene/TeachingLabel'
import { teachingOverlayStyle } from '../../config/teachingOverlayStyle'
import { useSolarSideTeachingView } from '../../hooks/useSolarSideTeachingView'

interface TerminatorLinesProps {
  date: Date
}

export function TerminatorLines({ date }: TerminatorLinesProps) {
  const isSideView = useSolarSideTeachingView()
  const geometry = useMemo(() => calculateWorldTerminatorGeometry(date), [date])
  const dawnPoints = geometry.dawn
  const duskPoints = geometry.dusk
  const dawnLabel = dawnPoints[Math.floor(dawnPoints.length / 2)]
  const duskLabel = duskPoints[Math.floor(duskPoints.length / 2)]

  return (
    <group name="WorldSpaceTerminator" renderOrder={teachingOverlayStyle.renderOrder.terminator}>
      {dawnPoints.length > 1 ? (
        <Line points={dawnPoints} {...teachingOverlayStyle.lines.terminatorDawn} />
      ) : null}
      {duskPoints.length > 1 ? (
        <Line points={duskPoints} {...teachingOverlayStyle.lines.terminatorDusk} />
      ) : null}
      {dawnLabel ? (
        <TeachingLabel position={dawnLabel} role="dawn" hidden={isSideView}>
          <span className="terminator-label dawn">晨线</span>
        </TeachingLabel>
      ) : null}
      {duskLabel ? (
        <TeachingLabel position={duskLabel} role="dusk" hidden={isSideView}>
          <span className="terminator-label dusk">昏线</span>
        </TeachingLabel>
      ) : null}
    </group>
  )
}
