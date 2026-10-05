import type { Vector3 } from 'three'

/** 将多条独立路径展开为成对端点；路径之间绝不产生连接线。 */
export function pathsToLineSegments(paths: readonly (readonly Vector3[])[]): Vector3[] {
  const endpoints: Vector3[] = []
  for (const path of paths) {
    for (let index = 1; index < path.length; index += 1) {
      endpoints.push(path[index - 1]!, path[index]!)
    }
  }
  return endpoints
}
