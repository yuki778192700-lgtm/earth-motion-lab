import { describe, expect, it } from 'vitest'
import { createLatitudePath, createLongitudePath, EARTH_RADIUS } from './earthCoordinates'
import { pathsToLineSegments } from './lineSegments'

describe('合并经纬网的几何一致性', () => {
  it('保留每条路径全部线段，不连接不同经纬线', () => {
    const paths = [createLatitudePath(30, EARTH_RADIUS, 8), createLongitudePath(120, EARTH_RADIUS, 8)]
    const points = pathsToLineSegments(paths)
    expect(points).toHaveLength(32)
    paths.forEach((path, pathIndex) => {
      for (let index = 0; index < 8; index += 1) {
        const offset = pathIndex * 16 + index * 2
        expect(points[offset]).toBe(path[index])
        expect(points[offset + 1]).toBe(path[index + 1])
      }
    })
  })

  it('空路径和单点路径不会生成伪线段', () => {
    expect(pathsToLineSegments([[], [createLatitudePath(0)[0]!]])).toEqual([])
  })
})
