import { useMemo } from 'react'
import { calculateDayNightModel } from '../../domain/dayNight/dayNightModel'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { DayNightEarthSystem } from './DayNightEarthSystem'
import { IlluminationHemispheres } from './IlluminationHemispheres'
import { SolarReferenceFrame } from '../systems/solar/SolarReferenceFrame'
import { NightSide } from '../systems/earth/NightSide'

export function DayNightScene() {
  const simulationTimeMs = useEarthLabStore((state) => state.simulationTimeMs)
  const observerLatitudeDegrees = useEarthLabStore((state) => state.observerLatitudeDegrees)
  const observerLongitudeDegrees = useEarthLabStore((state) => state.observerLongitudeDegrees)
  const teachingLayers = useEarthLabStore((state) => state.teachingLayers)
  const showObserverMarker = useEarthLabStore((state) => state.showDayNightObserverMarker)
  const isGuidedMode = useEarthLabStore((state) => state.isDayNightGuidedMode)
  const step = useEarthLabStore((state) => state.dayNightStep)
  const showSolarNoonGuide = useEarthLabStore((state) => state.showSolarNoonGuide)
  const date = useMemo(() => new Date(simulationTimeMs), [simulationTimeMs])
  const model = useMemo(
    () => calculateDayNightModel(date, observerLatitudeDegrees),
    [date, observerLatitudeDegrees],
  )
  const visibleStep = isGuidedMode ? step : 6

  return (
    <>
      <SolarReferenceFrame
        showRays={teachingLayers.parallelSunRays && visibleStep >= 1}
        showDirectionIndicator={teachingLayers.solarDirection && visibleStep >= 1}
      />
      <DayNightEarthSystem
        date={date}
        model={model}
        observerLatitudeDegrees={observerLatitudeDegrees}
        observerLongitudeDegrees={observerLongitudeDegrees}
        visibleStep={visibleStep}
        showObserverMarker={showObserverMarker && visibleStep >= 4}
        showSolarNoonGuide={showSolarNoonGuide}
        teachingLayers={teachingLayers}
      />
      {visibleStep >= 2 ? (
        <NightSide>
          <IlluminationHemispheres />
        </NightSide>
      ) : null}
    </>
  )
}
