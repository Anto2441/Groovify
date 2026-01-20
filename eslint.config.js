//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    ignores: [
      '.output/**',
      'node_modules/**',
      'dist/**',
      'dist-ssr/**',
      '.nitro/**',
      '.tanstack/**',
      '.vinxi/**',
      '*.config.js',
      '*.config.ts',
    ],
  },
]
