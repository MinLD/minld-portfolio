import type { HealthDto, ReadyDto } from './health.dto.js'

export function toHealthDto(): HealthDto {
  return { status: 'ok' }
}

export function toReadyDto(): ReadyDto {
  return { status: 'ok', database: 'ok' }
}
