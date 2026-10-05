import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

/** 仅开发环境记录上一帧统计，供浏览器检查；不增加场景对象或产品界面。 */
export function ScenePerformanceProbe() {
  const elapsed = useRef(0)
  useFrame(({ gl, scene }, delta) => {
    elapsed.current += delta
    if (elapsed.current < 1) return
    elapsed.current = 0
    let objects = 0
    scene.traverse(() => { objects += 1 })
    gl.domElement.dataset.scenePerformance = JSON.stringify({
      calls: gl.info.render.calls,
      objects,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
    })
  })
  return null
}
