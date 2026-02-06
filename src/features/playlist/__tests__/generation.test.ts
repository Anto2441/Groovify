import { describe, expect, it, vi } from 'vitest'

import type { SpotifyTrack } from '@/shared/types/spotify'
import type { PlaylistFilters, Playlist } from '../types'
import { generatePlaylist } from '../services/generation'

type SpotifyService = {
  searchTracks: (query: string, limit?: number) => Promise<SpotifyTrack[]>
  getTrack: (trackId: string) => Promise<SpotifyTrack>
  getRecommendations: (params: {
    seedTracks?: string[]
    seedArtists?: string[]
    seedGenres?: string[]
    limit?: number
  }) => Promise<SpotifyTrack[]>
}

const buildTrack = (id: string, year = '2000-01-01'): SpotifyTrack => ({
  id,
  name: `Track ${id}`,
  uri: `spotify:track:${id}`,
  duration_ms: 200000,
  preview_url: null,
  explicit: false,
  artists: [{ id: `artist-${id}`, name: `Artist ${id}`, uri: `spotify:artist:${id}` }],
  album: {
    id: `album-${id}`,
    name: `Album ${id}`,
    uri: `spotify:album:${id}`,
    release_date: year,
    images: [],
  },
})

const createSpotifyServiceMock = (tracks: SpotifyTrack[] = []) => ({
  searchTracks: vi.fn(async () => tracks),
  getTrack: vi.fn(async (trackId: string) => buildTrack(trackId)),
  getRecommendations: vi.fn(async () => tracks),
})

describe('generatePlaylist', () => {
  it('returns a Playlist with requestedTrackCount metadata', async () => {
    const spotifyService: SpotifyService = createSpotifyServiceMock([
      buildTrack('1'),
      buildTrack('2'),
      buildTrack('3'),
    ])

    const filters: PlaylistFilters = {
      genre: 'rock',
      yearStart: 1990,
      yearEnd: 2005,
      trackCount: 2,
    }

    const result = (await generatePlaylist(filters, spotifyService)) as Playlist

    expect(result.tracks.length).toBeGreaterThan(0)
    expect(result.metadata.requestedTrackCount).toBe(2)
  })

  it('marks filtersRelaxed when fewer tracks are available than requested', async () => {
    const spotifyService: SpotifyService = createSpotifyServiceMock([buildTrack('1')])

    const filters: PlaylistFilters = { genre: 'rock', trackCount: 5 }

    const result = (await generatePlaylist(filters, spotifyService)) as Playlist

    expect(result.metadata.actualTrackCount).toBeLessThan(result.metadata.requestedTrackCount)
    expect(result.metadata.filtersRelaxed).toBe(true)
  })

  it('does not relax filters when enough tracks are available', async () => {
    const spotifyService: SpotifyService = createSpotifyServiceMock([
      buildTrack('1'),
      buildTrack('2'),
      buildTrack('3'),
      buildTrack('4'),
    ])

    const filters: PlaylistFilters = { genre: 'rock', trackCount: 2 }

    const result = (await generatePlaylist(filters, spotifyService)) as Playlist

    expect(result.metadata.actualTrackCount).toBe(result.metadata.requestedTrackCount)
    expect(result.metadata.filtersRelaxed).toBe(false)
  })

  it('handles no results returned from Spotify', async () => {
    const spotifyService: SpotifyService = createSpotifyServiceMock([])
    const filters: PlaylistFilters = { genre: 'rock', trackCount: 5 }

    const result = (await generatePlaylist(filters, spotifyService)) as Playlist

    expect(result.tracks).toEqual([])
    expect(result.metadata.actualTrackCount).toBe(0)
    expect(result.metadata.filtersRelaxed).toBe(true)
  })

  it('accepts missing optional filters', async () => {
    const spotifyService: SpotifyService = createSpotifyServiceMock([buildTrack('1')])
    const filters: PlaylistFilters = { trackCount: 1 }

    const result = (await generatePlaylist(filters, spotifyService)) as Playlist

    expect(result.tracks.length).toBeGreaterThan(0)
  })

  it('rejects empty genre arrays', async () => {
    const spotifyService: SpotifyService = createSpotifyServiceMock([buildTrack('1')])
    const filters: PlaylistFilters = { genre: [], trackCount: 1 }

    await expect(generatePlaylist(filters, spotifyService)).rejects.toThrow('Invalid playlist filters')
  })

  it('surfaces Spotify errors predictably', async () => {
    const error = new Error('Network error')
    const spotifyService: SpotifyService = {
      searchTracks: vi.fn(async () => {
        throw error
      }),
      getTrack: vi.fn(async () => buildTrack('1')),
      getRecommendations: vi.fn(async () => {
        throw error
      }),
    }

    const filters: PlaylistFilters = { genre: 'rock', trackCount: 1 }

    await expect(generatePlaylist(filters, spotifyService)).rejects.toThrow('Network error')
  })
})
