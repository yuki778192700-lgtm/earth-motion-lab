import type { ReactNode } from 'react'

interface NightSideProps {
  children?: ReactNode
}

/** 夜侧视觉系统边界；不包含晨昏线或地理计算。 */
export function NightSide({ children }: NightSideProps) {
  return children ? <group name="NightSide">{children}</group> : null
}
