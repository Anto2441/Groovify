import type { PlaylistFilters, ValidationResult } from '@/features/playlist/types'

const MIN_YEAR = 1900
const MAX_YEAR = 2100
const MAX_TRACK_COUNT = 100

const errors = {
  genre: 'genre must include at least one value',
  yearStart: `yearStart must be between ${MIN_YEAR} and ${MAX_YEAR}`,
  yearEnd: `yearEnd must be between ${MIN_YEAR} and ${MAX_YEAR}`,
  yearOrder: 'yearEnd must be greater than or equal to yearStart',
  trackCountLow: 'trackCount must be greater than 0',
  trackCountHigh: `trackCount must be less than or equal to ${MAX_TRACK_COUNT}`,
}

export function validateFilters(filters: PlaylistFilters): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: {},
  }

  const { genre, yearStart, yearEnd, trackCount } = filters

  if (Array.isArray(genre) && genre.length === 0) {
    result.valid = false
    result.errors.genre = errors.genre
  }

  if (yearStart != null && (yearStart < MIN_YEAR || yearStart > MAX_YEAR)) {
    result.valid = false
    result.errors.yearStart = errors.yearStart
  }

  if (yearEnd != null && (yearEnd < MIN_YEAR || yearEnd > MAX_YEAR)) {
    result.valid = false
    result.errors.yearEnd = errors.yearEnd
  }

  if (yearStart != null && yearEnd != null && yearStart > yearEnd) {
    result.valid = false
    result.errors.yearEnd = errors.yearOrder
  }

  if (trackCount != null) {
    if (trackCount <= 0) {
      result.valid = false
      result.errors.trackCount = errors.trackCountLow
    } else if (trackCount > MAX_TRACK_COUNT) {
      result.valid = false
      result.errors.trackCount = errors.trackCountHigh
    }
  }

  return result
}
