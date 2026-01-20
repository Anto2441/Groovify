import type { ReactElement } from 'react'
import { render as rtlRender, type RenderOptions } from '@testing-library/react'

export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions,
) {
  return rtlRender(ui, {
    ...options,
  })
}

export * from '@testing-library/react'
