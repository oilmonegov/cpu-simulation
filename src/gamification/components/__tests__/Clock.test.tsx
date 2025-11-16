import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils'
import Clock from '../Clock'

describe('Clock Component', () => {
  it('should render clock with cycle number', () => {
    render(<Clock cycle={42} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should display "CPU Clock" title', () => {
    render(<Clock cycle={0} />)
    expect(screen.getByText('CPU Clock')).toBeInTheDocument()
  })

  it('should display "Clock Cycles" label', () => {
    render(<Clock cycle={0} />)
    expect(screen.getByText('Clock Cycles')).toBeInTheDocument()
  })

  it('should render different cycle numbers', () => {
    const { rerender } = render(<Clock cycle={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()

    rerender(<Clock cycle={100} />)
    expect(screen.getByText('100')).toBeInTheDocument()

    rerender(<Clock cycle={9999} />)
    expect(screen.getByText('9999')).toBeInTheDocument()
  })

  it('should accept isPulsing prop', () => {
    render(<Clock cycle={10} isPulsing={true} />)
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('should render without pulsing by default', () => {
    render(<Clock cycle={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})

