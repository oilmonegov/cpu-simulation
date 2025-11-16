/**
 * Simulation Engine
 * Core logic for CPU simulation including instruction cycle, data flow, and state management
 */

import {
  CPUState,
  Instruction,
  InstructionPhase,
  Register,
  MemoryLocation,
  ExampleType,
  CalculatorExample,
  TrafficLightExample,
  SimulationState,
  SimulationStep,
  BusTransfer,
  BusType,
  CacheState,
  CacheLevel,
  CacheLine,
} from '@/types/cpu'
import {
  generateCalculatorInstructions,
  generateTrafficLightInstructions,
} from './instructionSet'

export class SimulationEngine {
  private state: SimulationState
  private instructionIndex: number = 0
  private currentInstructions: Instruction[] = []
  private phaseIndex: number = 0
  private phases: InstructionPhase[] = [
    InstructionPhase.FETCH,
    InstructionPhase.DECODE,
    InstructionPhase.EXECUTE,
    InstructionPhase.STORE,
  ]

  constructor() {
    this.state = this.createInitialState()
  }

  /**
   * Create initial simulation state
   */
  private createInitialState(): SimulationState {
    const registers: Register[] = [
      { name: 'R1', value: 0, active: false, description: 'General purpose register 1' },
      { name: 'R2', value: 0, active: false, description: 'General purpose register 2' },
      { name: 'R3', value: 0, active: false, description: 'General purpose register 3 (accumulator)' },
      { name: 'PC', value: 0, active: false, description: 'Program counter' },
      { name: 'IR', value: 0, active: false, description: 'Instruction register' },
    ]

    const memory: MemoryLocation[] = Array.from({ length: 256 }, (_, i) => ({
      address: i,
      value: 0,
      active: false,
      used: false,
    }))

    // Initialize cache hierarchy (L1, L2, L3)
    const cache: CacheState[] = [
      {
        level: CacheLevel.L1,
        lines: Array.from({ length: 8 }, (_, i) => ({
          address: 0,
          value: 0,
          valid: false,
          dirty: false,
          lastAccessed: 0,
        })),
        hits: 0,
        misses: 0,
        size: 8,
      },
      {
        level: CacheLevel.L2,
        lines: Array.from({ length: 16 }, (_, i) => ({
          address: 0,
          value: 0,
          valid: false,
          dirty: false,
          lastAccessed: 0,
        })),
        hits: 0,
        misses: 0,
        size: 16,
      },
      {
        level: CacheLevel.L3,
        lines: Array.from({ length: 32 }, (_, i) => ({
          address: 0,
          value: 0,
          valid: false,
          dirty: false,
          lastAccessed: 0,
        })),
        hits: 0,
        misses: 0,
        size: 32,
      },
    ]

    return {
      cpu: {
        registers,
        memory,
        cache,
        programCounter: 0,
        instructionRegister: null,
        currentPhase: InstructionPhase.IDLE,
        clockCycle: 0,
        isRunning: false,
        isPaused: false,
      },
      currentExample: ExampleType.CALCULATOR,
      speed: 1000,
      showCodeView: true,
      codeViewMode: 'assembly',
      busTransfers: [],
      history: [],
    }
  }

  /**
   * Get current state
   */
  getState(): SimulationState {
    return { ...this.state }
  }

  /**
   * Get current instructions
   */
  getCurrentInstructions(): Instruction[] {
    return [...this.currentInstructions]
  }

  /**
   * Get current instruction index
   */
  getCurrentInstructionIndex(): number {
    return this.instructionIndex
  }

  /**
   * Set example type and generate instructions
   */
  setExample(exampleType: ExampleType, exampleData?: CalculatorExample | TrafficLightExample) {
    this.state.currentExample = exampleType
    this.instructionIndex = 0
    this.phaseIndex = 0

    if (exampleType === ExampleType.CALCULATOR && exampleData) {
      const calcData = exampleData as CalculatorExample
      this.currentInstructions = generateCalculatorInstructions(
        calcData.input1,
        calcData.input2,
        calcData.operation
      )
    } else if (exampleType === ExampleType.TRAFFIC_LIGHT && exampleData) {
      const trafficData = exampleData as TrafficLightExample
      this.currentInstructions = generateTrafficLightInstructions(
        trafficData.currentState,
        trafficData.sensorInput
      )
    }

    // Reset CPU state
    this.state.cpu.programCounter = 0
    this.state.cpu.instructionRegister = null
    this.state.cpu.currentPhase = InstructionPhase.IDLE
    this.state.cpu.clockCycle = 0
    this.state.busTransfers = []
    this.state.history = []
    
    // Reset memory used flags
    this.state.cpu.memory.forEach((mem) => {
      mem.used = false
      mem.active = false
    })
  }

