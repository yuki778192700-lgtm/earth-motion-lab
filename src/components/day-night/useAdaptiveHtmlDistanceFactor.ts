import { useThree } from '@react-three/fiber'

/** 正交相机下保持教材标签为固定屏幕字号；透视模式保留原距离缩放。 */
export function useAdaptiveHtmlDistanceFactor(
  perspectiveDistanceFactor: number,
): number | undefined {
  const isOrthographicCamera = useThree(
    (state) => state.camera.type === 'OrthographicCamera',
  )
  return isOrthographicCamera ? undefined : perspectiveDistanceFactor
}
