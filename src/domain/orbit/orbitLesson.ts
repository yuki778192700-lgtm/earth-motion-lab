import { calculateSeasonalEvents } from './earthOrbit'

const LESSON_TEXT = [
  { title: '春分', explanation: '太阳直射赤道附近，30°N与30°S昼夜近等长。此后直射点北移，北半球昼长逐渐增长，南半球相反。' },
  { title: '夏至', explanation: '直射点达到一年中最偏北的位置。30°N昼长较长，30°S昼长较短；北半球此后昼长逐渐缩短。' },
  { title: '秋分', explanation: '太阳再次直射赤道附近，30°N与30°S昼夜近等长。此后直射点南移，南半球昼长逐渐增长。' },
  { title: '冬至', explanation: '直射点达到一年中最偏南的位置。30°N昼长较短，30°S昼长较长，南北情况与夏至相反。' },
] as const

export function assertOrbitLessonStep(step: number): void {
  if (!Number.isInteger(step) || step < 0 || step > 3) throw new RangeError('orbit lesson step must be between 0 and 3')
}

export function createOrbitLesson(year: number) {
  return calculateSeasonalEvents(year).map((event, index) => ({ ...event, index, ...LESSON_TEXT[index]! }))
}
