import { toHealthDto, toReadyDto } from './health.mapper.js'
import { isDatabaseReady } from './health.repository.js'

export function getHealth() {
  return toHealthDto()
}

export async function getReady() {
  await isDatabaseReady()
  return toReadyDto()
}
