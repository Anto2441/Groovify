import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { SpotifyRecommendationsResponse, SpotifySearchTracksResponse, SpotifyTrack } from '@/shared/types/spotify'
import { spotifyService } from '../spotify'

vi.mock('@/server/spotify/auth', () => ({
  getSpotifyAccessToken: vi.fn(),
}))

import { getSpotifyAccessToken } from '@/server/spotify/auth'

describe('spotify service', () => {
  const mockFetch = vi.fn<
    ReturnType<typeof fetch>,
    Parameters<typeof fetch>
  >()

  beforeEach(() => {
    vi.mocked(getSpotifyAccessToken).mockResolvedValue('test-token')
    ;(global as any).fetch = mockFetch
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  const track: SpotifyTrack = {
    id: '1',
    name: 'Test Track',
    uri: 'spotify:track:1',
    duration_ms: 200000,
    preview_url: null,
    explicit: false,
    artists: [{ id: 'artist-1', name: 'Artist', uri: 'spotify:artist:1' }],
    album: {
      id: 'album-1',
      name: 'Album',
      uri: 'spotify:album:1',
      release_date: '2000-01-01',
      images: [],
    },
  }

  const createResponse = (status = 200, body: unknown = {}) =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      statusText: 'status-text',
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(JSON.stringify(body)),
    } as unknown as Response)

  it('searchTracks returns items and adds query params', async () => {
    const response: SpotifySearchTracksResponse = {
      tracks: {
        items: [track],
        limit: 2,
        offset: 0,
        total: 1,
      },
    }

    mockFetch.mockResolvedValue(createResponse(200, response))

    const result = await spotifyService.searchTracks('love', 5)

    expect(result).toEqual([track])
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/search?q=love&type=track&limit=5'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    )
  })

  it('getTrack returns the track details', async () => {
    mockFetch.mockResolvedValue(createResponse(200, track))

    const result = await spotifyService.getTrack('1')

    expect(result).toEqual(track)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/tracks/1'), expect.any(Object))
  })

  it('getRecommendations requires at least one seed', async () => {
    await expect(spotifyService.getRecommendations({})).rejects.toThrow(
      'At least one recommendation seed is required',
    )
  })

  it('getRecommendations honors seeds and returns tracks', async () => {
    const response: SpotifyRecommendationsResponse = {
      seeds: [
        {
          id: 'artist-1',
          type: 'artist',
          initialPoolSize: 1,
          afterFilteringSize: 1,
          afterRelinkingSize: 1,
        },
      ],
      tracks: [track],
    }

    mockFetch.mockResolvedValue(createResponse(200, response))

    const result = await spotifyService.getRecommendations({
      seedArtists: ['artist-1'],
      seedTracks: ['track-1', 'track-2', 'track-3', 'track-4', 'track-5', 'track-6'],
      seedGenres: ['rock'],
      limit: 3,
    })

    expect(result).toEqual([track])
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/recommendations'),
      expect.any(Object),
    )
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('seed_tracks=track-1%2Ctrack-2%2Ctrack-3%2Ctrack-4%2Ctrack-5'),
      expect.any(Object),
    )
  })

  it('handles Spotify errors gracefully', async () => {
    const errorBody = { error: { message: 'Invalid token' } }
    mockFetch.mockResolvedValue(createResponse(401, errorBody))

    await expect(spotifyService.searchTracks('q')).rejects.toThrow(
      'Spotify API error (401) on /search: Invalid token',
    )
  })
})
