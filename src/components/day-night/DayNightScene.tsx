import { useMemo } from 'react'
import { Vector3 } from 'three'
import { calculateDayNightModel } from '../../domain/dayNight/dayNightModel'
import {
  EARTH_ORIENTATION_Z_RADIANS,
  latitudeLongitudeToVector3,
} from '../../lib/earthCoordinates'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { Atmosphere } from '../scene/Atmosphere'
import { CoordinateGrid } from '../scene/CoordinateGrid'
import { EarthAxis } from '../scene/EarthAxis'
import { EarthGlobe } from '../scene/EarthGlobe'
import { GeographicReferenceLines } from '../scene/GeographicReferenceLines'
import { DayNightSunlight } from './DayNightSunlight'
import { IlluminationHemispheres } from './IlluminationHemispheres'
import { LatitudeDayNightArcs } from './LatitudeDayNightArcs'
import { TerminatorLines } from './TerminatorLines'
import { SubsolarPointMarker } from './SubsolarPointMarker'
import { SolarNoonGuide } from './SolarNoonGuide'

export function DayNightScene() {
  const simulationTimeMs = useEarthLabStore((state) => state.simulationTimeMs)
  const observerLatitudeDegrees = useEarthLabStore((state) => state.observerLatitudeDegrees)
  const showCoordinateGrid = useEarthLabStore((state) => state.showCoordinateGrid)
  const isGuidedMode = useEarthLabStore((state) => state.isDayNightGuidedMode)
  const step = useEarthLabStore((state) => state.dayNightStep)
  const showSubsolarMarker = useEarthLabStore((state) => state.showSubsolarMarker)
  const showSolarNoonGuide = useEarthLabStore((state) => state.showSolarNoonGuide)
  const date = useMemo(() => new Date(simulationTimeMs), [simulationTimeMs])
  const model = useMemo(
    () => calculateDayNightModel(date, observerLatitudeDegrees),
    [date, observerLatitudeDegrees],
  )
  const sunDirection = useMemo(
    () =>
      latitudeLongitudeToVector3(
        model.subsolarPoint.latitudeDegrees,
        model.subsolarPoint.longitudeDegrees,
        1,
        new Vector3(),
      ).normalize(),
    [model.subsolarPoint.latitudeDegrees, model.subsolarPoint.longitudeDegrees],
  )
  const visibleStep = isGuidedMode ? step : 6

  return (
    <group rotation={[0, 0, EARTH_ORIENTATION_Z_RADIANS]}>
      <DayNightSunlight sunDirection={sunDirection} showRays={visibleStep >= 1} />
      <Atmosphere />
      <EarthAxis />
      <EarthGlobe />
      {visibleStep >= 2 ? <IlluminationHemispheres sunDirection={sunDirection} /> : null}
      {showCoordinateGrid ? <CoordinateGrid /> : null}
      <GeographicReferenceLines />
      {visibleStep >= 3 ? <TerminatorLines date={date} /> : null}
      {visibleStep >= 4 ? (
        <LatitudeDayNightArcs
          date={date}
          latitudeDegrees={observerLatitudeDegrees}
          showArcs={visibleStep >= 5}
        />
      ) : null}
      {showSubsolarMarker ? (
        <SubsolarPointMarker
          latitudeDegrees={model.subsolarPoint.latitudeDegrees}
          longitudeDegrees={model.subsolarPoint.longitudeDegrees}
        />
      ) : null}
      {showSolarNoonGuide ? (
        <SolarNoonGuide
          latitudeDegrees={observerLatitudeDegrees}
          longitudeDegrees={model.subsolarPoint.longitudeDegrees}
          sunDirection={sunDirection}
          altitudeDegrees={model.solarNoonAltitudeDegrees}
        />
      ) : null}
    </group>
  )
}
