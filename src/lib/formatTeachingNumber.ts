const formatter = new Intl.NumberFormat('zh-CN', {
  useGrouping: false,
  maximumFractionDigits: 6,
})

/** Display formatting only; never round the value used for geography calculations. */
export function formatTeachingNumber(value: number): string {
  return formatter.format(value)
}
