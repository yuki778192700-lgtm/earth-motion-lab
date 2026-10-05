import { calculateDateLineCrossing, classifyThermalZone, compareLocalMeanTimes, compareMeanAndFixedTime, formatUtcOffset } from '../lib/geography'
import { POLAR_CIRCLE_LATITUDE_DEGREES } from '../lib/earthCoordinates'
import { getLabModuleRuntimeConfig } from '../config/labModuleRegistry'
import type { GeographyQuestion, PracticeSnapshot, SceneAction, TeachingStep } from '../types/education'

const calendar = new Intl.DateTimeFormat('zh-CN', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
function choices(correct: string, distractors: string[]) {
  return [...new Set([correct, ...distractors])].slice(0, 4).map((label, index) => ({ id: index === 0 ? 'correct' : `distractor-${index}`, label }))
}
function step(base: SceneAction, title: string, explanation: string, changes: SceneAction = {}): TeachingStep {
  return { title, explanation, durationMs: 6000, action: { ...base, ...changes, overlayMessage: explanation } }
}

/** 只组合现有引擎结果，所有步骤保存完整题设，可逆导航不依赖上一步。 */
export function generateTimeAndZonesQuestion(snapshot: PracticeSnapshot, sequence: number): GeographyQuestion | null {
  const moduleId = snapshot.activeModuleId
  if (moduleId !== 'climate-zones' && moduleId !== 'local-time' && moduleId !== 'date-line') return null
  const base: SceneAction = {
    moduleId, simulationTimeMs: snapshot.simulationTimeMs, latitudeDegrees: snapshot.latitudeDegrees,
    cameraPreset: moduleId === 'climate-zones' ? 'equator' : 'north-pole',
    teachingLayers: { ...getLabModuleRuntimeConfig(moduleId).defaultLayers },
    localTimeLongitudeA: snapshot.localTimeLongitudeA ?? 0,
    localTimeLongitudeB: snapshot.localTimeLongitudeB ?? 120,
    localTimeOffsetA: snapshot.localTimeOffsetA ?? 0,
    localTimeOffsetB: snapshot.localTimeOffsetB ?? 480,
    dateLineDirection: snapshot.dateLineDirection ?? 'east', dateLineProgress: snapshot.dateLineProgress ?? 0,
  }
  const date = new Date(snapshot.simulationTimeMs)
  const common = { id: `${moduleId}-${sequence}`, correctAnswerId: 'correct', initialSceneAction: base }
  if (moduleId === 'climate-zones') {
    const result = classifyThermalZone(snapshot.latitudeDegrees)
    return {
      ...common, type: 'thermal-zone', typeLabel: '五带判断', topic: 'climate-zones',
      prompt: `当前选中纬度${snapshot.latitudeDegrees}°（北正南负），属于哪一带或哪条分界线？采用23°26′、66°34′教材边界。`,
      options: choices(result.name, ['热带', '北温带', '南温带', '北寒带', '南寒带']),
      explanation: `${result.name}：${result.explanation} 五带不是实际气候类型。`,
      explanationSteps: [
        step(base, '还原所选纬线', '观察高亮纬线与回归线、极圈的位置关系。'),
        step(base, '比较赤道', '把高亮纬线移到赤道，观察回归线之间的热带范围。', { latitudeDegrees: 0 }),
        step(base, '比较极圈', '把高亮纬线移到同半球极圈，观察温带与寒带的分界。', { latitudeDegrees: snapshot.latitudeDegrees < 0 ? -POLAR_CIRCLE_LATITUDE_DEGREES : POLAR_CIRCLE_LATITUDE_DEGREES }),
        step(base, '还原并分类', `${result.name}。${result.explanation}`),
      ],
    }
  }
  if (moduleId === 'date-line') {
    const direction = base.dateLineDirection!
    const result = calculateDateLineCrossing(direction, 1, date)
    const correct = direction === 'east' ? '日历减一天' : '日历加一天'
    return {
      ...common, type: 'date-line', typeLabel: '理论日期界线判断', topic: 'date-line',
      prompt: `UTC固定为${calendar.format(date)}，观察点${direction === 'east' ? '向东' : '向西'}跨越180°理论日期界线（西侧UTC+12、东侧UTC−12）。跨线后相对跨线前如何换日？忽略旅途耗时。`,
      options: choices(correct, ['日历不变', '日历减一天', '日历加一天', 'UTC也必须改变一天']),
      explanation: `${correct}；跨线前${calendar.format(new Date(result.before.calendarTimeMs))}，跨线后${calendar.format(new Date(result.after.calendarTimeMs))}。钟点相同，UTC不变；不表示现实曲折日期线。`,
      explanationSteps: [
        step(base, '跨线前', '观察点移到出发侧；同时对比界线两侧的日期。', { dateLineProgress: 0 }),
        step(base, '到达理论界线', '观察点到达180°经线，按目标侧日期约定显示；±180°是同一经线。', { dateLineProgress: 0.5 }),
        step(base, '跨线后', `${correct}。只有地表观察点移动，UTC保持题设时刻，不是时间倒流或经过24小时。`, { dateLineProgress: 1 }),
      ],
    }
  }
  const longitudeA = base.localTimeLongitudeA!
  const longitudeB = base.localTimeLongitudeB!
  if (sequence % 2 === 0) {
    const result = compareLocalMeanTimes(longitudeA, longitudeB, date)
    const correct = `${result.timeDifferenceMinutes}分钟`
    return {
      ...common, type: 'local-time', typeLabel: '地方时差计算', topic: 'local-time',
      prompt: `当前A经度${longitudeA}°、B经度${longitudeB}°（东正西负），UTC为${calendar.format(date)}。按经度日期约定，B−A地方平均太阳时差是多少？正值表示B钟表读数领先。`,
      options: choices(correct, [`${-result.timeDifferenceMinutes}分钟`, '0分钟', '60分钟', '−60分钟', '120分钟', '−120分钟']),
      explanation: `引擎计算B−A=${correct}；A为${calendar.format(new Date(result.a.calendarTimeMs))}，B为${calendar.format(new Date(result.b.calendarTimeMs))}。每度差4分钟，东早西晚；±180°同经线的日期约定需区分。不含时间方程。`,
      explanationSteps: [
        step(base, '还原两地经线', '观察A、B的经度及东西方向，日期也要一起比较。'),
        step(base, '重合经线', '临时把B移到A经度，两地地方平均太阳时相同。', { localTimeLongitudeB: longitudeA }),
        step(base, '恢复经度差', `B恢复题设经度，B−A为${correct}。观察两条经线并对比实时日历读数。`),
      ],
    }
  }
  const offsetA = base.localTimeOffsetA!
  const offsetB = base.localTimeOffsetB!
  const a = compareMeanAndFixedTime(longitudeA, offsetA, date)
  const b = compareMeanAndFixedTime(longitudeB, offsetB, date)
  const correct = calendar.format(new Date(b.fixedClock.calendarTimeMs))
  return {
    ...common, type: 'fixed-offset-time', typeLabel: '固定偏移区时计算', topic: 'fixed-offset-time',
    prompt: `UTC为${calendar.format(date)}；A经度${longitudeA}°采用${formatUtcOffset(offsetA)}，B经度${longitudeB}°采用${formatUtcOffset(offsetB)}（东正西负）。B的区时日期和钟点是哪一项？只采用固定偏移模型。`,
    options: choices(correct, [calendar.format(new Date(a.fixedClock.calendarTimeMs)), calendar.format(new Date(b.meanClock.calendarTimeMs)), calendar.format(date), calendar.format(new Date(date.getTime() - offsetB * 60000)), calendar.format(new Date(date.getTime() + 86400000)), calendar.format(new Date(date.getTime() - 86400000)), calendar.format(new Date(date.getTime() + 3600000)), calendar.format(new Date(date.getTime() - 3600000))]),
    explanation: `B区时为${correct}。区时由UTC加固定偏移得到，与所在地经度无关；经度控制地方平均太阳时。这里不包含国家边界、IANA历史规则或夏令时。`,
    explanationSteps: [
      step(base, '还原两地和偏移', '经线表示地点位置，区时偏移是另一项独立约定。'),
      step(base, '相同偏移对比', '临时给B选与A相同的偏移：经度不变，两地区时相同，但地方平均太阳时可能不同。', { localTimeOffsetB: offsetA }),
      step(base, '恢复B偏移', `恢复B的${formatUtcOffset(offsetB)}，区时为${correct}；地表经线不因偏移改变而移动。`),
    ],
  }
}
