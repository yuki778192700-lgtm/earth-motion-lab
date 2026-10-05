import { describe, expect, it } from 'vitest'
import { LAB_MODULES } from '../data/labModules'
import {
  getLabModuleRuntimeConfig,
  LAB_MODULE_REGISTRY,
} from './labModuleRegistry'
import { TEACHING_LAYER_OPTIONS } from './teachingLayers'

describe('13 个教学模块运行时路由', () => {
  it('每个菜单模块都有唯一且同名的运行时配置', () => {
    const moduleIds = LAB_MODULES.map((module) => module.id)
    const registryIds = Object.keys(LAB_MODULE_REGISTRY)

    expect(moduleIds).toHaveLength(13)
    expect(new Set(moduleIds).size).toBe(13)
    expect(registryIds.sort()).toEqual([...moduleIds].sort())
    for (const moduleId of moduleIds) {
      expect(getLabModuleRuntimeConfig(moduleId).id).toBe(moduleId)
    }
  })

  it('每个模块都明确配置场景、面板、镜头、图层和控制器', () => {
    const layerIds = TEACHING_LAYER_OPTIONS.map((option) => option.id).sort()

    for (const config of Object.values(LAB_MODULE_REGISTRY)) {
      expect(config.scene).toBeTruthy()
      expect(config.panel).toBeTruthy()
      expect(config.defaultCamera).toBeTruthy()
      expect(Object.keys(config.defaultLayers).sort()).toEqual(layerIds)
      expect(config.controls.length).toBeGreaterThan(0)
      expect(new Set(config.controls).size).toBe(config.controls.length)
    }
  })

  it('已有专题复用正确科学场景', () => {
    expect(LAB_MODULE_REGISTRY.obliquity.scene).toBe('orbit')
    expect(LAB_MODULE_REGISTRY.seasons.scene).toBe('orbit')
    expect(LAB_MODULE_REGISTRY['subsolar-point'].scene).toBe('day-night')
    expect(LAB_MODULE_REGISTRY['day-length'].scene).toBe('day-night')
    expect(LAB_MODULE_REGISTRY['solar-altitude'].scene).toBe('day-night')
    expect(LAB_MODULE_REGISTRY['polar-day-night'].scene).toBe('day-night')
  })

  it('理论日期界线接入地球场景，明确保留现实边界限制', () => {
    const config = LAB_MODULE_REGISTRY['date-line']
    expect(config.availability).toBe('shared')
    expect(config.scene).toBe('earth')
    expect(config.panel).toBe('date-line')
    expect(config.modelNote).toContain('不表示现实')
  })
})
