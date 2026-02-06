import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import type { Playlist, PlaylistFilters } from '@/features/playlist/types'
import { generatePlaylist } from '@/features/playlist/services/generation'
import { getRecommendations, searchTracks } from '@/shared/services/spotify'

const DEFAULT_TRACK_COUNT = 10

function PlaygroundPage() {
  return (
    <div>
      <h1>Groovify Dev Playlist Playground</h1>
      <p>Dev-only page for manually testing playlist generation.</p>
      <form>
        <div>
          <label htmlFor="genre">Genre</label>
          <input id="genre" name="genre" type="text" />
        </div>
        <div>
          <label htmlFor="yearStart">Year start</label>
          <input id="yearStart" name="yearStart" type="number" />
        </div>
        <div>
          <label htmlFor="yearEnd">Year end</label>
          <input id="yearEnd" name="yearEnd" type="number" />
        </div>
        <div>
          <label htmlFor="trackCount">Track count</label>
          <input id="trackCount" name="trackCount" type="number" />
        </div>
        <button type="submit">Generate playlist</button>
      </form>
    </div>
  )
}

export const Route = createFileRoute('/dev/playground')({
  component: PlaygroundPage,
})

const ensureFilters = (filters?: PlaylistFilters) => {
  if (!filters) {
    throw new Error('Playlist filters are required')
  }

  const hasAnyFilter =
    Boolean(filters.genre) ||
    filters.yearStart != null ||
    filters.yearEnd != null ||
    filters.trackCount != null

  if (!hasAnyFilter) {
    throw new Error(
      'Provide at least one playlist filter before generating a playlist',
    )
  }
}

const buildMinimalSpotifyService = () => ({
  searchTracks: async (query: string, limit?: number) =>
    await searchTracks(query, limit),
  getRecommendations: async (filters: PlaylistFilters) => {
    const seedGenres: Array<string> = []
    if (filters.genre) {
      const genres = Array.isArray(filters.genre)
        ? filters.genre
        : [filters.genre]
      seedGenres.push(...genres.filter(Boolean))
    }

    return await getRecommendations({
      seedGenres,
      limit: filters.trackCount ?? DEFAULT_TRACK_COUNT,
    })
  },
})

export const generatePlaylistAction = createServerFn({ method: 'POST' })
  .inputValidator((data: PlaylistFilters) => data)
  .handler(async ({ data }): Promise<Playlist> => {
    ensureFilters(data)
    console.log('generatePlaylistAction input', data)

    const playlist = await generatePlaylist(data, buildMinimalSpotifyService())

    console.log('generatePlaylistAction output', playlist)
    return playlist
  })
