import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils'
import ScoreDisplay from '../ScoreDisplay'

describe('ScoreDisplay Component', () => {
  it('should render score', () => {
    render(<ScoreDisplay score={1000} accuracy={95} speedBonus={10} efficiencyBonus={85} />)
    expect(screen.getByText('1,000')).toBeInTheDocument()
  })

  it('should display "Score" title', () => {
    render(<ScoreDisplay score={0} accuracy={0} speedBonus={0} efficiencyBonus={0} />)
    expect(screen.getByText('Score')).toBeInTheDocument()
  })

  it('should display accuracy percentage', () => {
    render(<ScoreDisplay score={500} accuracy={95.5} speedBonus={5} efficiencyBonus={80} />)
    expect(screen.getByText('95.5%')).toBeInTheDocument()
  })

  it('should display speed bonus', () => {
    render(<ScoreDisplay score={500} accuracy={90} speedBonus={15} efficiencyBonus={75} />)
    expect(screen.getByText('+15%')).toBeInTheDocument()
  })

  it('should display efficiency bonus', () => {
    render(<ScoreDisplay score={500} accuracy={90} speedBonus={10} efficiencyBonus={85.7} />)
    expect(screen.getByText('+86%')).toBeInTheDocument() // Rounded
  })

  it('should format large scores with commas', () => {
    render(<ScoreDisplay score={1234567} accuracy={100} speedBonus={0} efficiencyBonus={100} />)
    expect(screen.getByText('1,234,567')).toBeInTheDocument()
  })

  it('should display all metrics correctly', () => {
    render(<ScoreDisplay score={2500} accuracy={98.5} speedBonus={20} efficiencyBonus={90.2} />)
    
    expect(screen.getByText('2,500')).toBeInTheDocument()
    expect(screen.getByText('98.5%')).toBeInTheDocument()
    expect(screen.getByText('+20%')).toBeInTheDocument()
    expect(screen.getByText('+90%')).toBeInTheDocument()
  })

  it('should handle zero values', () => {
    render(<ScoreDisplay score={0} accuracy={0} speedBonus={0} efficiencyBonus={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('0.0%')).toBeInTheDocument()
    const zeroBonuses = screen.getAllByText('+0%')
    expect(zeroBonuses).toHaveLength(2)
  })
})

