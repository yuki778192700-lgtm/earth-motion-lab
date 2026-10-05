import type { SceneAction, TeachingScript, TeachingStep } from '../types/education'
import { getLabModuleRuntimeConfig } from '../config/labModuleRegistry'
import { POLAR_CIRCLE_LATITUDE_DEGREES, TROPIC_LATITUDE_DEGREES } from '../lib/earthCoordinates'

// 每步都是可独立还原的快照，前进、后退和重置不会依赖此前操作。
const TIME = Date.parse('2026-03-20T12:00:00Z')
function steps(base: SceneAction, items: Array<[string, string, SceneAction]>): TeachingStep[] {
  return items.map(([title, explanation, action]) => ({
    title, explanation, durationMs: 6500,
    action: { ...base, ...action, overlayMessage: explanation },
  }))
}
const zoneBase: SceneAction = {
  moduleId: 'climate-zones', cameraPreset: 'equator', simulationTimeMs: TIME,
  teachingLayers: { ...getLabModuleRuntimeConfig('climate-zones').defaultLayers },
}
const timeBase: SceneAction = {
  moduleId: 'local-time', cameraPreset: 'north-pole', simulationTimeMs: TIME,
  localTimeLongitudeA: 0, localTimeLongitudeB: 15,
  localTimeOffsetA: 0, localTimeOffsetB: 0,
  teachingLayers: { ...getLabModuleRuntimeConfig('local-time').defaultLayers },
}
const dateBase: SceneAction = {
  moduleId: 'date-line', cameraPreset: 'north-pole', simulationTimeMs: TIME,
  teachingLayers: { ...getLabModuleRuntimeConfig('date-line').defaultLayers },
}

export const TIME_AND_ZONES_TEACHING_SCRIPTS: TeachingScript[] = [
  {
    id: 'climate-zones', title: '五带', summary: '用选中纬线比较五带及四条分界线；颜色不代表气温。',
    steps: steps(zoneBase, [
      ['热带', '选中赤道。两条回归线之间为热带，有太阳直射机会；着色表示天文五带，不表示实时气温。', { latitudeDegrees: 0 }],
      ['北回归线', '选中23°26′N：北回归线是热带与北温带的分界，教材模型中夏至有一次太阳直射。', { latitudeDegrees: TROPIC_LATITUDE_DEGREES }],
      ['北温带', '选中45°N：北温带没有太阳直射，也没有极昼极夜。', { latitudeDegrees: 45 }],
      ['北极圈', '选中66°34′N：北极圈是北温带与北寒带的分界。至日相切按几何昼长的24或0小时边界处理。', { latitudeDegrees: POLAR_CIRCLE_LATITUDE_DEGREES }],
      ['北寒带', '选中75°N：北寒带没有太阳直射，存在极昼极夜；这是全年性质，不表示当前时刻必为极昼。', { latitudeDegrees: 75 }],
      ['南半球对称', '选中75°S为南寒带；南温带与北温带、南寒带与北寒带关于赤道对称。', { latitudeDegrees: -75 }],
      ['南极圈', '选中66°34′S：南极圈是南温带与南寒带的分界。', { latitudeDegrees: -POLAR_CIRCLE_LATITUDE_DEGREES }],
      ['南温带', '选中45°S为南温带。五带按纬度划分，不等于实际气候类型。', { latitudeDegrees: -45 }],
      ['南回归线', '选中23°26′S：南回归线是热带与南温带的分界，教材模型中冬至有一次太阳直射。', { latitudeDegrees: -TROPIC_LATITUDE_DEGREES }],
    ]),
  },
  {
    id: 'local-time', title: '地方时', summary: '比较两条经线：东早西晚，每度差4分钟。',
    steps: steps(timeBase, [
      ['相差15°', 'A在0°、B在15°E。同一UTC时刻，B地方平均太阳时比A早1小时；北极视角观察两条经线。', {}],
      ['换到西经', 'B移到15°W。B地方平均太阳时比A晚1小时；东经为正，西经为负。', { localTimeLongitudeB: -15 }],
      ['两地比较', 'A在75°W、B在120°E。按这组经度日期约定，B−A为13小时；注意同时比较日期，不能只看钟点。', { localTimeLongitudeA: -75, localTimeLongitudeB: 120 }],
      ['同经度', 'A、B都在120°E，地方平均太阳时相同。纬度不影响地方时。这里不含时间方程修正，不能把太阳光照正午直接等同于平均太阳时12点。', { localTimeLongitudeA: 120, localTimeLongitudeB: 120 }],
    ]),
  },
  {
    id: 'fixed-offset-time', title: '区时（固定偏移）', summary: '区时由UTC偏移决定，不由所在地经度直接决定。',
    steps: steps(timeBase, [
      ['相同区时', 'A为北京示例116.4°E、B为120°E；两地都选UTC+8，区时相同，但地方平均太阳时不同。', { localTimeLongitudeA: 116.4, localTimeLongitudeB: 120, localTimeOffsetA: 480, localTimeOffsetB: 480 }],
      ['改变偏移', '经度仍为116.4°E和120°E，A选UTC+8、B选UTC+9：B区时比A早1小时。改变偏移不会改变两条地表经线。', { localTimeLongitudeA: 116.4, localTimeLongitudeB: 120, localTimeOffsetA: 480, localTimeOffsetB: 540 }],
      ['跨日对比', 'UTC为20:00，A选UTC+8显示次日04:00，B选UTC−5显示当日15:00。日期差由时差与UTC共同决定。', { simulationTimeMs: Date.parse('2026-03-20T20:00:00Z'), localTimeOffsetA: 480, localTimeOffsetB: -300 }],
      ['模型边界', '恢复两地相同UTC+8。此选择器是固定偏移教学模型，不是现实国家时区地图；不包含IANA历史规则、夏令时或真实边界。', { localTimeLongitudeA: 116.4, localTimeLongitudeB: 120, localTimeOffsetA: 480, localTimeOffsetB: 480 }],
    ]),
  },
  {
    id: 'date-line', title: '180°理论日期界线', summary: '保持UTC不变，只移动跨线观察点；向东减一天，向西加一天。',
    steps: steps(dateBase, [
      ['西侧出发', '观察点在理论界线西侧，采用UTC+12。与东侧UTC−12相比钟点相同，日期晚一天。这里不是现实曲折日期线。', { dateLineDirection: 'east', dateLineProgress: 0 }],
      ['向东跨线', '观察点向东跨至界线东侧，UTC+12变为UTC−12，日历减一天；UTC固定，不是物理时间倒流。', { dateLineDirection: 'east', dateLineProgress: 1 }],
      ['东侧出发', '现在从理论界线东侧准备向西跨线，采用UTC−12。观察点位置由跨线进度决定，地球不为跨线演示而旋转。', { dateLineDirection: 'west', dateLineProgress: 0 }],
      ['向西跨线', '向西跨至西侧，UTC−12变为UTC+12，日历加一天；忽略旅途耗时，不是经过了24小时。', { dateLineDirection: 'west', dateLineProgress: 1 }],
      ['界线上的约定', '观察点位于180°经线，按目标西侧显示日期。±180°是同一经线；这里仅表示理论日期线，不表示法定时区边界或真实弯折路径。', { dateLineDirection: 'west', dateLineProgress: 0.5 }],
    ]),
  },
]
