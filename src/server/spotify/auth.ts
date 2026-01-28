type SpotifyTokenResponse = {
  access_token: string
  token_type: 'Bearer' | string
  expires_in: number
}

type TokenCache = {
  accessToken: string
  expiresAtMs: number
}

let cache: TokenCache | null = null
let inFlight: Promise<string> | null = null

const SPOTIFY_ACCOUNTS_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const EXPIRY_SKEW_MS = 30_000 // refresh a bit early to avoid edge-of-expiry failures

function getRequiredEnv(name: 'SPOTIFY_CLIENT_ID' | 'SPOTIFY_CLIENT_SECRET'): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function isCacheValid(nowMs: number) {
  return cache != null && nowMs < cache.expiresAtMs - EXPIRY_SKEW_MS
}

async function fetchClientCredentialsToken(): Promise<TokenCache> {
  const clientId = getRequiredEnv('SPOTIFY_CLIENT_ID')
  const clientSecret = getRequiredEnv('SPOTIFY_CLIENT_SECRET')

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(SPOTIFY_ACCOUNTS_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(
      `Spotify token request failed (${res.status} ${res.statusText})${body ? `: ${body}` : ''}`,
    )
  }

  const json = (await res.json()) as SpotifyTokenResponse

  if (!json?.access_token || typeof json.expires_in !== 'number') {
    throw new Error('Spotify token response missing expected fields')
  }

  const nowMs = Date.now()
  return {
    accessToken: json.access_token,
    expiresAtMs: nowMs + json.expires_in * 1000,
  }
}

/**
 * Server-only: returns a valid Spotify access token using Client Credentials.
 * Caches the token in memory until it expires, then refreshes automatically.
 */
export async function getSpotifyAccessToken(): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error('getSpotifyAccessToken must only be called on the server')
  }

  const nowMs = Date.now()
  if (isCacheValid(nowMs)) {
    return cache!.accessToken
  }

  // Avoid multiple concurrent refreshes.
  if (!inFlight) {
    inFlight = fetchClientCredentialsToken()
      .then((next) => {
        cache = next
        return next.accessToken
      })
      .finally(() => {
        inFlight = null
      })
  }

  return inFlight
}
