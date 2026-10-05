import { describe, expect, it, vi } from 'vitest'
import { createLabelDiagnosticsRecorder, isLabelLifecycleError } from './labelLifecycleDiagnostics'

describe('开发环境标签诊断', () => {
  it('只识别目标错误，不把其他渲染/网络问题混入', () => {
    expect(isLabelLifecycleError('Attempted to synchronously unmount a root while React was already rendering.')).toBe(true)
    expect(isLabelLifecycleError("NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.")).toBe(true)
    expect(isLabelLifecycleError('texture load failed')).toBe(false)
    expect(isLabelLifecycleError('removeChild succeeded')).toBe(false)
  })
  it('记录当时模块、标签实例和确定时间，不修改模块来源', () => {
    let moduleId = 'revolution'
    const emit = vi.fn()
    const recorder = createLabelDiagnosticsRecorder(() => moduleId, emit, () => Date.UTC(2026, 9, 3))
    recorder.record('label-added', { labelId: 1, text: '春分' })
    moduleId = 'rotation'
    recorder.record('label-removed', { labelId: 1, text: '春分' })
    expect(recorder.recent().map(entry => entry.moduleId)).toEqual(['revolution', 'rotation'])
    expect(recorder.recent()[0]!.timestamp).toBe('2026-10-03T00:00:00.000Z')
    expect(emit).toHaveBeenCalledTimes(2)
    expect(moduleId).toBe('rotation')
  })
  it('记录有界，最近记录有序且调用方不能修改内部记录', () => {
    const recorder = createLabelDiagnosticsRecorder(() => 'revolution', () => {})
    for (let i = 0; i < 150; i++) recorder.record('label-added', { labelId: i })
    expect(recorder.size()).toBe(100)
    const recent = recorder.recent()
    expect(recent).toHaveLength(30)
    expect(recent[0]!.sequence).toBe(121)
    recent[0]!.details.labelId = -1
    expect(recorder.recent()[0]!.details.labelId).toBe(120)
  })
  it('错误可附带调用栈与发生前标签快照', () => {
    const recorder = createLabelDiagnosticsRecorder(() => 'revolution', () => {})
    recorder.record('label-removed', { labelId: 3 })
    const before = recorder.recent()
    recorder.record('root-error', { message: 'test', stack: 'Html cleanup -> root.unmount', recentLabels: before })
    expect(recorder.recent()[1]!.details.stack).toContain('root.unmount')
    expect(before).toHaveLength(1)
  })
})
