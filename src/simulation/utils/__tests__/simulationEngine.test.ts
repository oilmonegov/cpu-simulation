import { describe, it, expect, beforeEach } from 'vitest'
import { SimulationEngine } from '../simulationEngine'
import { ExampleType, InstructionPhase, Opcode } from '@/types/cpu'

describe('SimulationEngine', () => {
  let engine: SimulationEngine

  beforeEach(() => {
    engine = new SimulationEngine()
  })

  describe('Initialization', () => {
    it('should create engine with initial state', () => {
      const state = engine.getState()
      expect(state.cpu).toBeDefined()
      expect(state.cpu.registers).toHaveLength(5) // R1, R2, R3, PC, IR
      expect(state.cpu.memory).toHaveLength(256)
      expect(state.cpu.programCounter).toBe(0)
      expect(state.cpu.instructionRegister).toBeNull()
      expect(state.cpu.currentPhase).toBe(InstructionPhase.IDLE)
      expect(state.cpu.clockCycle).toBe(0)
      expect(state.cpu.isRunning).toBe(false)
      expect(state.cpu.isPaused).toBe(false)
      expect(state.currentExample).toBe(ExampleType.CALCULATOR)
      expect(state.speed).toBe(1000)
      expect(state.showCodeView).toBe(false)
      expect(state.codeViewMode).toBe('assembly')
      expect(state.busTransfers).toEqual([])
      expect(state.history).toEqual([])
    })

    it('should initialize registers correctly', () => {
      const state = engine.getState()
      const registerNames = state.cpu.registers.map((r) => r.name)
      expect(registerNames).toContain('R1')
      expect(registerNames).toContain('R2')
      expect(registerNames).toContain('R3')
      expect(registerNames).toContain('PC')
      expect(registerNames).toContain('IR')

      state.cpu.registers.forEach((reg) => {
        expect(reg.value).toBe(0)
        expect(reg.active).toBe(false)
        expect(reg.description).toBeDefined()
      })
    })

    it('should initialize memory correctly', () => {
      const state = engine.getState()
      expect(state.cpu.memory).toHaveLength(256)
      state.cpu.memory.forEach((mem, index) => {
        expect(mem.address).toBe(index)
        expect(mem.value).toBe(0)
        expect(mem.active).toBe(false)
      })
    })
  })

  describe('setExample', () => {
    it('should set calculator example', () => {
      engine.setExample(ExampleType.CALCULATOR, {
        input1: 5,
        input2: 3,
        operation: '+',
        result: null,
        steps: [],
      })

      const state = engine.getState()
      expect(state.currentExample).toBe(ExampleType.CALCULATOR)
      expect(engine.getCurrentInstructions().length).toBeGreaterThan(0)
    })

    it('should set traffic light example', () => {
      engine.setExample(ExampleType.TRAFFIC_LIGHT, {
        currentState: 'RED',
        timer: 0,
        sensorInput: true,
        steps: [],
      })

      const state = engine.getState()
      expect(state.currentExample).toBe(ExampleType.TRAFFIC_LIGHT)
      expect(engine.getCurrentInstructions().length).toBeGreaterThan(0)
    })

    it('should reset instruction index when setting example', () => {
      engine.setExample(ExampleType.CALCULATOR, {
        input1: 5,
        input2: 3,
        operation: '+',
        result: null,
        steps: [],
      })

      // Execute some steps
      engine.step()
      engine.step()

      // Set new example
      engine.setExample(ExampleType.CALCULATOR, {
        input1: 10,
        input2: 5,
        operation: '-',
        result: null,
        steps: [],
      })

      expect(engine.getCurrentInstructionIndex()).toBe(0)
    })

    it('should reset CPU state when setting example', () => {
      engine.setExample(ExampleType.CALCULATOR, {
        input1: 5,
        input2: 3,
        operation: '+',
        result: null,
        steps: [],
      })

      // Execute some steps to modify state
      engine.step()
      engine.step()

      const stateBefore = engine.getState()

      // Set new example
      engine.setExample(ExampleType.CALCULATOR, {
        input1: 10,
        input2: 5,
        operation: '-',
        result: null,
        steps: [],
      })

      const stateAfter = engine.getState()
      expect(stateAfter.cpu.programCounter).toBe(0)
      expect(stateAfter.cpu.instructionRegister).toBeNull()
      expect(stateAfter.cpu.currentPhase).toBe(InstructionPhase.IDLE)
      expect(stateAfter.cpu.clockCycle).toBe(0)
      expect(stateAfter.busTransfers).toEqual([])
      expect(stateAfter.history).toEqual([])
    })
  })

  describe('step', () => {
    beforeEach(() => {
      engine.setExample(ExampleType.CALCULATOR, {
        input1: 5,
        input2: 3,
        operation: '+',
        result: null,
        steps: [],
      })
    })

    it('should return false when no instructions are set', () => {
      const newEngine = new SimulationEngine()
      expect(newEngine.step()).toBe(false)
    })

    it('should execute FETCH phase', () => {
      const result = engine.step()
      expect(result).toBe(true)

      const state = engine.getState()
      expect(state.cpu.currentPhase).toBe(InstructionPhase.FETCH)
      expect(state.cpu.clockCycle).toBe(1)
      expect(state.cpu.instructionRegister).toBeDefined()
      expect(state.cpu.programCounter).toBeGreaterThan(0)
    })

    it('should execute DECODE phase after FETCH', () => {
      engine.step() // FETCH
      const result = engine.step() // DECODE

      expect(result).toBe(true)
      const state = engine.getState()
      expect(state.cpu.currentPhase).toBe(InstructionPhase.DECODE)
    })

    it('should execute EXECUTE phase after DECODE', () => {
      engine.step() // FETCH
      engine.step() // DECODE
      const result = engine.step() // EXECUTE

      expect(result).toBe(true)
      const state = engine.getState()
      expect(state.cpu.currentPhase).toBe(InstructionPhase.EXECUTE)
    })

    it('should execute STORE phase after EXECUTE', () => {
      engine.step() // FETCH
      engine.step() // DECODE
      engine.step() // EXECUTE
      const result = engine.step() // STORE

      expect(result).toBe(true)
      const state = engine.getState()
      expect(state.cpu.currentPhase).toBe(InstructionPhase.STORE)
    })

    it('should move to next instruction after completing all phases', () => {
      const initialIndex = engine.getCurrentInstructionIndex()

      // Complete all phases for first instruction
      engine.step() // FETCH
      engine.step() // DECODE
      engine.step() // EXECUTE
      engine.step() // STORE

      expect(engine.getCurrentInstructionIndex()).toBe(initialIndex + 1)
    })

    it('should update program counter during FETCH', () => {
      const stateBefore = engine.getState()
      const pcBefore = stateBefore.cpu.programCounter

      engine.step() // FETCH

      const stateAfter = engine.getState()
      expect(stateAfter.cpu.programCounter).toBe(pcBefore + 1)
    })

    it('should update PC register during FETCH', () => {
      engine.step() // FETCH

      const state = engine.getState()
      const pcReg = state.cpu.registers.find((r) => r.name === 'PC')
      expect(pcReg).toBeDefined()
      expect(pcReg?.value).toBe(state.cpu.programCounter)
      expect(pcReg?.active).toBe(true)
    })

    it('should create bus transfers during execution', () => {
      engine.step() // FETCH

      const state = engine.getState()
      expect(state.busTransfers.length).toBeGreaterThan(0)
    })

    it('should add steps to history', () => {
      const stateBefore = engine.getState()
      expect(stateBefore.history.length).toBe(0)

      engine.step()

      const stateAfter = engine.getState()
      expect(stateAfter.history.length).toBe(1)
      expect(stateAfter.history[0].cycle).toBe(1)
      expect(stateAfter.history[0].phase).toBe(InstructionPhase.FETCH)
    })

    it('should execute LOAD instruction correctly', () => {
      // Step through to EXECUTE phase of first LOAD instruction
      engine.step() // FETCH
      engine.step() // DECODE
      engine.step() // EXECUTE

      const state = engine.getState()
      const instructions = engine.getCurrentInstructions()
      const firstInstruction = instructions[0]

      if (firstInstruction.opcode === Opcode.LOAD && firstInstruction.destination) {
        const reg = state.cpu.registers.find((r) => r.name === firstInstruction.destination)
        expect(reg).toBeDefined()
        if (typeof firstInstruction.operand1 === 'number') {
          expect(reg?.value).toBe(firstInstruction.operand1)
          expect(reg?.active).toBe(true)
        }
      }
    })

    it('should return false when all instructions are complete', () => {
      const instructions = engine.getCurrentInstructions()
      const totalPhases = instructions.length * 4 // Each instruction has 4 phases

      // Execute all phases
      for (let i = 0; i < totalPhases; i++) {
        engine.step()
      }

      // Next step should return false
      expect(engine.step()).toBe(false)
    })

    it('should increment clock cycle on each step', () => {
      const cycles = [1, 2, 3, 4]
      cycles.forEach((expectedCycle) => {
        engine.step()
        const state = engine.getState()
        expect(state.cpu.clockCycle).toBe(expectedCycle)
      })
    })
  })

  describe('reset', () => {
    it('should reset to initial state', () => {
      engine.setExample(ExampleType.CALCULATOR, {
        input1: 5,
        input2: 3,
        operation: '+',
        result: null,
        steps: [],
      })

      // Modify state
      engine.step()
      engine.step()

      engine.reset()

      const state = engine.getState()
      expect(state.cpu.programCounter).toBe(0)
      expect(state.cpu.instructionRegister).toBeNull()
      expect(state.cpu.currentPhase).toBe(InstructionPhase.IDLE)
      expect(state.cpu.clockCycle).toBe(0)
      expect(state.busTransfers).toEqual([])
      expect(state.history).toEqual([])
      expect(engine.getCurrentInstructions()).toEqual([])
      expect(engine.getCurrentInstructionIndex()).toBe(0)
    })
  })

  describe('setSpeed', () => {
    it('should update simulation speed', () => {
      engine.setSpeed(500)
      const state = engine.getState()
      expect(state.speed).toBe(500)
    })
  })

  describe('toggleCodeView', () => {
    it('should toggle code view', () => {
      const state1 = engine.getState()
      expect(state1.showCodeView).toBe(false)

      engine.toggleCodeView()
      const state2 = engine.getState()
      expect(state2.showCodeView).toBe(true)

      engine.toggleCodeView()
      const state3 = engine.getState()
      expect(state3.showCodeView).toBe(false)
    })
  })

  describe('setCodeViewMode', () => {
    it('should set code view mode to assembly', () => {
      engine.setCodeViewMode('assembly')
      const state = engine.getState()
      expect(state.codeViewMode).toBe('assembly')
    })

    it('should set code view mode to machine', () => {
      engine.setCodeViewMode('machine')
      const state = engine.getState()
      expect(state.codeViewMode).toBe('machine')
    })
  })

  describe('getCurrentInstructions', () => {
    it('should return empty array initially', () => {
      const instructions = engine.getCurrentInstructions()
      expect(instructions).toEqual([])
    })

    it('should return instructions after setting example', () => {
      engine.setExample(ExampleType.CALCULATOR, {
        input1: 5,
        input2: 3,
        operation: '+',
        result: null,
        steps: [],
      })

      const instructions = engine.getCurrentInstructions()
      expect(instructions.length).toBeGreaterThan(0)
    })
  })

  describe('getCurrentInstructionIndex', () => {
    it('should return 0 initially', () => {
      expect(engine.getCurrentInstructionIndex()).toBe(0)
    })

    it('should return correct index after steps', () => {
      engine.setExample(ExampleType.CALCULATOR, {
        input1: 5,
        input2: 3,
        operation: '+',
        result: null,
        steps: [],
      })

      // Complete first instruction (4 phases)
      engine.step()
      engine.step()
      engine.step()
      engine.step()

      expect(engine.getCurrentInstructionIndex()).toBe(1)
    })
  })
})

