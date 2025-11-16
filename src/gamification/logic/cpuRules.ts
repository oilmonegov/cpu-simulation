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
 * Check if required registers are available for use.
 * 
 * A register is considered "available" if:
 * - It exists in the register set
 * - It can be used (either empty or already contains needed value)
 * 
 * In higher game levels, registers must be managed (cleared before reuse).
 * 
 * @param registers - Array of all available registers
 * @param requiredRegisters - Array of register names needed for the operation
 * @returns Object indicating availability and any missing registers
 */
export function checkRegisterAvailability(
  registers: Register[],
  requiredRegisters: string[]
): { available: boolean; missing: string[] } {
  // Find registers that exist in the register set
  const existingRegisters = registers.filter((r) => requiredRegisters.includes(r.name))
  
  // Check which required registers are missing from the register set
  const missing = requiredRegisters.filter(
    (req) => !registers.some((r) => r.name === req)
  )

  // Registers are available if all required registers exist
  // (In higher levels, additional checks may be needed for register management)
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
  // Higher levels introduce cache misses to teach cache management
  const CACHE_MISS_PROBABILITY = 0.7
  const CACHE_MISS_CYCLE_PENALTY = 2
  const CACHE_MISS_ENERGY_PENALTY = 1
  
  const cacheMissPenalty = level > 2 ? Math.random() > CACHE_MISS_PROBABILITY : false
  const adjustedCycles = cacheMissPenalty ? cycles + CACHE_MISS_CYCLE_PENALTY : cycles
  const adjustedEnergy = cacheMissPenalty ? energyCost + CACHE_MISS_ENERGY_PENALTY : energyCost

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
  const calculateRatio = (optimal: number, actual: number) => {
    if (optimal <= 0 || actual <= 0) return 0
    return (optimal / actual) * 100
  }

  const cycleEfficiency = Math.min(100, Math.max(0, calculateRatio(optimalCycles, cyclesUsed)))
  const energyEfficiency = Math.min(100, Math.max(0, calculateRatio(optimalEnergy, energyUsed)))
  return (cycleEfficiency + energyEfficiency) / 2
}

/**
 * Calculate score for a completed task.
 * 
 * Scoring formula:
 * - Base points: Points awarded for task completion
 * - Time bonus: Extra points for completing quickly (10 points per cycle saved)
 * - Efficiency bonus: Points based on energy/cycle efficiency (0.5x efficiency percentage)
 * - Speed bonus: 50% base points if completed in half the time limit
 * 
 * @param success - Whether the task was completed successfully
 * @param cyclesUsed - Number of clock cycles used
 * @param timeLimit - Maximum cycles allowed for the task
 * @param basePoints - Base points for completing the task
 * @param efficiency - Efficiency percentage (0-100)
 * @returns Total score for the task
 */
export function calculateScore(
  success: boolean,
  cyclesUsed: number,
  timeLimit: number,
  basePoints: number,
  efficiency: number
): number {
  if (!success) return 0

  const TIME_BONUS_MULTIPLIER = 10
  const EFFICIENCY_BONUS_MULTIPLIER = 0.5
  const SPEED_BONUS_THRESHOLD = 0.5 // Half of time limit
  const SPEED_BONUS_MULTIPLIER = 0.5 // 50% of base points

  const timeBonus = Math.max(0, timeLimit - cyclesUsed) * TIME_BONUS_MULTIPLIER
  const efficiencyBonus = efficiency * EFFICIENCY_BONUS_MULTIPLIER
  const speedBonus = cyclesUsed <= timeLimit * SPEED_BONUS_THRESHOLD 
    ? basePoints * SPEED_BONUS_MULTIPLIER 
    : 0

  return Math.floor(basePoints + timeBonus + efficiencyBonus + speedBonus)
}

