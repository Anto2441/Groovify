import type { PlaylistFilters, Playlist, SpotifyTrack } from '@/shared/test-utils/fixtures'
import type { SpotifyService } from '@/shared/test-utils/mockSpotifyService'

type PlaylistBuilderOptions = {
  filters: PlaylistFilters
  tracks: SpotifyTrack[]
}

const createId = () => `playlist-${Math.random().toString(36).slice(2, 10)}`

const filterTracksByYear = (tracks: SpotifyTrack[], filters: PlaylistFilters) => {
  const { yearStart, yearEnd } = filters
  if (yearStart == null && yearEnd == null) {
    return tracks
  }

  return tracks.filter((track) => {
    const releaseYear = track.album.release_date ? Number(track.album.release_date.split('-')[0]) : undefined
    if (releaseYear == null) {
      return true
    }
    if (yearStart != null && releaseYear < yearStart) {
      return false
    }
    if (yearEnd != null && releaseYear > yearEnd) {
      return false
    }
    return true
  })
}

const limitTrackCount = (tracks: SpotifyTrack[], count?: number) => {
  if (count == null || count <= 0) {
    return tracks
  }

  return tracks.slice(0, count)
}

const buildPlaylist = ({ tracks, filters }: PlaylistBuilderOptions): Playlist => {
  const genreLabel = filters.genre ?? 'Mix'
  const trackCount = filters.trackCount ?? tracks.length
  return {
    id: createId(),
    name: `${genreLabel.charAt(0).toUpperCase()}${genreLabel.slice(1)} Vibes`,
    description: `Generated ${trackCount} ${genreLabel} tracks.`,
    filters,
    tracks,
    createdAt: new Date().toISOString(),
  }
}

export async function generatePlaylist(filters: PlaylistFilters, spotifyService: SpotifyService): Promise<Playlist> {
  const recommended = await spotifyService.getRecommendations(filters)
  const filtered = filterTracksByYear(recommended, filters)
  const limited = limitTrackCount(filtered, filters.trackCount)

  return buildPlaylist({ filters, tracks: limited })
}
