export interface GeographicPoint {
  /** 北纬为正、南纬为负，单位：度。 */
  latitudeDegrees: number
  /** 东经为正、西经为负，范围 [-180, 180)，单位：度。 */
  longitudeDegrees: number
}

export interface LocalSolarTimeResult {
  /** 地方平均太阳时，范围 [0, 24)，单位：小时。 */
  decimalHours: number
  /** 相对输入 UTC 日期的日偏移。 */
  dayOffset: -1 | 0 | 1
}
