import { describe, expect, it, vi } from 'vitest'

import { createMockSpotifyService } from '@/shared/test-utils/mockSpotifyService'
import { sampleFilters, sampleTracks, type PlaylistFilters } from '@/shared/test-utils/fixtures'

import { generatePlaylist } from './generation'

describe('generatePlaylist', () => {
  it('returns a playlist object with tracks', async () => {
    const spotifyService = createMockSpotifyService()

    const playlist = await generatePlaylist(sampleFilters, spotifyService)

    expect(Array.isArray(playlist.tracks)).toBe(true)
    expect(playlist.tracks.length).toBeGreaterThan(0)
  })

  it('respects the requested genre, year range, and track count', async () => {
    const spotifyService = createMockSpotifyService()

    await generatePlaylist(sampleFilters, spotifyService)

    expect(spotifyService.getRecommendations).toHaveBeenCalledWith(sampleFilters)
    const playlist = await generatePlaylist(sampleFilters, spotifyService)

    expect(playlist.filters).toEqual(sampleFilters)
    expect(playlist.tracks).toHaveLength(sampleFilters.trackCount)
    const releaseYears = playlist.tracks
      .map((track) => Number(track.album.release_date?.split('-')[0]))
      .filter(Boolean)

    expect(releaseYears.every((year) => year >= sampleFilters.yearStart! && year <= sampleFilters.yearEnd!)).toBe(
      true,
    )
  })

  it('returns an empty playlist when no tracks match filters', async () => {
    const spotifyService = createMockSpotifyService({
      getRecommendations: vi.fn(async () => []),
    })

    const playlist = await generatePlaylist(sampleFilters, spotifyService)

    expect(playlist.tracks).toEqual([])
  })
})
