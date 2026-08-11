const units = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
} as const

export function durationToMs(value: string) {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(value)
  if (!match) throw new Error(`Invalid duration: ${value}`)

  return Number(match[1]) * units[match[2] as keyof typeof units]
}
