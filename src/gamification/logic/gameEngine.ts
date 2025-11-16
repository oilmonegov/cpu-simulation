/**
 * Game Engine
 * Core game mechanics including task generation, player actions, scoring, and level progression
 */

import {
  GameState,
  GameMode,
  GameTask,
  Register,
  Instruction,
  Opcode,
} from '@/types/cpu'
import { generateCalculatorTask, validateCalculatorTask, getOptimalCalculatorCycles } from './calculatorMode'
import { generateTrafficLightTask, validateTrafficLightTask, getOptimalTrafficLightCycles } from './trafficLightMode'
import { executeInstruction, calculateEfficiency, calculateScore } from './cpuRules'

export class GameEngine {
  private state: GameState

  constructor() {
    this.state = this.createInitialState()
  }

  /**
   * Create initial game state
   */
  private createInitialState(): GameState {
    return {
      mode: GameMode.CALCULATOR,
      level: 1,
      score: 0,
      energy: 100,
      maxEnergy: 100,
      clockCycle: 0,
      taskQueue: [],
      registers: [
        { name: 'R1', value: 0, active: false, description: 'Register 1' },
        { name: 'R2', value: 0, active: false, description: 'Register 2' },
        { name: 'R3', value: 0, active: false, description: 'Register 3 (Accumulator)' },
      ],
      isPlaying: false,
      accuracy: 100,
      efficiency: 100,
      speedBonus: 0,
    }
  }

  /**
   * Get current game state
   */
  getState(): GameState {
    return { ...this.state }
  }

  /**
   * Start the game
   */
  startGame(mode: GameMode) {
    this.state.mode = mode
    this.state.isPlaying = true
    this.state.level = 1
    this.state.score = 0
    this.state.energy = 100
    this.state.clockCycle = 0
    this.state.taskQueue = []
    this.state.accuracy = 100
    this.state.efficiency = 100
    this.state.speedBonus = 0

    // Generate initial tasks
    this.generateNewTask()
  }

  /**
   * Generate a new task and add to queue
   */
  generateNewTask() {
    let task: GameTask

    if (this.state.mode === GameMode.CALCULATOR) {
      task = generateCalculatorTask(this.state.level)
    } else {
      task = generateTrafficLightTask(this.state.level)
    }

    this.state.taskQueue.push(task)
  }

  /**
   * Process a player action (instruction execution)
   */
  processPlayerAction(instruction: Instruction): {
    success: boolean
    cyclesUsed: number
    energyCost: number
    error?: string
  } {
    const result = executeInstruction(instruction, this.state.registers, this.state.level)

    if (result.success) {
      // Update registers based on instruction
      this.executeInstructionOnRegisters(instruction)
      
      // Update game state
      this.state.clockCycle += result.cyclesUsed
      this.state.energy = Math.max(0, this.state.energy - result.energyCost)
      
      // Check if energy depleted
      if (this.state.energy <= 0) {
        this.state.isPlaying = false
      }
    }

    return result
  }

  /**
   * Execute instruction on registers (simplified)
   */
  private executeInstructionOnRegisters(instruction: Instruction) {
    switch (instruction.opcode) {
      case Opcode.LOAD:
        if (typeof instruction.operand1 === 'number' && instruction.destination) {
          const reg = this.state.registers.find((r) => r.name === instruction.destination)
          if (reg) {
            reg.value = instruction.operand1
            reg.active = true
          }
        }
        break

      case Opcode.ADD:
      case Opcode.SUB:
      case Opcode.MUL:
      case Opcode.DIV:
        if (instruction.destination) {
          const reg1 = this.state.registers.find(
            (r) => r.name === (typeof instruction.operand1 === 'string' ? instruction.operand1 : 'R1')
          )
          const reg2 = this.state.registers.find(
            (r) => r.name === (typeof instruction.operand2 === 'string' ? instruction.operand2 : 'R2')
          )
          const destReg = this.state.registers.find((r) => r.name === instruction.destination)

          if (reg1 && reg2 && destReg) {
            const val1 = typeof instruction.operand1 === 'number' ? instruction.operand1 : reg1.value
            const val2 = typeof instruction.operand2 === 'number' ? instruction.operand2 : reg2.value

            switch (instruction.opcode) {
              case Opcode.ADD:
                destReg.value = val1 + val2
                break
              case Opcode.SUB:
                destReg.value = val1 - val2
                break
              case Opcode.MUL:
                destReg.value = val1 * val2
                break
              case Opcode.DIV:
                destReg.value = val2 !== 0 ? Math.floor(val1 / val2) : 0
                break
            }
            destReg.active = true
          }
        }
        break

      case Opcode.MOV:
        if (typeof instruction.operand1 === 'number' && instruction.destination) {
          const reg = this.state.registers.find((r) => r.name === instruction.destination)
          if (reg) {
            reg.value = instruction.operand1
            reg.active = true
          }
        }
        break
    }
  }

