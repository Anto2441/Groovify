import type { PlaylistFilters, Playlist, PlaylistMetadata } from '@/features/playlist/types'
import type { SpotifyTrack } from '@/shared/types/spotify'

import { validateFilters } from './validation'

const DEFAULT_TRACK_COUNT = 10

type SpotifyService = {
  searchTracks: (query: string, limit?: number) => Promise<SpotifyTrack[]>
  getRecommendations: (params: PlaylistFilters) => Promise<SpotifyTrack[]>
}

const generateId = () => `playlist-${Math.random().toString(36).slice(2, 10)}`

const buildQuery = (filters: PlaylistFilters) => {
  const parts: string[] = []

  if (filters.genre) {
    parts.push(Array.isArray(filters.genre) ? filters.genre.join(' ') : filters.genre)
  }

  if (filters.yearStart != null && filters.yearEnd != null) {
    parts.push(`year:${filters.yearStart}-${filters.yearEnd}`)
  }

  return parts.join(' ').trim() || 'playlist'
}

const dedupeTracksById = (tracks: SpotifyTrack[]) => {
  const seen = new Set<string>()
  return tracks.filter((track) => {
    if (seen.has(track.id)) {
      return false
    }
    seen.add(track.id)
    return true
  })
}

const shuffleTracks = (tracks: SpotifyTrack[]) => {
  const result = [...tracks]

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = (i * 3 + 1) % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

const buildCandidatePool = (searchResults: SpotifyTrack[], recommended: SpotifyTrack[]) => {
  const combined = [...searchResults, ...recommended]
  const deduped = dedupeTracksById(combined)
  return shuffleTracks(deduped)
}

const buildMetadata = (requested: number, actual: number): PlaylistMetadata => ({
  requestedTrackCount: requested,
  actualTrackCount: actual,
  filtersRelaxed: actual < requested,
})

export async function generatePlaylist(filters: PlaylistFilters, spotifyService: SpotifyService): Promise<Playlist> {
  const validation = validateFilters(filters)

  if (!validation.valid) {
    throw new Error('Invalid playlist filters')
  }

  const requestedTrackCount = filters.trackCount ?? DEFAULT_TRACK_COUNT
  const query = buildQuery(filters)
  const searchLimit = Math.max(requestedTrackCount * 2, DEFAULT_TRACK_COUNT)

  const searchResults = await spotifyService.searchTracks(query, searchLimit)
  const recommendedTracks = await spotifyService.getRecommendations(filters)

  const candidateTracks =
    recommendedTracks.length > 0
      ? buildCandidatePool(searchResults, recommendedTracks)
      : []
  const limitedTracks = candidateTracks.slice(0, requestedTrackCount)
  const actualTrackCount = limitedTracks.length

  const metadata = buildMetadata(requestedTrackCount, actualTrackCount)

  return {
    id: generateId(),
    name: `Groovify Mix`,
    filters,
    tracks: limitedTracks,
    metadata,
  }
}
