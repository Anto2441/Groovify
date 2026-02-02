import { describe, expect, it } from 'vitest'

import type { PlaylistFilters, ValidationResult } from '../types'
import { validateFilters } from '../services/validation'

const MIN_YEAR = 1900
const MAX_YEAR = 2100
const MAX_TRACK_COUNT = 100

describe('validateFilters', () => {
  it('accepts valid single-genre filters', () => {
    const filters: PlaylistFilters = {
      genre: 'rock',
      yearStart: 1990,
      yearEnd: 2005,
      trackCount: 20,
    }

    const result = validateFilters(filters) as ValidationResult

    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('accepts valid multi-genre filters', () => {
    const filters: PlaylistFilters = {
      genre: ['rock', 'jazz'],
      yearStart: 1980,
      yearEnd: 1995,
      trackCount: 10,
    }

    const result = validateFilters(filters) as ValidationResult

    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('rejects yearStart greater than yearEnd', () => {
    const filters: PlaylistFilters = {
      genre: 'rock',
      yearStart: 2010,
      yearEnd: 2000,
      trackCount: 10,
    }

    const result = validateFilters(filters) as ValidationResult

    expect(result.valid).toBe(false)
    expect(result.errors.yearEnd).toBe('yearEnd must be greater than or equal to yearStart')
  })

  it('rejects years outside reasonable bounds', () => {
    const filters: PlaylistFilters = {
      genre: 'rock',
      yearStart: MIN_YEAR - 1,
      yearEnd: MAX_YEAR + 1,
      trackCount: 10,
    }

    const result = validateFilters(filters) as ValidationResult

    expect(result.valid).toBe(false)
    expect(result.errors.yearStart).toBe(`yearStart must be between ${MIN_YEAR} and ${MAX_YEAR}`)
    expect(result.errors.yearEnd).toBe(`yearEnd must be between ${MIN_YEAR} and ${MAX_YEAR}`)
  })

  it('rejects non-positive trackCount', () => {
    const filters: PlaylistFilters = {
      genre: 'rock',
      yearStart: 1990,
      yearEnd: 2000,
      trackCount: 0,
    }

    const result = validateFilters(filters) as ValidationResult

    expect(result.valid).toBe(false)
    expect(result.errors.trackCount).toBe('trackCount must be greater than 0')
  })

  it('rejects excessively large trackCount', () => {
    const filters: PlaylistFilters = {
      genre: 'rock',
      yearStart: 1990,
      yearEnd: 2000,
      trackCount: MAX_TRACK_COUNT + 1,
    }

    const result = validateFilters(filters) as ValidationResult

    expect(result.valid).toBe(false)
    expect(result.errors.trackCount).toBe(`trackCount must be less than or equal to ${MAX_TRACK_COUNT}`)
  })

  it('rejects empty genre arrays', () => {
    const filters: PlaylistFilters = {
      genre: [],
      yearStart: 1990,
      yearEnd: 2000,
      trackCount: 10,
    }

    const result = validateFilters(filters) as ValidationResult

    expect(result.valid).toBe(false)
    expect(result.errors.genre).toBe('genre must include at least one value')
  })

  it('accepts missing optional filters', () => {
    const filters: PlaylistFilters = {}

    const result = validateFilters(filters) as ValidationResult

    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })
})
