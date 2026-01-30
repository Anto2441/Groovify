import type { SpotifyRecommendationsResponse, SpotifySearchTracksResponse, SpotifyTrack } from '@/shared/types/spotify'
import { getSpotifyAccessToken } from '@/server/spotify/auth'

const BASE_URL = 'https://api.spotify.com/v1'
const DEFAULT_LIMIT = 10

async function fetchWithAuth(path: string, params?: URLSearchParams) {
  const token = await getSpotifyAccessToken()
  const url = new URL(`${BASE_URL}${path}`)

  if (params) {
    url.search = params.toString()
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const spotifyMessage = body?.error?.message
    throw new Error(
      `Spotify API error (${response.status}) on ${path}: ${spotifyMessage ?? response.statusText}`,
    )
  }

  return response.json()
}

export async function searchTracks(query: string, limit = DEFAULT_LIMIT): Promise<SpotifyTrack[]> {
  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: String(limit),
  })

  const data = (await fetchWithAuth('/search', params)) as SpotifySearchTracksResponse
  return data.tracks.items
}

export async function getTrack(trackId: string): Promise<SpotifyTrack> {
  const data = (await fetchWithAuth(`/tracks/${trackId}`)) as SpotifyTrack
  return data
}

type RecommendationsParams = {
  seedTracks?: string[]
  seedArtists?: string[]
  seedGenres?: string[]
  limit?: number
}

export async function getRecommendations(params: RecommendationsParams): Promise<SpotifyTrack[]> {
  const { seedTracks, seedArtists, seedGenres, limit = DEFAULT_LIMIT } = params

  if (!seedTracks?.length && !seedArtists?.length && !seedGenres?.length) {
    throw new Error('At least one recommendation seed is required')
  }

  const query = new URLSearchParams({
    limit: String(limit),
  })

  if (seedTracks?.length) {
    query.set('seed_tracks', seedTracks.slice(0, 5).join(','))
  }
  if (seedArtists?.length) {
    query.set('seed_artists', seedArtists.slice(0, 5).join(','))
  }
  if (seedGenres?.length) {
    query.set('seed_genres', seedGenres.slice(0, 5).join(','))
  }

  const data = (await fetchWithAuth('/recommendations', query)) as SpotifyRecommendationsResponse
  return data.tracks
}

export const spotifyService = {
  searchTracks,
  getTrack,
  getRecommendations,
}
