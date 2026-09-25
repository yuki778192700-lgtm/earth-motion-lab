import type { TeachingScript } from '../types/education'

const MARCH_EQUINOX = Date.parse('2026-03-20T14:46:00.000Z')
const JUNE_SOLSTICE = Date.parse('2026-06-21T08:24:00.000Z')
const SEPTEMBER_EQUINOX = Date.parse('2026-09-23T00:05:00.000Z')
const DECEMBER_SOLSTICE = Date.parse('2026-12-21T20:50:00.000Z')

export const TEACHING_SCRIPTS: TeachingScript[] = [
  {
    id: 'rotation',
    title: '地球自转',
    summary: '从北极上空观察地球自西向东旋转。',
    steps: [
      { title: '观察地轴', explanation: '地球绕地轴旋转，地轴穿过南北极。', durationMs: 3200, action: { moduleId: 'rotation', cameraPreset: 'equator', overlayMessage: '先确定地轴的位置。' } },
      { title: '判断方向', explanation: '从北极上空观察，地球自转方向为逆时针。', durationMs: 3600, action: { moduleId: 'rotation', cameraPreset: 'north-pole', overlayMessage: '北极上空：逆时针。' } },
      { title: '纬度与线速度', explanation: '纬线半径随纬度升高而减小，因此自转线速度降低。', durationMs: 3800, action: { moduleId: 'rotation', latitudeDegrees: 60, cameraPreset: 'default', overlayMessage: '角速度相同，线速度随纬度升高而减小。' } },
    ],
  },
  {
    id: 'terminator',
    title: '晨昏线',
    summary: '从平行太阳光到晨线、昏线及昼夜弧。',
    steps: [1, 2, 3, 4, 5, 6].map((step) => ({
      title: ['太阳光线', '昼夜半球', '晨线与昏线', '选择纬线', '昼弧与夜弧', '昼夜长短'][step - 1]!,
      explanation: [
        '太阳光近似平行到达地球。',
        '朝向太阳的一面为昼半球，背向太阳的一面为夜半球。',
        '晨线上的地点将进入白昼，昏线上的地点将进入黑夜。',
        '选择一条纬线，观察它被晨昏线分成两段。',
        '昼半球内为昼弧，夜半球内为夜弧。',
        '昼弧和夜弧的比例决定昼长和夜长。',
      ][step - 1]!,
      durationMs: 3400,
      action: { moduleId: 'day-night', dayNightStep: step as 1 | 2 | 3 | 4 | 5 | 6, latitudeDegrees: 30, cameraPreset: 'default' },
    })),
  },
  {
    id: 'obliquity',
    title: '黄赤交角',
    summary: '比较黄道面、赤道面与保持空间指向的地轴。',
    steps: [
      { title: '黄道面', explanation: '地球公转轨道所在平面称为黄道面。', durationMs: 3200, action: { moduleId: 'revolution', cameraPreset: 'default', overlayMessage: '蓝色平面：黄道面。' } },
      { title: '赤道面', explanation: '地球赤道面随地轴倾斜，与黄道面不重合。', durationMs: 3400, action: { moduleId: 'revolution', cameraPreset: 'equator', overlayMessage: '青色圆面：赤道面。' } },
      { title: '23°26′', explanation: '黄道面与赤道面的夹角约为23°26′。', durationMs: 3800, action: { moduleId: 'revolution', cameraPreset: 'default', overlayMessage: '黄赤交角约23°26′。' } },
    ],
  },
  {
    id: 'subsolar-point',
    title: '太阳直射点',
    summary: '比较春分、夏至、秋分和冬至的直射纬度。',
    steps: [
      { title: '春分', explanation: '春分太阳直射赤道。', durationMs: 3000, action: { moduleId: 'day-night', simulationTimeMs: MARCH_EQUINOX, latitudeDegrees: 0, showSubsolarMarker: true, overlayMessage: '直射纬度：0°。' } },
      { title: '夏至', explanation: '夏至太阳直射北回归线。', durationMs: 3000, action: { moduleId: 'day-night', simulationTimeMs: JUNE_SOLSTICE, latitudeDegrees: 23 + 26 / 60, showSubsolarMarker: true, overlayMessage: '直射纬度：23°26′N。' } },
      { title: '秋分', explanation: '秋分太阳再次直射赤道。', durationMs: 3000, action: { moduleId: 'day-night', simulationTimeMs: SEPTEMBER_EQUINOX, latitudeDegrees: 0, showSubsolarMarker: true, overlayMessage: '直射纬度：0°。' } },
      { title: '冬至', explanation: '冬至太阳直射南回归线。', durationMs: 3000, action: { moduleId: 'day-night', simulationTimeMs: DECEMBER_SOLSTICE, latitudeDegrees: -(23 + 26 / 60), showSubsolarMarker: true, overlayMessage: '直射纬度：23°26′S。' } },
    ],
  },
  {
    id: 'day-length',
    title: '昼夜长短',
    summary: '通过纬线上的昼弧和夜弧比较昼夜长短。',
    steps: [
      { title: '春分等长', explanation: '春分晨昏线经过南北极；除极点的边界约定外，各纬度几何昼长接近12小时。', durationMs: 3400, action: { moduleId: 'day-night', simulationTimeMs: MARCH_EQUINOX, latitudeDegrees: 40, dayNightStep: 6 } },
      { title: '北半球夏半年', explanation: '夏至40°N昼弧长于夜弧，因此昼长夜短。', durationMs: 3600, action: { moduleId: 'day-night', simulationTimeMs: JUNE_SOLSTICE, latitudeDegrees: 40, dayNightStep: 6 } },
      { title: '北半球冬半年', explanation: '冬至40°N昼弧短于夜弧，因此昼短夜长。', durationMs: 3600, action: { moduleId: 'day-night', simulationTimeMs: DECEMBER_SOLSTICE, latitudeDegrees: 40, dayNightStep: 6 } },
    ],
  },
  {
    id: 'solar-altitude',
    title: '正午太阳高度',
    summary: '改变纬度和日期，观察太阳光与地表法线的夹角。',
    steps: [
      { title: '直射点最高', explanation: '直射点正午太阳高度为90°。', durationMs: 3400, action: { moduleId: 'day-night', simulationTimeMs: JUNE_SOLSTICE, latitudeDegrees: 23 + 26 / 60, showSubsolarMarker: true, showSolarNoonGuide: true } },
      { title: '纬度差增大', explanation: '离直射纬线越远，正午太阳高度越小。', durationMs: 3400, action: { moduleId: 'day-night', simulationTimeMs: JUNE_SOLSTICE, latitudeDegrees: 60, showSolarNoonGuide: true } },
      { title: '季节变化', explanation: '同一纬度随太阳赤纬变化，正午太阳高度也随季节变化。', durationMs: 3400, action: { moduleId: 'day-night', simulationTimeMs: DECEMBER_SOLSTICE, latitudeDegrees: 60, showSolarNoonGuide: true } },
    ],
  },
  {
    id: 'seasons',
    title: '四季形成',
    summary: '地轴倾斜且保持空间指向，使太阳直射点和昼长周期变化。',
    steps: [
      { title: '春分', explanation: '太阳直射赤道；除极点边界外，各地几何昼夜接近等长。', durationMs: 3000, action: { moduleId: 'revolution', simulationTimeMs: MARCH_EQUINOX } },
      { title: '夏至', explanation: '北半球倾向太阳，获得较长白昼。', durationMs: 3000, action: { moduleId: 'revolution', simulationTimeMs: JUNE_SOLSTICE } },
      { title: '秋分', explanation: '太阳再次直射赤道。', durationMs: 3000, action: { moduleId: 'revolution', simulationTimeMs: SEPTEMBER_EQUINOX } },
      { title: '冬至', explanation: '北半球背向太阳，获得较短白昼。', durationMs: 3000, action: { moduleId: 'revolution', simulationTimeMs: DECEMBER_SOLSTICE } },
    ],
  },
  {
    id: 'polar-day-night',
    title: '极昼极夜',
    summary: '观察极圈以内纬线是否与昼半球或夜半球完全重合。',
    steps: [
      { title: '北极圈夏至', explanation: '几何模型中北极圈与晨昏线相切，太阳中心午夜位于地平线上，昼长按24小时计。', durationMs: 3400, action: { moduleId: 'day-night', simulationTimeMs: JUNE_SOLSTICE, latitudeDegrees: 66 + 34 / 60, dayNightStep: 6, cameraPreset: 'north-pole' } },
      { title: '北极点夏至', explanation: '北极点连续处于太阳照射中。', durationMs: 3200, action: { moduleId: 'day-night', simulationTimeMs: JUNE_SOLSTICE, latitudeDegrees: 90, dayNightStep: 6, cameraPreset: 'north-pole' } },
      { title: '北极点冬至', explanation: '半年后北极点背向太阳，进入极夜。', durationMs: 3400, action: { moduleId: 'day-night', simulationTimeMs: DECEMBER_SOLSTICE, latitudeDegrees: 90, dayNightStep: 6, cameraPreset: 'north-pole' } },
    ],
  },
]

export function getTeachingScript(id: TeachingScript['id']): TeachingScript {
  return TEACHING_SCRIPTS.find((script) => script.id === id) ?? TEACHING_SCRIPTS[0]!
}
