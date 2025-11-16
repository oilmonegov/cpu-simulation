import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils'
import EnergyMeter from '../EnergyMeter'

describe('EnergyMeter Component', () => {
  it('should render energy title', () => {
    render(<EnergyMeter current={100} max={100} />)
    expect(screen.getByText('Energy')).toBeInTheDocument()
  })

  it('should display current and max energy', () => {
    render(<EnergyMeter current={75} max={100} />)
    expect(screen.getByText('75.0 / 100')).toBeInTheDocument()
  })

  it('should display percentage', () => {
    render(<EnergyMeter current={50} max={100} />)
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('should show green color for high energy (>50%)', () => {
    const { container } = render(<EnergyMeter current={75} max={100} />)
    const colorElement = container.querySelector('.bg-green-500')
    expect(colorElement).toBeInTheDocument()
  })

  it('should show yellow color for medium energy (20-50%)', () => {
    const { container } = render(<EnergyMeter current={35} max={100} />)
    const colorElement = container.querySelector('.bg-yellow-500')
    expect(colorElement).toBeInTheDocument()
  })

  it('should show red color for low energy (<20%)', () => {
    const { container } = render(<EnergyMeter current={15} max={100} />)
    const colorElement = container.querySelector('.bg-red-500')
    expect(colorElement).toBeInTheDocument()
  })

  it('should display low energy warning when energy is below 20%', () => {
    render(<EnergyMeter current={15} max={100} />)
    expect(screen.getByText('⚠ Low Energy Warning')).toBeInTheDocument()
  })

  it('should not display warning when energy is above 20%', () => {
    render(<EnergyMeter current={25} max={100} />)
    expect(screen.queryByText('⚠ Low Energy Warning')).not.toBeInTheDocument()
  })

  it('should handle zero energy', () => {
    render(<EnergyMeter current={0} max={100} />)
    expect(screen.getByText('0.0 / 100')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('⚠ Low Energy Warning')).toBeInTheDocument()
  })

  it('should handle full energy', () => {
    render(<EnergyMeter current={100} max={100} />)
    expect(screen.getByText('100.0 / 100')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('should handle different max values', () => {
    render(<EnergyMeter current={50} max={200} />)
    expect(screen.getByText('50.0 / 200')).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('should calculate percentage correctly', () => {
    const testCases = [
      { current: 0, max: 100, expected: '0%' },
      { current: 25, max: 100, expected: '25%' },
      { current: 50, max: 100, expected: '50%' },
      { current: 75, max: 100, expected: '75%' },
      { current: 100, max: 100, expected: '100%' },
    ]

    testCases.forEach(({ current, max, expected }) => {
      const { unmount } = render(<EnergyMeter current={current} max={max} />)
      expect(screen.getByText(expected)).toBeInTheDocument()
      unmount()
    })
  })
})

