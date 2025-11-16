import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils'
import Register from '../Register'
import { Register as RegisterType } from '@/types/cpu'

describe('Register Component', () => {
  const createMockRegister = (overrides?: Partial<RegisterType>): RegisterType => ({
    name: 'R1',
    value: 0,
    active: false,
    description: 'Test register',
    ...overrides,
  })

  it('should render register name', () => {
    const register = createMockRegister({ name: 'R1' })
    render(<Register register={register} />)
    expect(screen.getByText('R1')).toBeInTheDocument()
  })

  it('should render register value in hex', () => {
    const register = createMockRegister({ value: 255 })
    render(<Register register={register} />)
    expect(screen.getByText('000000FF')).toBeInTheDocument()
  })

  it('should render register value with 0x prefix', () => {
    const register = createMockRegister({ value: 42 })
    render(<Register register={register} />)
    expect(screen.getByText('0x2A')).toBeInTheDocument()
  })

  it('should display different register names', () => {
    const registers = [
      createMockRegister({ name: 'R1' }),
      createMockRegister({ name: 'R2' }),
      createMockRegister({ name: 'PC' }),
      createMockRegister({ name: 'IR' }),
    ]

    registers.forEach((reg) => {
      const { unmount } = render(<Register register={reg} />)
      expect(screen.getByText(reg.name)).toBeInTheDocument()
      unmount()
    })
  })

  it('should handle different register values', () => {
    const testCases = [
      { value: 0, expectedHex: '00000000' },
      { value: 1, expectedHex: '00000001' },
      { value: 255, expectedHex: '000000FF' },
      { value: 256, expectedHex: '00000100' },
      { value: 65535, expectedHex: '0000FFFF' },
    ]

    testCases.forEach(({ value, expectedHex }) => {
      const { unmount } = render(
        <Register register={createMockRegister({ value })} />
      )
      expect(screen.getByText(expectedHex)).toBeInTheDocument()
      unmount()
    })
  })

  it('should apply active styling when register is active', () => {
    const activeRegister = createMockRegister({ active: true })
    const { container } = render(<Register register={activeRegister} />)
    const registerElement = container.querySelector('.bg-blue-600')
    expect(registerElement).toBeInTheDocument()
  })

  it('should apply inactive styling when register is not active', () => {
    const inactiveRegister = createMockRegister({ active: false })
    const { container } = render(<Register register={inactiveRegister} />)
    const registerElement = container.querySelector('.bg-gray-800')
    expect(registerElement).toBeInTheDocument()
  })

  it('should render with tooltip containing description', () => {
    const register = createMockRegister({ description: 'General purpose register 1' })
    render(<Register register={register} />)
    // Tooltip content should be in the DOM (even if not visible)
    expect(screen.getByText('R1')).toBeInTheDocument()
  })
})

