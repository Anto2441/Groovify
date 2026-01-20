export type SpotifyArtist = {
  id: string
  name: string
}

export type SpotifyAlbum = {
  id: string
  name: string
  release_date?: string
}

export type SpotifyTrack = {
  id: string
  name: string
  artists: SpotifyArtist[]
  album: SpotifyAlbum
  preview_url?: string | null
  uri: string
  duration_ms: number
}

export type PlaylistFilters = {
  genre?: string
  yearStart?: number
  yearEnd?: number
  trackCount?: number
}

export type Playlist = {
  id: string
  name: string
  description?: string
  filters: PlaylistFilters
  tracks: SpotifyTrack[]
  createdAt: string
}

export const sampleTrack: SpotifyTrack = {
  id: 'track-1',
  name: 'Mock Rhythm',
  artists: [{ id: 'artist-1', name: 'Mock Artist' }],
  album: { id: 'album-1', name: 'Mock Album', release_date: '1999-07-01' },
  preview_url: 'https://example.com/preview',
  uri: 'spotify:track:mock',
  duration_ms: 210000,
}

export const sampleTracks: SpotifyTrack[] = [
  sampleTrack,
  {
    id: 'track-2',
    name: 'Mock Groove',
    artists: [{ id: 'artist-2', name: 'Another Artist' }],
    album: { id: 'album-2', name: 'Mock Album II', release_date: '2005-03-12' },
    preview_url: null,
    uri: 'spotify:track:mock2',
    duration_ms: 185000,
  },
]

export const sampleFilters: PlaylistFilters = {
  genre: 'rock',
  yearStart: 1990,
  yearEnd: 2005,
  trackCount: 2,
}

export const samplePlaylist: Playlist = {
  id: 'playlist-1',
  name: 'Mock Playlist',
  description: 'A playlist for tests',
  createdAt: new Date().toISOString(),
  filters: sampleFilters,
  tracks: sampleTracks,
}
