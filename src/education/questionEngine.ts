import {
  dayLength,
  localSolarTime,
  solarDeclination,
  solarNoonAltitude,
  subsolarPoint,
} from '../lib/geography'
import { getLabModuleRuntimeConfig } from '../config/labModuleRegistry'
import type {
  GeographyQuestion,
  PracticeSnapshot,
  QuestionOption,
  QuestionType,
  TeachingStep,
} from '../types/education'
import { generateTimeAndZonesQuestion } from './timeAndZonesQuestions'

const QUESTION_TYPES = [
  'multiple-choice',
  'true-false',
  'diagram',
  'terminator',
  'date',
  'subsolar',
  'day-length',
  'noon-altitude',
  'local-time',
] as const satisfies readonly QuestionType[]

function option(id: string, label: string): QuestionOption {
  return { id, label }
}

function uniqueOptions(
  candidates: QuestionOption[],
  fillers: QuestionOption[],
): QuestionOption[] {
  const result: QuestionOption[] = []
  const labels = new Set<string>()
  for (const item of [...candidates, ...fillers]) {
    if (labels.has(item.label)) continue
    labels.add(item.label)
    result.push(item)
    if (result.length === 4) break
  }
  return result
}

function dayNightExplanationSteps(snapshot: PracticeSnapshot, latitudeDegrees: number): TeachingStep[] {
  return [
    { title: '还原光照', explanation: '先按题设日期恢复太阳光照方向。', durationMs: 2200, action: { moduleId: 'day-night', simulationTimeMs: snapshot.simulationTimeMs, latitudeDegrees, dayNightStep: 2 } },
    { title: '显示晨昏线', explanation: '晨昏线把地球分成昼半球和夜半球。', durationMs: 2400, action: { moduleId: 'day-night', latitudeDegrees, dayNightStep: 3 } },
    { title: '比较昼夜弧', explanation: '观察所选纬线的昼弧和夜弧，再形成结论。', durationMs: 2600, action: { moduleId: 'day-night', latitudeDegrees, dayNightStep: 6 } },
  ]
}

function formatHours(hours: number): string {
  return `${hours.toFixed(1)}小时`
}

function formatLatitude(latitudeDegrees: number): string {
  if (Math.abs(latitudeDegrees) < 1e-8) return '赤道（0°）'
  const absolute = Math.abs(latitudeDegrees)
  let degrees = Math.floor(absolute)
  let minutes = Math.round((absolute - degrees) * 60)
  if (minutes === 60) {
    degrees += 1
    minutes = 0
  }
  const direction = latitudeDegrees > 0 ? 'N' : 'S'
  return minutes === 0
    ? `${degrees}°${direction}`
    : `${degrees}°${minutes}′${direction}`
}

