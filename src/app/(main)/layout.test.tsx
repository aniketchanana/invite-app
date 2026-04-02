import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MainLayout from './layout'

describe('MainLayout', () => {
  it('renders children and footer', () => {
    render(
      <MainLayout>
        <div>child</div>
      </MainLayout>
    )
    expect(screen.getByText('child')).toBeInTheDocument()
    expect(screen.getByText(/made by aniket/i)).toBeInTheDocument()
  })
})
