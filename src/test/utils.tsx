import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

/**
 * Custom render function that includes providers
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

/**
 * Helper to create mock registers
 */
export function createMockRegisters(count: number = 3) {
  return Array.from({ length: count }, (_, i) => ({
    name: `R${i + 1}`,
    value: 0,
    active: false,
    description: `Register ${i + 1}`,
  }))
}

/**
 * Helper to create mock instructions
 */
export function createMockInstruction(
  opcode: string,
  overrides?: Partial<any>
) {
  return {
    id: `test-${Date.now()}`,
    opcode,
    description: `Test ${opcode} instruction`,
    ...overrides,
  }
}

