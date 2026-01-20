import type { ReactElement } from 'react'
import { render as rtlRender, type RenderOptions } from '@testing-library/react'
import { RouterProvider } from '@tanstack/react-router'

import { getRouter } from '../../router'

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const router = getRouter()

  return rtlRender(<RouterProvider router={router}>{ui}</RouterProvider>, {
    ...options,
  })
}

export * from '@testing-library/react'