  /**
   * Execute one step of the simulation
   */
  step(): boolean {
    if (this.currentInstructions.length === 0) return false
    if (this.instructionIndex >= this.currentInstructions.length) return false

    const instruction = this.currentInstructions[this.instructionIndex]
    const phase = this.phases[this.phaseIndex]

    this.state.cpu.currentPhase = phase
    this.state.cpu.clockCycle++

    const step: SimulationStep = {
      cycle: this.state.cpu.clockCycle,
      phase,
      instruction,
      registerChanges: [],
      memoryChanges: [],
    }

    switch (phase) {
      case InstructionPhase.FETCH:
        this.executeFetch(instruction, step)
        break
      case InstructionPhase.DECODE:
        this.executeDecode(instruction, step)
        break
      case InstructionPhase.EXECUTE:
        this.executeExecute(instruction, step)
        break
      case InstructionPhase.STORE:
        this.executeStore(instruction, step)
        break
    }

    this.state.history.push(step)

    // Move to next phase
    this.phaseIndex++
    if (this.phaseIndex >= this.phases.length) {
      this.phaseIndex = 0
      this.instructionIndex++
    }

    return this.instructionIndex < this.currentInstructions.length
  }

  /**
   * Fetch phase: Load instruction from memory
   */
  private executeFetch(instruction: Instruction, step: SimulationStep) {
    this.state.cpu.instructionRegister = instruction
    this.state.cpu.programCounter++

    // Update PC register
    const pcReg = this.state.cpu.registers.find((r) => r.name === 'PC')
    if (pcReg) {
      step.registerChanges.push({
        name: 'PC',
        oldValue: pcReg.value,
        newValue: this.state.cpu.programCounter,
      })
      pcReg.value = this.state.cpu.programCounter
      pcReg.active = true
    }

    // Bus transfer
    this.addBusTransfer(BusType.ADDRESS, 'PC', 'Memory', this.state.cpu.programCounter)
    this.addBusTransfer(BusType.DATA, 'Memory', 'IR', 0)
  }

  /**
   * Decode phase: Interpret instruction
   */
  private executeDecode(instruction: Instruction, step: SimulationStep) {
    // Decode operation (simplified - just mark as active)
    const irReg = this.state.cpu.registers.find((r) => r.name === 'IR')
    if (irReg) {
      irReg.active = true
    }
  }

