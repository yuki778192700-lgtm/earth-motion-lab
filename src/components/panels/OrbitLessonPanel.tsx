import { useMemo } from 'react'
import { createOrbitLesson } from '../../domain/orbit/orbitLesson'
import { calculateHemisphereSeasons } from '../../domain/solar/hemisphereSeasons'
import { useEarthLabStore } from '../../store/useEarthLabStore'

export function OrbitLessonPanel() {
  const timeMs = useEarthLabStore(state => state.simulationTimeMs)
  const index = useEarthLabStore(state => state.orbitLessonStepIndex)
  const target = useEarthLabStore(state => state.orbitLessonTargetStepIndex)
  const playing = useEarthLabStore(state => state.isAnnualOrbitPlaying)
  const duration = useEarthLabStore(state => state.annualOrbitDurationSeconds)
  const selectStep = useEarthLabStore(state => state.selectOrbitLessonStep)
  const togglePlayback = useEarthLabStore(state => state.toggleOrbitLessonPlayback)
  const year = new Date(timeMs).getUTCFullYear()
  const steps = useMemo(() => createOrbitLesson(year), [year])
  const current = useMemo(() => calculateHemisphereSeasons(timeMs, 30), [timeMs])
  const step = index === null ? null : steps[index]!
  return <section className="data-section orbit-lesson-panel" aria-label="全年公转分段讲解">
    <h2>全年公转 · 分段讲解</h2>
    <div className="orbit-lesson-steps">{steps.map(item => <button type="button" key={item.id} aria-pressed={index === item.index} onClick={() => selectStep(item.index)}>Step {item.index + 1} · {item.title}</button>)}</div>
    <p>{step ? `讲解卡：${step.title}（北半球称谓）。${step.explanation}` : '选择节气进入讲解，或点击“开始分段播放”从春分开始。'}</p>
    {target !== null ? <p>{playing ? '正在前往' : '已暂停，下一目标为'}{steps[target]!.title}；下方是移动过程中的当前读数。</p> : null}
    <div className="orbit-lesson-actions">
      <button type="button" disabled={index === null || index === 0} onClick={() => selectStep(index! - 1)}>上一步</button>
      <button type="button" disabled={index === 3} onClick={() => selectStep(index === null ? 0 : index + 1)}>下一步</button>
      <button type="button" disabled={index === 3 && target === null} onClick={togglePlayback}>{playing && target !== null ? '暂停分段讲解' : index === null ? '开始分段播放' : target !== null ? '继续分段播放' : '播放到下一步'}</button>
      <button type="button" onClick={() => selectStep(0)}>重置讲解</button>
    </div>
    <table className="orbit-lesson-table"><caption>当前日期 · 同纬度绝对值昼长对照</caption><thead><tr><th scope="col">纬度</th><th scope="col">几何昼长</th><th scope="col">天文季节</th></tr></thead><tbody><tr><th scope="row">30°N</th><td>{current.north.dayHours.toFixed(3)}小时</td><td>{current.north.season}</td></tr><tr><th scope="row">30°S</th><td>{current.south.dayHours.toFixed(3)}小时</td><td>{current.south.season}</td></tr></tbody></table>
    <p>当前直射纬度：{Math.abs(current.declinationDegrees).toFixed(3)}°{current.declinationDegrees >= 0 ? 'N' : 'S'}。对照纬度固定为30°N／30°S，不改变其他模块的观察纬度。</p>
    <p>观察地轴：公转位置不断改变，地轴始终保持空间平行。四季与昼长变化源于倾斜地轴和公转的共同作用，不是日地距离远近。</p>
    <p>分段速度沿用全年{duration}秒设置，到下一节气自动暂停；冬至为最后一步。“重置讲解”回到本年春分，不重置其他设置。分点读数近似12小时，保留天文模型残差；不含大气折射。</p>
  </section>
}
