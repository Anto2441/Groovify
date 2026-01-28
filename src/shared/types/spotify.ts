export interface SpotifyArtist {
  id: string
  name: string
  uri: string
}

export interface SpotifyImage {
  url: string
  width: number | null
  height: number | null
}

export interface SpotifyAlbum {
  id: string
  name: string
  uri: string
  release_date: string
  images: SpotifyImage[]
}

export interface SpotifyTrack {
  id: string
  name: string
  uri: string
  duration_ms: number
  preview_url: string | null
  explicit: boolean
  artists: SpotifyArtist[]
  album: SpotifyAlbum
}

export interface SpotifySearchTracksResponse {
  tracks: {
    items: SpotifyTrack[]
    limit: number
    offset: number
    total: number
  }
}

export interface SpotifyRecommendationsSeed {
  id: string
  type: string
  initialPoolSize: number
  afterFilteringSize: number
  afterRelinkingSize: number
}

export interface SpotifyRecommendationsResponse {
  seeds: SpotifyRecommendationsSeed[]
  tracks: SpotifyTrack[]
}