  /**
   * Submit task result
   */
  submitTaskResult(taskId: string, result: number | 'RED' | 'YELLOW' | 'GREEN'): {
    success: boolean
    score: number
    completed: boolean
  } {
    const taskIndex = this.state.taskQueue.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) {
      return { success: false, score: 0, completed: false }
    }

    const task = this.state.taskQueue[taskIndex]
    let isValid = false

    if (this.state.mode === GameMode.CALCULATOR && typeof result === 'number') {
      isValid = validateCalculatorTask(task, result)
    } else if (this.state.mode === GameMode.TRAFFIC_LIGHT && typeof result === 'string') {
      isValid = validateTrafficLightTask(task, result)
    }

    if (!isValid) {
      // Task failed
      this.state.taskQueue.splice(taskIndex, 1)
      this.updateAccuracy(false)
      return { success: false, score: 0, completed: true }
    }

    // Task succeeded - calculate score
    const optimalCycles =
      this.state.mode === GameMode.CALCULATOR
        ? getOptimalCalculatorCycles(task)
        : getOptimalTrafficLightCycles(task)

    const efficiency = calculateEfficiency(
      this.state.clockCycle,
      this.state.maxEnergy - this.state.energy,
      optimalCycles,
      optimalCycles * 2
    )

    const score = calculateScore(
      true,
      this.state.clockCycle,
      task.timeLimit,
      task.points,
      efficiency
    )

    this.state.score += score
    this.state.taskQueue.splice(taskIndex, 1)
    this.updateAccuracy(true)
    this.state.efficiency = efficiency

    // Generate new task if queue is getting low
    if (this.state.taskQueue.length < 2) {
      this.generateNewTask()
    }

    // Check for level up
    if (this.state.score >= this.state.level * 1000) {
      this.levelUp()
    }

    return { success: true, score, completed: true }
  }

  /**
   * Update accuracy metric
   */
  private updateAccuracy(success: boolean) {
    // Simplified accuracy calculation
    const totalTasks = this.state.taskQueue.length + 1
    const currentAccuracy = this.state.accuracy
    const newAccuracy = success
      ? Math.min(100, currentAccuracy + 1)
      : Math.max(0, currentAccuracy - 5)
    this.state.accuracy = newAccuracy
  }

  /**
   * Level up
   */
  private levelUp() {
    this.state.level++
    this.state.energy = this.state.maxEnergy // Refill energy
    this.state.speedBonus += 10
  }

  /**
   * Advance clock cycle (for time-based mechanics)
   */
  advanceClock() {
    if (!this.state.isPlaying) return

    this.state.clockCycle++

    // Check for task timeouts
    this.state.taskQueue.forEach((task) => {
      if (this.state.clockCycle > task.timeLimit) {
        // Task expired
        const index = this.state.taskQueue.findIndex((t) => t.id === task.id)
        if (index > -1) {
          this.state.taskQueue.splice(index, 1)
          this.updateAccuracy(false)
        }
      }
    })

    // Generate new tasks periodically
    if (this.state.taskQueue.length < 3 && Math.random() > 0.7) {
      this.generateNewTask()
    }
  }

  /**
   * Reset game
   */
  reset() {
    this.state = this.createInitialState()
  }

  /**
   * Pause/Resume game
   */
  togglePause() {
    this.state.isPlaying = !this.state.isPlaying
  }
}

