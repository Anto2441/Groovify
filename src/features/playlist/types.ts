import type { SpotifyTrack } from '@/shared/types/spotify'

/**
 * Represents the filters a user supplies when requesting a playlist.
 * yearRange is optional but, when provided, constrains the tracks.
 * genre accepts either a single string or an array to keep the API flexible.
 * trackCount defaults are enforced elsewhere, but we still capture the request.
 */
export type PlaylistFilters = {
  genre?: string | string[]
  yearStart?: number
  yearEnd?: number
  trackCount?: number
}

/**
 * Provides context about how a generated playlist was produced.
 * This will help UIs display warnings (e.g., filters were relaxed).
 */
export type PlaylistMetadata = {
  requestedTrackCount: number
  actualTrackCount: number
  filtersRelaxed: boolean
  notes?: string
}

/**
 * The shape returned by the playlist generation algorithm.
 * Contains a human-readable name, the requested tracks, and metadata.
 */
export type Playlist = {
  id: string
  name: string
  tracks: SpotifyTrack[]
  metadata: PlaylistMetadata
}

/**
 * Describes the outcome of validating PlaylistFilters before generation.
 * Includes per-field errors so callers can display precise feedback.
 */
export type ValidationResult = {
  valid: boolean
  errors: {
    genre?: string
    yearStart?: string
    yearEnd?: string
    trackCount?: string
  }
}
