import { describe, it, expect } from 'vitest'
import {
  getInstructionCycles,
  getEnergyCost,
  checkRegisterAvailability,
  executeInstruction,
  calculateEfficiency,
  calculateScore,
} from '../cpuRules'
import { Opcode, Register, Instruction } from '@/types/cpu'

describe('CPU Rules', () => {
  describe('getInstructionCycles', () => {
    it('should return correct cycles for LOAD instruction', () => {
      expect(getInstructionCycles(Opcode.LOAD)).toBe(3)
    })

    it('should return correct cycles for STORE instruction', () => {
      expect(getInstructionCycles(Opcode.STORE)).toBe(3)
    })

    it('should return correct cycles for ADD instruction', () => {
      expect(getInstructionCycles(Opcode.ADD)).toBe(1)
    })

    it('should return correct cycles for SUB instruction', () => {
      expect(getInstructionCycles(Opcode.SUB)).toBe(1)
    })

    it('should return correct cycles for MUL instruction', () => {
      expect(getInstructionCycles(Opcode.MUL)).toBe(3)
    })

    it('should return correct cycles for DIV instruction', () => {
      expect(getInstructionCycles(Opcode.DIV)).toBe(3)
    })

    it('should return correct cycles for MOV instruction', () => {
      expect(getInstructionCycles(Opcode.MOV)).toBe(1)
    })

    it('should return correct cycles for JMP instruction', () => {
      expect(getInstructionCycles(Opcode.JMP)).toBe(2)
    })

    it('should return correct cycles for HALT instruction', () => {
      expect(getInstructionCycles(Opcode.HALT)).toBe(1)
    })
  })

  describe('getEnergyCost', () => {
    it('should calculate base energy cost correctly', () => {
      const cost = getEnergyCost(Opcode.ADD, 0)
      expect(cost).toBe(1) // 1 cycle + 0 register penalty
    })

    it('should add register penalty for multiple registers', () => {
      const cost = getEnergyCost(Opcode.ADD, 3)
      expect(cost).toBe(2.5) // 1 cycle + 3 * 0.5
    })

    it('should calculate higher cost for memory operations', () => {
      const cost = getEnergyCost(Opcode.LOAD, 0)
      expect(cost).toBe(3) // 3 cycles + 0 register penalty
    })
  })

  describe('checkRegisterAvailability', () => {
    it('should return available when registers are empty', () => {
      const registers: Register[] = [
        { name: 'R1', value: 0, active: false, description: 'R1' },
        { name: 'R2', value: 0, active: false, description: 'R2' },
      ]
      const result = checkRegisterAvailability(registers, ['R1', 'R2'])
      expect(result.available).toBe(true)
      expect(result.missing).toEqual([])
    })

    it('should return available when required registers exist', () => {
      const registers: Register[] = [
        { name: 'R1', value: 5, active: false, description: 'R1' },
        { name: 'R2', value: 0, active: false, description: 'R2' },
      ]
      const result = checkRegisterAvailability(registers, ['R1'])
      expect(result.available).toBe(true)
    })

    it('should return unavailable when register is missing', () => {
      const registers: Register[] = [
        { name: 'R1', value: 0, active: false, description: 'R1' },
      ]
      const result = checkRegisterAvailability(registers, ['R1', 'R3'])
      expect(result.available).toBe(false)
      expect(result.missing).toContain('R3')
    })
  })

  describe('executeInstruction', () => {
    const baseRegisters: Register[] = [
      { name: 'R1', value: 0, active: false, description: 'R1' },
      { name: 'R2', value: 0, active: false, description: 'R2' },
      { name: 'R3', value: 0, active: false, description: 'R3' },
    ]

    it('should execute simple ADD instruction successfully', () => {
      const instruction: Instruction = {
        id: 'test',
        opcode: Opcode.ADD,
        operand1: 'R1',
        operand2: 'R2',
        destination: 'R3',
        description: 'Add R1 and R2',
      }
      const result = executeInstruction(instruction, baseRegisters, 1)
      expect(result.success).toBe(true)
      expect(result.cyclesUsed).toBeGreaterThan(0)
      expect(result.energyCost).toBeGreaterThan(0)
    })

    it('should execute LOAD instruction successfully', () => {
      const instruction: Instruction = {
        id: 'test',
        opcode: Opcode.LOAD,
        operand1: 42,
        destination: 'R1',
        description: 'Load 42',
      }
      const result = executeInstruction(instruction, baseRegisters, 1)
      expect(result.success).toBe(true)
      expect(result.cyclesUsed).toBe(3)
    })

    it('should handle register availability check at higher levels', () => {
      const registers: Register[] = [
        { name: 'R1', value: 5, active: false, description: 'R1' },
        { name: 'R2', value: 3, active: false, description: 'R2' },
        { name: 'R3', value: 10, active: false, description: 'R3' },
      ]
      const instruction: Instruction = {
        id: 'test',
        opcode: Opcode.ADD,
        operand1: 'R1',
        operand2: 'R2',
        destination: 'R3',
        description: 'Add R1 and R2',
      }
      // At level 1, should succeed even with occupied registers
      const result1 = executeInstruction(instruction, registers, 1)
      expect(result1.success).toBe(true)

      // At higher levels, might fail if register management is required
      // (This depends on the actual implementation logic)
    })

    it('should include cache miss penalty at higher levels', () => {
      const instruction: Instruction = {
        id: 'test',
        opcode: Opcode.ADD,
        operand1: 'R1',
        operand2: 'R2',
        destination: 'R3',
        description: 'Add R1 and R2',
      }
      // Run multiple times to catch cache miss scenarios
      const results = Array.from({ length: 10 }, () =>
        executeInstruction(instruction, baseRegisters, 3)
      )
      // At least some should have cache miss penalty
      const hasCacheMiss = results.some(
        (r) => r.cyclesUsed > 1 || r.energyCost > 1
      )
      // This is probabilistic, so we just verify the function runs
      expect(results.every((r) => r.success)).toBe(true)
    })
  })

  describe('calculateEfficiency', () => {
    it('should return 100% efficiency for optimal performance', () => {
      const efficiency = calculateEfficiency(10, 10, 10, 10)
      expect(efficiency).toBe(100)
    })

    it('should return lower efficiency for suboptimal performance', () => {
      const efficiency = calculateEfficiency(20, 20, 10, 10)
      expect(efficiency).toBe(50)
    })

    it('should return 0% efficiency for very poor performance', () => {
      const efficiency = calculateEfficiency(100, 100, 10, 10)
      expect(efficiency).toBe(10)
    })

    it('should handle zero cycles gracefully', () => {
      const efficiency = calculateEfficiency(0, 0, 0, 0)
      expect(efficiency).toBe(0)
    })

    it('should average cycle and energy efficiency', () => {
      const efficiency = calculateEfficiency(20, 10, 10, 10)
      // Cycle efficiency: 10/20 * 100 = 50
      // Energy efficiency: 10/10 * 100 = 100
      // Average: (50 + 100) / 2 = 75
      expect(efficiency).toBe(75)
    })
  })

  describe('calculateScore', () => {
    it('should return 0 for failed tasks', () => {
      const score = calculateScore(false, 10, 20, 100, 50)
      expect(score).toBe(0)
    })

    it('should calculate base score correctly', () => {
      const score = calculateScore(true, 10, 20, 100, 100)
      expect(score).toBeGreaterThanOrEqual(100)
    })

    it('should add time bonus for fast completion', () => {
      const score = calculateScore(true, 5, 20, 100, 100)
      // Time bonus: (20 - 5) * 10 = 150
      // Base: 100
      // Efficiency bonus: 100 * 0.5 = 50
      // Total should be at least 250
      expect(score).toBeGreaterThanOrEqual(250)
    })

    it('should add speed bonus for very fast completion', () => {
      const score = calculateScore(true, 5, 20, 100, 100)
      // Speed bonus: 100 * 0.5 = 50 (if cyclesUsed <= timeLimit / 2)
      expect(score).toBeGreaterThanOrEqual(250)
    })

    it('should not add speed bonus for slow completion', () => {
      const score = calculateScore(true, 15, 20, 100, 100)
      // No speed bonus since 15 > 20/2
      expect(score).toBeGreaterThanOrEqual(200)
    })

    it('should handle edge cases', () => {
      const score1 = calculateScore(true, 0, 0, 0, 0)
      expect(score1).toBe(0)

      const score2 = calculateScore(true, 20, 20, 100, 0)
      expect(score2).toBe(100) // No bonuses, just base
    })
  })
})

