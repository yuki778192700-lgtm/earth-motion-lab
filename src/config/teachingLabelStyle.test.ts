import { describe, expect, it } from 'vitest'
import { Mesh, MeshBasicMaterial, Raycaster, Scene, SphereGeometry, Vector3 } from 'three'
import { EARTH_LABEL_OCCLUDER_NAME, teachingLabelStyle } from './teachingLabelStyle'

describe('教学标签显示约定', () => {
  it('使用固定屏幕字号，观察点与直射点向相反方向避让', () => {
    expect(teachingLabelStyle.fontSize).toBe(12)
    expect(teachingLabelStyle.offsets.observer[1]).toBeLessThan(0)
    expect(teachingLabelStyle.offsets.subsolar[1]).toBeGreaterThan(0)
    expect(teachingLabelStyle.offsets.dawn[0]).toBeLessThan(0)
    expect(teachingLabelStyle.offsets.dusk[0]).toBeGreaterThan(0)
  })

  it('遮挡对象只取命名的实体地表，不包括大气、云层和其他几何', () => {
    const scene = new Scene()
    const surface = new Mesh(new SphereGeometry(1), new MeshBasicMaterial())
    surface.name = EARTH_LABEL_OCCLUDER_NAME
    const atmosphere = new Mesh(new SphereGeometry(1.1), new MeshBasicMaterial())
    atmosphere.name = 'AtmosphereLayer'
    scene.add(surface, atmosphere)
    expect(scene.getObjectByName(EARTH_LABEL_OCCLUDER_NAME)).toBe(surface)
    expect(scene.getObjectByName(EARTH_LABEL_OCCLUDER_NAME)).not.toBe(atmosphere)
    surface.geometry.dispose()
    atmosphere.geometry.dispose()
    surface.material.dispose()
    atmosphere.material.dispose()
  })

  it('地表射线交点会遮挡背面锚点，但不会遮挡前方锚点', () => {
    const surface = new Mesh(new SphereGeometry(1, 32, 24), new MeshBasicMaterial())
    surface.updateMatrixWorld(true)
    const cameraPosition = new Vector3(0, 0, 5)
    const ray = new Raycaster(cameraPosition, new Vector3(0, 0, -1))
    const intersection = ray.intersectObject(surface)[0]
    expect(intersection).toBeDefined()
    const frontAnchor = new Vector3(0, 0, 1.04)
    const backAnchor = new Vector3(0, 0, -1.04)
    expect(intersection!.distance).toBeGreaterThan(cameraPosition.distanceTo(frontAnchor))
    expect(intersection!.distance).toBeLessThan(cameraPosition.distanceTo(backAnchor))
    surface.geometry.dispose()
    surface.material.dispose()
  })
})
