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
    if (Array.isArray(filters.genre)) {
      parts.push(filters.genre.join(' '))
    } else {
      parts.push(filters.genre)
    }
  }

  if (filters.yearStart != null && filters.yearEnd != null) {
    parts.push(`year:${filters.yearStart}-${filters.yearEnd}`)
  }

  return parts.join(' ').trim() || 'playlist'
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
  await spotifyService.searchTracks(query, Math.max(requestedTrackCount, DEFAULT_TRACK_COUNT))

  const recommendedTracks = await spotifyService.getRecommendations(filters)
  const limitedTracks = recommendedTracks.slice(0, requestedTrackCount)
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
