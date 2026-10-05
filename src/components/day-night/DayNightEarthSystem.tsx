import { useMemo } from 'react'
import { Vector3 } from 'three'
import type { DayNightModel } from '../../domain/dayNight/dayNightModel'
import {
  calculateDayNightEarthPose,
  calculateObserverLightingState,
  DAY_NIGHT_EARTH_CENTER,
} from '../../domain/dayNight/solarReferenceFrame'
import { latitudeLongitudeToVector3 } from '../../lib/earthCoordinates'
import { CoordinateGrid } from '../scene/CoordinateGrid'
import { EarthAxis } from '../scene/EarthAxis'
import { GeographicReferenceLines } from '../scene/GeographicReferenceLines'
import { LatitudeDayNightArcs } from './LatitudeDayNightArcs'
import { ObserverMarker } from './ObserverMarker'
import { SolarNoonGuide } from './SolarNoonGuide'
import { SubsolarPointMarker } from './SubsolarPointMarker'
import { TerminatorLines } from './TerminatorLines'
import { EarthSystem } from '../systems/earth/EarthSystem'
import { TeachingOverlaySystem } from '../systems/teaching/TeachingOverlaySystem'
import type { TeachingLayers } from '../../config/teachingLayers'
import { SubsolarLatitudeRange } from './SubsolarLatitudeRange'
import { useEarthLabStore } from '../../store/useEarthLabStore'

interface DayNightEarthSystemProps {
  date: Date
  model: DayNightModel
  observerLatitudeDegrees: number
  observerLongitudeDegrees: number
  visibleStep: number
  showObserverMarker: boolean
  showSolarNoonGuide: boolean
  teachingLayers: TeachingLayers
}

/** 地轴姿态与地表自转层；不包含任何太阳光对象。 */
export function DayNightEarthSystem({
  date,
  model,
  observerLatitudeDegrees,
  observerLongitudeDegrees,
  visibleStep,
  showObserverMarker,
  showSolarNoonGuide,
  teachingLayers,
}: DayNightEarthSystemProps) {
  const activeModuleId = useEarthLabStore(state => state.activeModuleId)
  const pose = useMemo(() => calculateDayNightEarthPose(date), [date])
  const earthCenter = useMemo(
    () =>
      new Vector3(
        DAY_NIGHT_EARTH_CENTER.x,
        DAY_NIGHT_EARTH_CENTER.y,
        DAY_NIGHT_EARTH_CENTER.z,
      ),
    [],
  )
  const observerLightingState = useMemo(
    () =>
      calculateObserverLightingState(
        date,
        observerLatitudeDegrees,
        observerLongitudeDegrees,
      ),
    [date, observerLatitudeDegrees, observerLongitudeDegrees],
  )
  const localSunDirection = useMemo(
    () =>
      latitudeLongitudeToVector3(
        model.subsolarPoint.latitudeDegrees,
        model.subsolarPoint.longitudeDegrees,
        1,
      ).normalize(),
    [model.subsolarPoint.latitudeDegrees, model.subsolarPoint.longitudeDegrees],
  )

  return (
    <>
      <group
        name="DayNightEarthReferenceFrame"
        position={earthCenter}
        quaternion={pose.orientationQuaternion}
      >
        <EarthSystem surfaceRotationRadians={pose.surfaceRotationRadians} />
      </group>
      <TeachingOverlaySystem
        worldFixed={teachingLayers.terminator && visibleStep >= 3 ? <TerminatorLines date={date} /> : null}
        earthFramePosition={earthCenter}
        earthFrameQuaternion={pose.orientationQuaternion}
        surfaceRotationRadians={pose.surfaceRotationRadians}
        earthFixed={teachingLayers.earthAxis ? <EarthAxis /> : null}
        surfaceBound={
          <>
            {activeModuleId === 'subsolar-point' && teachingLayers.subsolarPoint ? <SubsolarLatitudeRange year={date.getUTCFullYear()} latitudeDegrees={model.subsolarPoint.latitudeDegrees} /> : null}
            {teachingLayers.coordinateGrid ? <CoordinateGrid /> : null}
            <GeographicReferenceLines
              showEquator={teachingLayers.equator}
              showTropics={teachingLayers.tropics}
              showPolarCircles={teachingLayers.polarCircles}
            />
            {visibleStep >= 4 ? (
              <LatitudeDayNightArcs
                date={date}
                latitudeDegrees={observerLatitudeDegrees}
                showDayArc={teachingLayers.dayArc && visibleStep >= 5}
                showNightArc={teachingLayers.nightArc && visibleStep >= 5}
              />
            ) : null}
            {showObserverMarker && activeModuleId !== 'solar-altitude' ? (
              <ObserverMarker
                latitudeDegrees={observerLatitudeDegrees}
                longitudeDegrees={observerLongitudeDegrees}
                lightingState={observerLightingState}
              />
            ) : null}
            {teachingLayers.subsolarPoint ? (
              <SubsolarPointMarker
                latitudeDegrees={model.subsolarPoint.latitudeDegrees}
                longitudeDegrees={model.subsolarPoint.longitudeDegrees}
              />
            ) : null}
            {showSolarNoonGuide && teachingLayers.angleIndicators ? (
              <SolarNoonGuide
                latitudeDegrees={observerLatitudeDegrees}
                longitudeDegrees={model.subsolarPoint.longitudeDegrees}
                sunDirection={localSunDirection}
                altitudeDegrees={model.solarNoonAltitudeDegrees}
              />
            ) : null}
          </>
        }
      />
    </>
  )
}
