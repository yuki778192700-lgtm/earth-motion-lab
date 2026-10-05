import { afterEach, describe, expect, it } from 'vitest'
import {
  createDefaultTeachingLayers,
  DEFAULT_TEACHING_LAYERS,
  TEACHING_LAYER_OPTIONS,
} from './teachingLayers'
import { useEarthLabStore } from '../store/useEarthLabStore'

afterEach(() => {
  useEarthLabStore.setState({ teachingLayers: createDefaultTeachingLayers() })
})

describe('Teaching Layers 统一状态', () => {
  it('十二个教学图层都有唯一配置项和明确默认值', () => {
    const optionIds = TEACHING_LAYER_OPTIONS.map((option) => option.id)
    const stateIds = Object.keys(DEFAULT_TEACHING_LAYERS)

    expect(optionIds).toHaveLength(12)
    expect(new Set(optionIds).size).toBe(12)
    expect([...optionIds].sort()).toEqual([...stateIds].sort())
    expect(DEFAULT_TEACHING_LAYERS.subsolarPoint).toBe(false)
    expect(DEFAULT_TEACHING_LAYERS.terminator).toBe(true)
  })

  it('切换一个图层不会改变其他图层', () => {
    const before = { ...useEarthLabStore.getState().teachingLayers }
    useEarthLabStore.getState().toggleTeachingLayer('terminator')
    const after = useEarthLabStore.getState().teachingLayers

    expect(after.terminator).toBe(!before.terminator)
    expect({ ...after, terminator: before.terminator }).toEqual(before)
  })

  it('教师与练习场景动作通过统一图层状态控制太阳直射点', () => {
    useEarthLabStore.getState().applySceneAction({ showSubsolarMarker: true })
    expect(useEarthLabStore.getState().teachingLayers.subsolarPoint).toBe(true)

    useEarthLabStore.getState().applySceneAction({ showSubsolarMarker: false })
    expect(useEarthLabStore.getState().teachingLayers.subsolarPoint).toBe(false)
  })
})
