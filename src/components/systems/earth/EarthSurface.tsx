import { EarthGlobe } from '../../scene/EarthGlobe'

/** 地球实体表面。教学线层不在此组件中渲染。 */
export function EarthSurface() {
  return (
    <group name="EarthSurface">
      <EarthGlobe />
    </group>
  )
}
