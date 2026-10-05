import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, type ComponentProps, type ReactNode } from 'react'
import { Object3D } from 'three'
import { EARTH_LABEL_OCCLUDER_NAME, teachingLabelStyle, type TeachingLabelRole } from '../../config/teachingLabelStyle'

interface TeachingLabelProps {
  position: ComponentProps<typeof Html>['position']
  role: TeachingLabelRole
  hidden?: boolean
  children: ReactNode
}

/** 仅检测实体地表。云层、大气、地点标记和教学线均不参与标签遮挡。 */
export function TeachingLabel({ position, role, hidden = false, children }: TeachingLabelProps) {
  const scene = useThree(state => state.scene)
  // 空对象是异步纹理加载/切换场景期间的安全占位，不会产生射线交点。
  const emptyOccluder = useMemo(() => new Object3D(), [])
  const surfaceRef = useRef<Object3D>(emptyOccluder)
  const occluders = useMemo(() => [surfaceRef], [])
  useFrame(() => {
    // 缓存地表引用；仅在场景替换或首次加载时重新查找。
    if (!surfaceRef.current.parent) {
      surfaceRef.current = scene.getObjectByName(EARTH_LABEL_OCCLUDER_NAME) ?? emptyOccluder
    }
  }, -1)
  const [x, y] = teachingLabelStyle.offsets[role]

  return (
    <Html
      position={position}
      center
      occlude={occluders}
      zIndexRange={[...teachingLabelStyle.zIndexRange]}
      pointerEvents="none"
      style={{ display: hidden ? 'none' : undefined, fontSize: teachingLabelStyle.fontSize, lineHeight: teachingLabelStyle.lineHeight }}
    >
      <div className="teaching-label-content" data-label-role={role} style={{ transform: `translate(${x}px, ${y}px)` }}>
        {children}
      </div>
    </Html>
  )
}