  /**
   * Execute phase: Perform operation
   */
  private executeExecute(instruction: Instruction, step: SimulationStep) {
    const { opcode, operand1, operand2, destination } = instruction

    switch (opcode) {
      case 'LOAD':
        if (typeof operand1 === 'number' && destination) {
          const reg = this.state.cpu.registers.find((r) => r.name === destination)
          if (reg) {
            // For LOAD, if instruction has an address, check cache
            // Otherwise, it's loading a literal value
            if (instruction.address !== undefined) {
              const address = instruction.address
              const cacheResult = this.checkCache(address)
              const memLoc = this.state.cpu.memory.find((m) => m.address === address)
              const memValue = memLoc?.value || operand1
              
              // Mark memory address as used
              if (memLoc) {
                memLoc.used = true
              }
              
              step.registerChanges.push({
                name: destination,
                oldValue: reg.value,
                newValue: memValue,
              })
              reg.value = memValue
              reg.active = true
              
              // Show cache interaction
              if (cacheResult.isHit) {
                this.addBusTransfer(BusType.DATA, cacheResult.level, destination, memValue)
              } else {
                this.addBusTransfer(BusType.DATA, 'Memory', cacheResult.level, memValue)
                this.addBusTransfer(BusType.DATA, cacheResult.level, destination, memValue)
              }
            } else {
              // Loading literal value (no cache involved)
              step.registerChanges.push({
                name: destination,
                oldValue: reg.value,
                newValue: operand1,
              })
              reg.value = operand1
              reg.active = true
              this.addBusTransfer(BusType.DATA, 'CPU', destination, operand1)
            }
          }
        }
        break

      case 'STORE':
        if (destination) {
          const reg = this.state.cpu.registers.find((r) => r.name === destination)
          if (reg && instruction.address !== undefined) {
            const memLoc = this.state.cpu.memory.find((m) => m.address === instruction.address)
            if (memLoc) {
              step.memoryChanges.push({
                address: memLoc.address,
                oldValue: memLoc.value,
                newValue: reg.value,
              })
              memLoc.value = reg.value
              memLoc.active = true
              memLoc.used = true // Mark as used when written to
              
              // Update cache on store
              const cacheResult = this.updateCache(instruction.address, reg.value)
              
              this.addBusTransfer(BusType.ADDRESS, 'CPU', 'Memory', instruction.address)
              if (cacheResult.isHit) {
                this.addBusTransfer(BusType.DATA, destination, cacheResult.level, reg.value)
              } else {
                this.addBusTransfer(BusType.DATA, destination, cacheResult.level, reg.value)
                this.addBusTransfer(BusType.DATA, cacheResult.level, 'Memory', reg.value)
              }
            }
          }
        }
        break

      case 'ADD':
      case 'SUB':
      case 'MUL':
      case 'DIV':
        if (operand1 && operand2 && destination) {
          const reg1 = this.state.cpu.registers.find(
            (r) => r.name === (typeof operand1 === 'string' ? operand1 : 'R1')
          )
          const reg2 = this.state.cpu.registers.find(
            (r) => r.name === (typeof operand2 === 'string' ? operand2 : 'R2')
          )
          const destReg = this.state.cpu.registers.find((r) => r.name === destination)

          if (reg1 && reg2 && destReg) {
            let result: number
            const val1 = typeof operand1 === 'number' ? operand1 : reg1.value
            const val2 = typeof operand2 === 'number' ? operand2 : reg2.value

            switch (opcode) {
              case 'ADD':
                result = val1 + val2
                break
              case 'SUB':
                result = val1 - val2
                break
              case 'MUL':
                result = val1 * val2
                break
              case 'DIV':
                result = val2 !== 0 ? val1 / val2 : 0
                break
              default:
                result = 0
            }

            step.registerChanges.push({
              name: destination,
              oldValue: destReg.value,
              newValue: result,
            })
            destReg.value = result
            destReg.active = true
            reg1.active = true
            reg2.active = true
            
            // Add bus transfers for ALU operations
            const reg1Name = typeof operand1 === 'string' ? operand1 : 'R1'
            const reg2Name = typeof operand2 === 'string' ? operand2 : 'R2'
            this.addBusTransfer(BusType.DATA, reg1Name, 'ALU', val1)
            this.addBusTransfer(BusType.DATA, reg2Name, 'ALU', val2)
            this.addBusTransfer(BusType.CONTROL, 'ControlUnit', 'ALU', 0)
            this.addBusTransfer(BusType.DATA, 'ALU', destination, result)
          }
        }
        break

      case 'MOV':
        if (typeof operand1 === 'number' && destination) {
          const reg = this.state.cpu.registers.find((r) => r.name === destination)
          if (reg) {
            step.registerChanges.push({
              name: destination,
              oldValue: reg.value,
              newValue: operand1,
            })
            reg.value = operand1
            reg.active = true
          }
        }
        break
    }
  }

  /**
   * Store phase: Write results
   */
  private executeStore(instruction: Instruction, step: SimulationStep) {
    // Deactivate registers after operation
    this.state.cpu.registers.forEach((reg) => {
      if (reg.name !== 'PC' && reg.name !== 'IR') {
        reg.active = false
      }
    })

    // Deactivate memory
    this.state.cpu.memory.forEach((mem) => {
      mem.active = false
    })

    // Clear cache active states after a delay
    setTimeout(() => {
      this.state.cpu.cache.forEach((cache) => {
        cache.activeAddress = undefined
        cache.isHit = undefined
      })
    }, this.state.speed)
  }

