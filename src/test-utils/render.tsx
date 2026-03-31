import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'

// Keep this minimal: most components under test don't need app providers.
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options })

export * from '@testing-library/react'
export { customRender as render }