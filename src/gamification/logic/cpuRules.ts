/**
 * CPU Rules
 * Defines CPU simulation rules for gameplay including instruction execution,
 * register constraints, cache penalties, and interrupt handling
 */

import { Register, Instruction, Opcode } from '@/types/cpu'

export interface ExecutionResult {
  success: boolean
  cyclesUsed: number
  energyCost: number
  error?: string
}

/**
 * Calculate cycles required for an instruction
 */
export function getInstructionCycles(opcode: Opcode): number {
  switch (opcode) {
    case Opcode.LOAD:
    case Opcode.STORE:
      return 3 // Memory access takes longer
    case Opcode.ADD:
    case Opcode.SUB:
      return 1
    case Opcode.MUL:
    case Opcode.DIV:
      return 3 // More complex operations
    case Opcode.MOV:
      return 1
    case Opcode.JMP:
    case Opcode.JZ:
    case Opcode.JNZ:
      return 2
    case Opcode.HALT:
      return 1
    default:
      return 1
  }
}

/**
 * Calculate energy cost for an instruction
 */
export function getEnergyCost(opcode: Opcode, registerCount: number): number {
  const baseCost = getInstructionCycles(opcode)
  const registerPenalty = registerCount * 0.5 // More registers = more energy
  return baseCost + registerPenalty
}

/**
 * Check if registers are available
 */
export function checkRegisterAvailability(
  registers: Register[],
  requiredRegisters: string[]
): { available: boolean; missing: string[] } {
  const available = registers.filter((r) => r.value === 0 || !requiredRegisters.includes(r.name))
  const missing = requiredRegisters.filter(
    (req) => !registers.some((r) => r.name === req && (r.value === 0 || r.name === req))
  )

  return {
    available: missing.length === 0,
    missing,
  }
}

/**
 * Execute an instruction and return result
 */
export function executeInstruction(
  instruction: Instruction,
  registers: Register[],
  level: number
): ExecutionResult {
  const cycles = getInstructionCycles(instruction.opcode)
  const registerCount = registers.filter((r) => r.value !== 0).length
  const energyCost = getEnergyCost(instruction.opcode, registerCount)

  // Check register availability for operations that need registers
  if (['ADD', 'SUB', 'MUL', 'DIV'].includes(instruction.opcode)) {
    const requiredRegs: string[] = []
    if (typeof instruction.operand1 === 'string') requiredRegs.push(instruction.operand1)
    if (typeof instruction.operand2 === 'string') requiredRegs.push(instruction.operand2)
    if (instruction.destination) requiredRegs.push(instruction.destination)

    const availability = checkRegisterAvailability(registers, requiredRegs)
    if (!availability.available && level > 1) {
      // In higher levels, require register management
      return {
        success: false,
        cyclesUsed: cycles,
        energyCost: energyCost * 0.5, // Partial energy cost for failed attempt
        error: `Registers not available: ${availability.missing.join(', ')}`,
      }
    }
  }

  // Cache miss penalty (simulated for higher levels)
  const cacheMissPenalty = level > 2 ? Math.random() > 0.7 : false
  const adjustedCycles = cacheMissPenalty ? cycles + 2 : cycles
  const adjustedEnergy = cacheMissPenalty ? energyCost + 1 : energyCost

  return {
    success: true,
    cyclesUsed: adjustedCycles,
    energyCost: adjustedEnergy,
  }
}

/**
 * Calculate efficiency score
 */
export function calculateEfficiency(
  cyclesUsed: number,
  energyUsed: number,
  optimalCycles: number,
  optimalEnergy: number
): number {
  const cycleEfficiency = Math.max(0, (optimalCycles / cyclesUsed) * 100)
  const energyEfficiency = Math.max(0, (optimalEnergy / energyUsed) * 100)
  return (cycleEfficiency + energyEfficiency) / 2
}

/**
 * Calculate score for a task
 */
export function calculateScore(
  success: boolean,
  cyclesUsed: number,
  timeLimit: number,
  basePoints: number,
  efficiency: number
): number {
  if (!success) return 0

  const timeBonus = Math.max(0, timeLimit - cyclesUsed) * 10
  const efficiencyBonus = efficiency * 0.5
  const speedBonus = cyclesUsed <= timeLimit / 2 ? basePoints * 0.5 : 0

  return Math.floor(basePoints + timeBonus + efficiencyBonus + speedBonus)
}