  /**
   * Check cache for an address (simplified cache lookup)
   * Returns cache level and hit/miss status
   * Checks cache levels in order: L1 -> L2 -> L3
   */
  private checkCache(address: number): { level: string; isHit: boolean } {
    // Clear previous active addresses
    this.state.cpu.cache.forEach((cache) => {
      cache.activeAddress = undefined
      cache.isHit = undefined
    })

    // Check cache levels in order (L1 -> L2 -> L3)
    const cacheLevels = [CacheLevel.L1, CacheLevel.L2, CacheLevel.L3]
    
    for (const level of cacheLevels) {
      const cache = this.state.cpu.cache.find((c) => c.level === level)
      if (!cache) continue

      const line = cache.lines.find((l) => l.valid && l.address === address)
      if (line) {
        // Cache hit at this level
        cache.hits++
        cache.activeAddress = address
        cache.isHit = true
        line.lastAccessed = this.state.cpu.clockCycle
        return { level: cache.level, isHit: true }
      }
    }

    // Cache miss at all levels - allocate in L1 (simplified: use LRU-like replacement)
    const l1Cache = this.state.cpu.cache.find((c) => c.level === CacheLevel.L1)
    if (l1Cache) {
      l1Cache.misses++
      l1Cache.activeAddress = address
      l1Cache.isHit = false

      // Find least recently used line
      const validLines = l1Cache.lines.filter((l) => l.valid)
      const lruLine = validLines.length > 0
        ? validLines.reduce((oldest, current) =>
            current.lastAccessed < oldest.lastAccessed ? current : oldest
          )
        : l1Cache.lines[0]

      // Update cache line
      lruLine.address = address
      lruLine.value = this.state.cpu.memory.find((m) => m.address === address)?.value || 0
      lruLine.valid = true
      lruLine.dirty = false
      lruLine.lastAccessed = this.state.cpu.clockCycle
    }

    return { level: 'L1', isHit: false }
  }

  /**
   * Update cache on write (write-through cache)
   */
  private updateCache(address: number, value: number): { level: string; isHit: boolean } {
    // Clear previous active addresses
    this.state.cpu.cache.forEach((cache) => {
      cache.activeAddress = undefined
      cache.isHit = undefined
    })

    // Check if address is in cache
    for (const cache of this.state.cpu.cache) {
      const line = cache.lines.find((l) => l.valid && l.address === address)
      if (line) {
        // Cache hit - update value
        cache.hits++
        cache.activeAddress = address
        cache.isHit = true
        line.value = value
        line.dirty = true
        line.lastAccessed = this.state.cpu.clockCycle
        return { level: cache.level, isHit: true }
      }
    }

    // Cache miss - allocate in L1
    const l1Cache = this.state.cpu.cache.find((c) => c.level === CacheLevel.L1)
    if (l1Cache) {
      l1Cache.misses++
      l1Cache.activeAddress = address
      l1Cache.isHit = false

      const lruLine = l1Cache.lines.reduce((oldest, current) =>
        current.lastAccessed < oldest.lastAccessed ? current : oldest
      )

      lruLine.address = address
      lruLine.value = value
      lruLine.valid = true
      lruLine.dirty = true
      lruLine.lastAccessed = this.state.cpu.clockCycle
    }

    return { level: 'L1', isHit: false }
  }

  /**
   * Add a bus transfer for visualization
   * Transfers remain active for the duration of the animation (based on speed)
   */
  private addBusTransfer(type: BusType, from: string, to: string, value: number) {
    const transfer: BusTransfer = {
      id: `transfer-${Date.now()}-${Math.random()}`,
      type,
      from,
      to,
      value,
      active: true,
      timestamp: Date.now(),
    }

    this.state.busTransfers.push(transfer)

    // Remove old transfers after animation duration (supports up to 60 seconds)
    // Use speed + buffer to ensure animation completes
    const cleanupDelay = Math.max(500, this.state.speed + 500)
    setTimeout(() => {
      const index = this.state.busTransfers.findIndex((t) => t.id === transfer.id)
      if (index > -1) {
        this.state.busTransfers[index].active = false
      }
    }, cleanupDelay)
  }

  /**
   * Reset simulation
   */
  reset() {
    this.state = this.createInitialState()
    this.instructionIndex = 0
    this.phaseIndex = 0
    this.currentInstructions = []
  }

  /**
   * Set simulation speed
   */
  setSpeed(milliseconds: number) {
    this.state.speed = milliseconds
  }

  /**
   * Toggle code view
   */
  toggleCodeView() {
    this.state.showCodeView = !this.state.showCodeView
  }

  /**
   * Set code view mode
   */
  setCodeViewMode(mode: 'assembly' | 'machine') {
    this.state.codeViewMode = mode
  }
}

