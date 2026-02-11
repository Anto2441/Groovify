import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useCallback, useState } from 'react'
import type { FormEvent } from 'react'

import type { Playlist, PlaylistFilters } from '@/features/playlist/types'
import { generatePlaylist } from '@/features/playlist/services/generation'
import { getRecommendations, searchTracks } from '@/shared/services/spotify'

const DEFAULT_TRACK_COUNT = 10

type FormState = {
  genre: string
  yearStart: string
  yearEnd: string
  trackCount: string
}

function PlaygroundPage() {
  const [form, setForm] = useState<FormState>({
    genre: '',
    yearStart: '',
    yearEnd: '',
    trackCount: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Playlist | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleChange = useCallback((field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setLoading(true)
      setError(null)
      setResult(null)

      const filters: PlaylistFilters = {}
      if (form.genre.trim()) {
        filters.genre = form.genre.trim()
      }
      const start = Number(form.yearStart)
      if (!Number.isNaN(start)) {
        filters.yearStart = start
      }
      const end = Number(form.yearEnd)
      if (!Number.isNaN(end)) {
        filters.yearEnd = end
      }
      const count = Number(form.trackCount)
      if (!Number.isNaN(count)) {
        filters.trackCount = count
      }

      try {
        const playlist = await generatePlaylistAction({ data: filters })
        setResult(playlist)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    },
    [form],
  )

  return (
    <div>
      <h1>Groovify Dev Playlist Playground</h1>
      <p>Dev-only page for manually testing playlist generation.</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="genre">Genre</label>
          <input
            id="genre"
            name="genre"
            type="text"
            value={form.genre}
            onChange={(event) => handleChange('genre', event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="yearStart">Year start</label>
          <input
            id="yearStart"
            name="yearStart"
            type="number"
            value={form.yearStart}
            onChange={(event) => handleChange('yearStart', event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="yearEnd">Year end</label>
          <input
            id="yearEnd"
            name="yearEnd"
            type="number"
            value={form.yearEnd}
            onChange={(event) => handleChange('yearEnd', event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="trackCount">Track count</label>
          <input
            id="trackCount"
            name="trackCount"
            type="number"
            value={form.trackCount}
            onChange={(event) => handleChange('trackCount', event.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Generating…' : 'Generate playlist'}
        </button>
      </form>
      {error && (
        <div role="alert">
          <strong>Error:</strong>
          <p>{error}</p>
        </div>
      )}
      {result && (
        <div>
          <h2>Generated Playlist</h2>
          <p>Name: {result.name}</p>
          <p>Track count: {result.metadata.actualTrackCount}</p>
          <ul>
            {result.tracks.map((track) => (
              <li key={track.id}>
                {track.name} by {track.artists.map((artist) => artist.name).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}
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