function formatClockTime(decimalHours: number): string {
  const roundedMinutes = Math.round(decimalHours * 60)
  const normalizedMinutes = ((roundedMinutes % 1_440) + 1_440) % 1_440
  const hour = Math.floor(normalizedMinutes / 60)
  const minute = normalizedMinutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function buildMultipleChoice(snapshot: PracticeSnapshot, sequence: number): GeographyQuestion {
  const date = new Date(snapshot.simulationTimeMs)
  const declination = solarDeclination(date)
  const daylight = dayLength(snapshot.latitudeDegrees, declination)
  const correct = daylight > 12.05 ? 'longer' : daylight < 11.95 ? 'shorter' : 'equal'
  return {
    id: `multiple-choice-${sequence}`,
    type: 'multiple-choice',
    typeLabel: '选择题',
    topic: 'day-length',
    prompt: `当前场景中 ${formatLatitude(snapshot.latitudeDegrees)} 的昼夜关系是？`,
    options: [option('longer', '昼长夜短'), option('shorter', '昼短夜长'), option('equal', '昼夜等长'), option('unknown', '无法判断')],
    correctAnswerId: correct,
    explanation: `geographyEngine计算昼长为${formatHours(daylight)}。比较昼弧与夜弧可得出相同结论。`,
    explanationSteps: dayNightExplanationSteps(snapshot, snapshot.latitudeDegrees),
  }
}

function buildTrueFalse(snapshot: PracticeSnapshot, sequence: number): GeographyQuestion {
  const declination = solarDeclination(new Date(snapshot.simulationTimeMs))
  const daylight = dayLength(snapshot.latitudeDegrees, declination)
  const statementTrue = daylight >= 12 - 1e-6
  return {
    id: `true-false-${sequence}`,
    type: 'true-false',
    typeLabel: '判断题',
    topic: 'day-length',
    prompt: '判断：当前所选纬度的昼长大于或等于12小时。',
    options: [option('true', '正确'), option('false', '错误')],
    correctAnswerId: statementTrue ? 'true' : 'false',
    explanation: `当前太阳赤纬为${declination.toFixed(2)}°，其符号表示直射点所在半球；再结合所选纬度即可判断。`,
    explanationSteps: dayNightExplanationSteps(snapshot, snapshot.latitudeDegrees),
  }
}

function buildDiagram(snapshot: PracticeSnapshot, sequence: number): GeographyQuestion {
  const declination = solarDeclination(new Date(snapshot.simulationTimeMs))
  const daylight = dayLength(snapshot.latitudeDegrees, declination)
  const polarPoint = Math.abs(snapshot.latitudeDegrees) === 90
  const altitude = solarNoonAltitude(snapshot.latitudeDegrees, declination)
  const pointState = altitude > 1e-8 ? 'day' : altitude < -1e-8 ? 'night' : 'horizon'
  const specialArc = daylight === 0 || daylight === 24
  const initialSceneAction = {
    moduleId: 'day-night' as const, simulationTimeMs: snapshot.simulationTimeMs,
    latitudeDegrees: snapshot.latitudeDegrees, dayNightStep: 6 as const,
    cameraPreset: 'equator' as const,
    teachingLayers: { ...getLabModuleRuntimeConfig('day-night').defaultLayers },
  }
  return {
    id: `diagram-${sequence}`,
    type: 'diagram',
    typeLabel: '读图题',
    topic: 'terminator',
    prompt: polarPoint
      ? '所选纬度是极点，纬线退化为点。按当前几何光照模型，这个极点位于哪里？'
      : specialArc ? '观察所选纬线与昼夜半球：当前哪一项描述正确？'
        : '观察模型中所选纬线：黄色高亮弧段表示什么？',
    options: polarPoint
      ? [option('day', '昼半球'), option('night', '夜半球'), option('horizon', '晨昏分界上（太阳中心在地平线上）'), option('ring', '极点仍有非零半径的纬线圈')]
      : specialArc
        ? [option('full-day', '整条纬线在昼半球，没有夜弧'), option('full-night', '整条纬线在夜半球，没有昼弧'), option('equal', '昼弧与夜弧等长'), option('none', '纬线没有任何受光关系')]
        : [option('day-arc', '位于昼半球内的昼弧'), option('night-arc', '位于夜半球内的夜弧'), option('equator', '赤道'), option('terminator', '晨昏线')],
    correctAnswerId: polarPoint ? pointState : specialArc ? daylight === 24 ? 'full-day' : 'full-night' : 'day-arc',
    explanation: polarPoint
      ? `极点纬线半径为零，不能读作昼弧夜弧。当前太阳中心高度${altitude.toFixed(4)}°，${pointState === 'day' ? '处于昼半球' : pointState === 'night' ? '处于夜半球' : '处于地平线边界'}；不把边界的12小时约定理解为日常升落。`
      : specialArc ? `几何昼长为${daylight}小时，${daylight === 24 ? '没有夜弧' : '没有昼弧'}，不能要求观察不存在的弧段。`
        : '黄色弧段位于朝向太阳的昼半球内，因此是昼弧；其长度比例决定昼长。',
    initialSceneAction,
    explanationSteps: dayNightExplanationSteps(snapshot, snapshot.latitudeDegrees),
  }
}

function buildTerminator(snapshot: PracticeSnapshot, sequence: number): GeographyQuestion {
  return {
    id: `terminator-${sequence}`,
    type: 'terminator',
    typeLabel: '晨昏线判断',
    topic: 'terminator',
    prompt: '模型中青色晨线上的地点，随后将发生什么变化？',
    options: [option('enter-day', '由夜半球进入昼半球'), option('enter-night', '由昼半球进入夜半球'), option('no-change', '始终位于正午'), option('polar', '立即进入极夜')],
    correctAnswerId: 'enter-day',
    explanation: '地球自西向东自转，晨线上的地点正从夜半球转入昼半球；橙色昏线则相反。',
    explanationSteps: [
      { title: '太阳光', explanation: '先确定昼半球方向。', durationMs: 2200, action: { moduleId: 'day-night', simulationTimeMs: snapshot.simulationTimeMs, dayNightStep: 2 } },
      { title: '晨线与昏线', explanation: '青色为晨线，橙色为昏线。', durationMs: 2600, action: { moduleId: 'day-night', dayNightStep: 3, overlayMessage: '青色：进入白昼；橙色：进入黑夜。' } },
    ],
  }
}

function buildDate(snapshot: PracticeSnapshot, sequence: number): GeographyQuestion {
  const declination = solarDeclination(new Date(snapshot.simulationTimeMs))
  const correct = Math.abs(declination) < 1 ? 'equinox' : declination > 0 ? 'north-summer' : 'north-winter'
  return {
    id: `date-${sequence}`,
    type: 'date',
    typeLabel: '日期判断',
    topic: 'subsolar-point',
    prompt: `当前太阳赤纬约为 ${declination.toFixed(1)}°，最符合下列哪种日期特征？`,
    options: [option('equinox', '春分或秋分附近'), option('north-summer', '北半球夏半年'), option('north-winter', '北半球冬半年'), option('impossible', '该日期不可能出现')],
    correctAnswerId: correct,
    explanation: '太阳赤纬为正表示直射点在北半球，为负表示在南半球；接近0°表示分日前后。',
    explanationSteps: [
      { title: '标出直射点', explanation: '直射点纬度等于太阳赤纬。', durationMs: 2400, action: { moduleId: 'day-night', simulationTimeMs: snapshot.simulationTimeMs, showSubsolarMarker: true } },
      { title: '联系日期', explanation: '观察直射点位于赤道以北、以南还是赤道附近。', durationMs: 2600, action: { moduleId: 'day-night', showSubsolarMarker: true, cameraPreset: 'equator' } },
    ],
  }
}

function buildSubsolar(snapshot: PracticeSnapshot, sequence: number): GeographyQuestion {
  const point = subsolarPoint(new Date(snapshot.simulationTimeMs))
  const correctValue = point.latitudeDegrees.toFixed(1)
  return {
    id: `subsolar-${sequence}`,
    type: 'subsolar',
    typeLabel: '太阳直射点判断',
    topic: 'subsolar-point',
    prompt: '当前时刻太阳直射点纬度最接近哪一项？',
    options: uniqueOptions(
      [
        option('correct', `${correctValue}°`),
        option('opposite', `${(-point.latitudeDegrees).toFixed(1)}°`),
        option('equator', '0.0°'),
        option('polar', point.latitudeDegrees >= 0 ? '66.5°N' : '66.5°S'),
      ],
      [option('north-tropic', '23.4°N'), option('south-tropic', '23.4°S'), option('north-pole', '90.0°N')],
    ),
    correctAnswerId: 'correct',
    explanation: `太阳直射点纬度等于太阳赤纬，当前计算值为${correctValue}°。`,
    explanationSteps: [
      { title: '显示直射点', explanation: '黄色标记是太阳光垂直入射的位置。', durationMs: 2600, action: { moduleId: 'day-night', simulationTimeMs: snapshot.simulationTimeMs, showSubsolarMarker: true, cameraPreset: 'equator' } },
    ],
  }
}

function buildDayLength(snapshot: PracticeSnapshot, sequence: number): GeographyQuestion {
  const declination = solarDeclination(new Date(snapshot.simulationTimeMs))
  const daylight = dayLength(snapshot.latitudeDegrees, declination)
  return {
    id: `day-length-${sequence}`,
    type: 'day-length',
    typeLabel: '昼夜长短判断',
    topic: 'day-length',
    prompt: '当前纬度的昼长最接近哪一项？',
    options: uniqueOptions(
      [
        option('correct', formatHours(daylight)),
        option('night', formatHours(24 - daylight)),
        option('twelve', '12.0小时'),
        option('offset', formatHours(Math.max(0, Math.min(24, daylight + 2)))),
      ],
      [option('six', '6.0小时'), option('eighteen', '18.0小时'), option('twenty-four', '24.0小时'), option('zero', '0.0小时')],
    ),
    correctAnswerId: 'correct',
    explanation: `昼长由所选纬线的昼弧所占比例决定，计算结果为${formatHours(daylight)}。`,
    explanationSteps: dayNightExplanationSteps(snapshot, snapshot.latitudeDegrees),
  }
}

function buildNoonAltitude(snapshot: PracticeSnapshot, sequence: number): GeographyQuestion {
  const declination = solarDeclination(new Date(snapshot.simulationTimeMs))
  const altitude = solarNoonAltitude(snapshot.latitudeDegrees, declination)
  return {
    id: `noon-altitude-${sequence}`,
    type: 'noon-altitude',
    typeLabel: '正午太阳高度判断',
    topic: 'solar-altitude',
    prompt: '当前纬度的正午太阳高度最接近哪一项？',
    options: uniqueOptions(
      [option('correct', `${altitude.toFixed(1)}°`), option('complement', `${(90 - altitude).toFixed(1)}°`), option('declination', `${Math.abs(declination).toFixed(1)}°`), option('ninety', '90.0°')],
      [option('zero', '0.0°'), option('forty-five', '45.0°'), option('sixty', '60.0°')],
    ),
    correctAnswerId: 'correct',
    explanation: `正午太阳高度由纬度与太阳赤纬的差决定，当前结果为${altitude.toFixed(1)}°。`,
    explanationSteps: [
      { title: '确定直射纬线', explanation: '先标出太阳直射点。', durationMs: 2200, action: { moduleId: 'day-night', simulationTimeMs: snapshot.simulationTimeMs, latitudeDegrees: snapshot.latitudeDegrees, showSubsolarMarker: true } },
      { title: '比较纬度差', explanation: '所选纬度与直射纬度相差越大，正午太阳高度越小。', durationMs: 2600, action: { moduleId: 'day-night', showSolarNoonGuide: true, latitudeDegrees: snapshot.latitudeDegrees } },
    ],
  }
}

function buildLocalTime(snapshot: PracticeSnapshot, sequence: number): GeographyQuestion {
  const longitudeDegrees = sequence % 2 === 0 ? 120 : -75
  const result = localSolarTime(longitudeDegrees, new Date(snapshot.simulationTimeMs))
  const label = formatClockTime(result.decimalHours)
  const oppositeLabel = formatClockTime(result.decimalHours + 12)
  return {
    id: `local-time-${sequence}`,
    type: 'local-time',
    typeLabel: '地方时计算',
    topic: 'rotation',
    prompt: `当前UTC时刻下，${Math.abs(longitudeDegrees)}°${longitudeDegrees >= 0 ? 'E' : 'W'}的地方平均太阳时是？`,
    options: uniqueOptions(
      [option('correct', label), option('utc', new Date(snapshot.simulationTimeMs).toISOString().slice(11, 16)), option('opposite', oppositeLabel), option('noon', '12:00')],
      [option('six', '06:00'), option('eighteen', '18:00'), option('midnight', '00:00')],
    ),
    correctAnswerId: 'correct',
    explanation: `经度每向东15°地方时增加1小时，向西15°减少1小时；计算结果为${label}。`,
    explanationSteps: [
      { title: '显示经纬网', explanation: '先确定目标经线位于本初子午线以东还是以西。', durationMs: 2200, action: { moduleId: 'local-time', cameraPreset: 'equator', overlayMessage: '经度每相差15°，地方时相差1小时。' } },
      { title: '模拟地球自转', explanation: '地球自西向东自转，东边地点更早迎来正午。', durationMs: 2600, action: { moduleId: 'rotation', cameraPreset: 'north-pole', overlayMessage: '东早西晚。' } },
    ],
  }
}

function generateLegacyQuestion(snapshot: PracticeSnapshot, sequence: number): GeographyQuestion {
  const type = QUESTION_TYPES[((sequence % QUESTION_TYPES.length) + QUESTION_TYPES.length) % QUESTION_TYPES.length]!
  switch (type) {
    case 'multiple-choice': return buildMultipleChoice(snapshot, sequence)
    case 'true-false': return buildTrueFalse(snapshot, sequence)
    case 'diagram': return buildDiagram(snapshot, sequence)
    case 'terminator': return buildTerminator(snapshot, sequence)
    case 'date': return buildDate(snapshot, sequence)
    case 'subsolar': return buildSubsolar(snapshot, sequence)
    case 'day-length': return buildDayLength(snapshot, sequence)
    case 'noon-altitude': return buildNoonAltitude(snapshot, sequence)
    case 'local-time': return buildLocalTime(snapshot, sequence)
  }
}

/** 稳定轮换选项位置；ID不变，相同场景和序号仍可复现。 */
export function generateQuestion(snapshot: PracticeSnapshot, sequence: number): GeographyQuestion {
  const question = generateTimeAndZonesQuestion(snapshot, sequence) ?? generateLegacyQuestion(snapshot, sequence)
  const count = question.options.length
  const shift = ((sequence % count) + count) % count
  return { ...question, options: [...question.options.slice(shift), ...question.options.slice(0, shift)] }
}
