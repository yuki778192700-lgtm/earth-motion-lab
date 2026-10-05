import { SolarReferenceFrame as FixedWorldSolarReferenceFrame } from '../../day-night/DayNightSunlight'

interface SolarReferenceFrameProps {
  showRays: boolean
  showDirectionIndicator: boolean
}

/** 固定世界坐标太阳系统入口；不继承地球或相机变换。 */
export function SolarReferenceFrame({
  showRays,
  showDirectionIndicator,
}: SolarReferenceFrameProps) {
  return (
    <FixedWorldSolarReferenceFrame
      showRays={showRays}
      showDirectionIndicator={showDirectionIndicator}
    />
  )
}
