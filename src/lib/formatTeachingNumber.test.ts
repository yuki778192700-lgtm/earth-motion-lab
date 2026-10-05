import { expect, it } from 'vitest'
import { formatTeachingNumber } from './formatTeachingNumber'

it.each([
  [120 - 116.4, '3.6'],
  [(120 - 116.4) * 4, '14.4'],
  [(116.4 - 120) * 4, '-14.4'],
  [0.05, '0.05'],
  [116.4, '116.4'],
  [1440, '1440'],
  [0, '0'],
])('formats %s as %s without changing the underlying value', (value, expected) => {
  expect(formatTeachingNumber(value)).toBe(expected)
})
