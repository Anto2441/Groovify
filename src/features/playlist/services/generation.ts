import type { PlaylistFilters, Playlist } from '@/shared/test-utils/fixtures'
import type { SpotifyService } from '@/shared/test-utils/mockSpotifyService'

export async function generatePlaylist(
  filters: PlaylistFilters,
  spotifyService: SpotifyService,
): Promise<Playlist> {
  throw new Error('Playlist generation not implemented yet')
}
