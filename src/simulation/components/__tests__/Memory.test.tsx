import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/utils'
import Memory from '../Memory'
import { MemoryLocation } from '@/types/cpu'

describe('Memory Component', () => {
  const createMockMemory = (count: number, startAddress: number = 0): MemoryLocation[] => {
    return Array.from({ length: count }, (_, i) => ({
      address: startAddress + i,
      value: i * 10,
      active: false,
      used: false,
    }))
  }

  it('should render memory title', () => {
    const memory = createMockMemory(16)
    render(<Memory memory={memory} />)
    expect(screen.getByText('Memory')).toBeInTheDocument()
  })

  it('should render default 16 memory locations', () => {
    const memory = createMockMemory(16)
    render(<Memory memory={memory} />)
    
    // Check that addresses are rendered
    expect(screen.getByText('0x00')).toBeInTheDocument()
    expect(screen.getByText('0x0F')).toBeInTheDocument()
  })

  it('should render custom maxVisible memory locations', () => {
    const memory = createMockMemory(32)
    render(<Memory memory={memory} maxVisible={8} />)
    
    expect(screen.getByText('0x00')).toBeInTheDocument()
    expect(screen.getByText('0x07')).toBeInTheDocument()
    // Should not show address 0x08
    expect(screen.queryByText('0x08')).not.toBeInTheDocument()
  })

  it('should display memory values in hex', () => {
    const memory = createMockMemory(4)
    memory[0].value = 0
    memory[1].value = 255
    memory[2].value = 16
    memory[3].value = 42

    render(<Memory memory={memory} />)
    
    expect(screen.getByText('00')).toBeInTheDocument()
    expect(screen.getByText('FF')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('2A')).toBeInTheDocument()
  })

  it('should display address overflow message when memory exceeds maxVisible', () => {
    const memory = createMockMemory(20)
    render(<Memory memory={memory} maxVisible={16} />)
    
    expect(screen.getByText(/... and 4 more locations/)).toBeInTheDocument()
  })

  it('should not display overflow message when memory fits', () => {
    const memory = createMockMemory(16)
    render(<Memory memory={memory} maxVisible={16} />)
    
    expect(screen.queryByText(/... and/)).not.toBeInTheDocument()
  })

  it('should apply active styling to active memory locations', () => {
    const memory = createMockMemory(4)
    memory[1].active = true

    const { container } = render(<Memory memory={memory} />)
    const activeElements = container.querySelectorAll('.bg-green-600')
    expect(activeElements.length).toBeGreaterThan(0)
  })

  it('should apply inactive styling to inactive memory locations', () => {
    const memory = createMockMemory(4)
    memory.forEach((mem) => (mem.active = false))

    const { container } = render(<Memory memory={memory} />)
    const inactiveElements = container.querySelectorAll('.bg-gray-800')
    expect(inactiveElements.length).toBeGreaterThan(0)
  })

  it('should handle empty memory array', () => {
    render(<Memory memory={[]} />)
    expect(screen.getByText('Memory')).toBeInTheDocument()
  })

  it('should format addresses correctly in hex', () => {
    const memory = [
      { address: 0, value: 0, active: false, used: false },
      { address: 15, value: 0, active: false, used: false },
      { address: 255, value: 0, active: false, used: false },
    ]

    render(<Memory memory={memory} maxVisible={3} />)
    
    expect(screen.getByText('0x00')).toBeInTheDocument()
    expect(screen.getByText('0x0F')).toBeInTheDocument()
    expect(screen.getByText('0xFF')).toBeInTheDocument()
  })

  it('should apply used styling to used memory locations', () => {
    const memory = createMockMemory(4)
    memory[1].used = true
    memory[2].used = true

    const { container } = render(<Memory memory={memory} />)
    const usedElements = container.querySelectorAll('.bg-blue-600')
    expect(usedElements.length).toBeGreaterThan(0)
  })

  it('should prioritize active styling over used styling', () => {
    const memory = createMockMemory(4)
    memory[1].used = true
    memory[1].active = true

    const { container } = render(<Memory memory={memory} />)
    const activeElements = container.querySelectorAll('.bg-green-600')
    expect(activeElements.length).toBeGreaterThan(0)
    
    // Should not have blue styling when active
    const usedElements = container.querySelectorAll('.bg-blue-600')
    expect(usedElements.length).toBe(0)
  })
})

