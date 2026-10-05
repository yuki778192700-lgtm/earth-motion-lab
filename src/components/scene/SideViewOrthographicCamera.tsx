import { OrthographicCamera } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import {
  calculateSideViewCameraZ,
  SIDE_VIEW_HORIZONTAL_SPAN,
  SIDE_VIEW_TARGET_X,
} from '../systems/camera/cameraPresets'

/**
 * 仅供“侧视平行光”教学模式使用。
 * 水平世界轴 +X 与屏幕水平轴完全重合，因此平行光不会产生透视汇聚。
 */
export function SideViewOrthographicCamera() {
  const size = useThree((state) => state.size)
  const aspect = size.width / Math.max(size.height, 1)
  const verticalSpan = SIDE_VIEW_HORIZONTAL_SPAN / Math.max(aspect, 0.1)
  const cameraZ = calculateSideViewCameraZ(aspect)

  return (
    <OrthographicCamera
      makeDefault
      manual
      name="SideViewOrthographicCamera"
      position={[SIDE_VIEW_TARGET_X, 0, cameraZ]}
      rotation={[0, 0, 0]}
      left={-SIDE_VIEW_HORIZONTAL_SPAN / 2}
      right={SIDE_VIEW_HORIZONTAL_SPAN / 2}
      top={verticalSpan / 2}
      bottom={-verticalSpan / 2}
      near={0.1}
      far={100}
    />
  )
}
