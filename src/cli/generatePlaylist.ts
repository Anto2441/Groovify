#!/usr/bin/env node

import type { PlaylistFilters } from '@/features/playlist/types'
import { generatePlaylist } from '@/features/playlist/services/generation'
import { sampleTracks } from '@/shared/test-utils/fixtures'

type SpotifyService = {
  searchTracks: (query: string, limit?: number) => Promise<typeof sampleTracks>
  getRecommendations: (params: PlaylistFilters) => Promise<typeof sampleTracks>
}

const spotifyService: SpotifyService = {
  searchTracks: async () => sampleTracks,
  getRecommendations: async () => sampleTracks,
}

const usage = () => {
  console.log(`
Usage: pnpm generate-playlist [options]

Options:
  --genre <genre[,genre,...]>   Genre or comma-separated list of genres
  --year-start <year>           Minimum release year
  --year-end <year>             Maximum release year
  --count <number>              Requested track count
  --help                        Show this message
`)
}

const getArg = (flag: string) => {
  const idx = process.argv.indexOf(flag)
  if (idx === -1 || idx === process.argv.length - 1) {
    return undefined
  }
  return process.argv[idx + 1]
}

const parseNumber = (value?: string) => {
  if (!value) {
    return undefined
  }
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

const parseGenres = (value?: string) => {
  if (!value) {
    return undefined
  }
  return value.split(',').map((segment) => segment.trim()).filter(Boolean)
}

const main = async () => {
  const args = process.argv.slice(2)
  if (args.length === 0 || args.includes('--help')) {
    usage()
    return
  }

  const filters: PlaylistFilters = {}

  const genre = getArg('--genre')
  const parsedGenres = parseGenres(genre)
  if (parsedGenres?.length) {
    filters.genre = parsedGenres
  }

  const yearStart = parseNumber(getArg('--year-start'))
  const yearEnd = parseNumber(getArg('--year-end'))
  const count = parseNumber(getArg('--count'))

  if (yearStart != null) {
    filters.yearStart = yearStart
  }

  if (yearEnd != null) {
    filters.yearEnd = yearEnd
  }

  if (count != null) {
    filters.trackCount = count
  }

  try {
    const playlist = await generatePlaylist(filters, spotifyService)

    console.log(`Playlist: ${playlist.name} (${playlist.id})`)
    console.log(`Tracks: ${playlist.metadata.actualTrackCount} / ${playlist.metadata.requestedTrackCount} requested`)
    console.log(`Filters relaxed: ${playlist.metadata.filtersRelaxed}`)
    console.log(`Filters: ${JSON.stringify(filters)}`)
    console.log('\nTracks:')

    playlist.tracks.forEach((track, index) => {
      const artists = track.artists.map((artist) => artist.name).join(', ')
      console.log(`${index + 1}. ${artists} - ${track.name}`)
    })
  } catch (error) {
    console.error('Failed to generate playlist:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

void main()
