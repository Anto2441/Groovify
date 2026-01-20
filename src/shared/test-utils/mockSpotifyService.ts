import { vi } from 'vitest'

import { sampleTracks, type SpotifyTrack, type PlaylistFilters } from './fixtures'

export type SpotifyService = {
  getToken: () => Promise<string>
  searchTracks: (query: string) => Promise<SpotifyTrack[]>
  getRecommendations: (filters: PlaylistFilters) => Promise<SpotifyTrack[]>
}

export type MockSpotifyService = {
  getToken: ReturnType<typeof vi.fn<Promise<string>, []>>
  searchTracks: ReturnType<typeof vi.fn<Promise<SpotifyTrack[]>, [string]>>
  getRecommendations: ReturnType<
    typeof vi.fn<Promise<SpotifyTrack[]>, [PlaylistFilters]>
  >
}

export function createMockSpotifyService(overrides?: Partial<MockSpotifyService>) {
  const defaults: MockSpotifyService = {
    getToken: vi.fn(async () => 'mock-token'),
    searchTracks: vi.fn(async () => sampleTracks),
    getRecommendations: vi.fn(async () => sampleTracks),
  }

  return {
    ...defaults,
    ...overrides,
  }
}
