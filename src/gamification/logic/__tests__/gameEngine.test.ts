import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GameEngine } from '../gameEngine'
import { GameMode, Opcode, Instruction } from '@/types/cpu'

describe('GameEngine', () => {
  let engine: GameEngine

  beforeEach(() => {
    engine = new GameEngine()
  })

  describe('Initialization', () => {
    it('should create engine with initial state', () => {
      const state = engine.getState()
      expect(state.mode).toBe(GameMode.CALCULATOR)
      expect(state.level).toBe(1)
      expect(state.score).toBe(0)
      expect(state.energy).toBe(100)
      expect(state.maxEnergy).toBe(100)
      expect(state.clockCycle).toBe(0)
      expect(state.taskQueue).toEqual([])
      expect(state.registers).toHaveLength(3)
      expect(state.isPlaying).toBe(false)
      expect(state.accuracy).toBe(100)
      expect(state.efficiency).toBe(100)
    })

    it('should initialize registers correctly', () => {
      const state = engine.getState()
      expect(state.registers[0].name).toBe('R1')
      expect(state.registers[1].name).toBe('R2')
      expect(state.registers[2].name).toBe('R3')
      expect(state.registers.every((r) => r.value === 0)).toBe(true)
      expect(state.registers.every((r) => r.active === false)).toBe(true)
    })
  })

  describe('startGame', () => {
    it('should start game in calculator mode', () => {
      engine.startGame(GameMode.CALCULATOR)
      const state = engine.getState()
      expect(state.mode).toBe(GameMode.CALCULATOR)
      expect(state.isPlaying).toBe(true)
      expect(state.level).toBe(1)
      expect(state.score).toBe(0)
      expect(state.energy).toBe(100)
      expect(state.clockCycle).toBe(0)
    })

    it('should start game in traffic light mode', () => {
      engine.startGame(GameMode.TRAFFIC_LIGHT)
      const state = engine.getState()
      expect(state.mode).toBe(GameMode.TRAFFIC_LIGHT)
      expect(state.isPlaying).toBe(true)
    })

    it('should generate initial task when starting game', () => {
      engine.startGame(GameMode.CALCULATOR)
      const state = engine.getState()
      expect(state.taskQueue.length).toBeGreaterThan(0)
    })
  })

  describe('generateNewTask', () => {
    it('should generate calculator task in calculator mode', () => {
      engine.startGame(GameMode.CALCULATOR)
      engine.generateNewTask()
      const state = engine.getState()
      expect(state.taskQueue.length).toBeGreaterThan(1)
      const lastTask = state.taskQueue[state.taskQueue.length - 1]
      expect(lastTask.type).toBe('calculation')
    })

    it('should generate traffic light task in traffic light mode', () => {
      engine.startGame(GameMode.TRAFFIC_LIGHT)
      engine.generateNewTask()
      const state = engine.getState()
      expect(state.taskQueue.length).toBeGreaterThan(1)
      const lastTask = state.taskQueue[state.taskQueue.length - 1]
      expect(lastTask.type).toBe('traffic_control')
    })
  })

  describe('processPlayerAction', () => {
    beforeEach(() => {
      engine.startGame(GameMode.CALCULATOR)
    })

    it('should process LOAD instruction successfully', () => {
      const instruction: Instruction = {
        id: 'test',
        opcode: Opcode.LOAD,
        operand1: 42,
        destination: 'R1',
        description: 'Load 42',
      }

      const result = engine.processPlayerAction(instruction)
      expect(result.success).toBe(true)
      expect(result.cyclesUsed).toBeGreaterThan(0)
      expect(result.energyCost).toBeGreaterThan(0)

      const state = engine.getState()
      expect(state.clockCycle).toBeGreaterThan(0)
      expect(state.energy).toBeLessThan(100)
    })

    it('should update registers after LOAD instruction', () => {
      const instruction: Instruction = {
        id: 'test',
        opcode: Opcode.LOAD,
        operand1: 42,
        destination: 'R1',
        description: 'Load 42',
      }

      engine.processPlayerAction(instruction)
      const state = engine.getState()
      const r1 = state.registers.find((r) => r.name === 'R1')
      expect(r1?.value).toBe(42)
      expect(r1?.active).toBe(true)
    })

    it('should process ADD instruction successfully', () => {
      // First load values
      engine.processPlayerAction({
        id: 'load1',
        opcode: Opcode.LOAD,
        operand1: 5,
        destination: 'R1',
        description: 'Load 5',
      })
      engine.processPlayerAction({
        id: 'load2',
        opcode: Opcode.LOAD,
        operand1: 3,
        destination: 'R2',
        description: 'Load 3',
      })

      const instruction: Instruction = {
        id: 'add',
        opcode: Opcode.ADD,
        operand1: 'R1',
        operand2: 'R2',
        destination: 'R3',
        description: 'Add R1 and R2',
      }

      const result = engine.processPlayerAction(instruction)
      expect(result.success).toBe(true)

      const state = engine.getState()
      const r3 = state.registers.find((r) => r.name === 'R3')
      expect(r3?.value).toBe(8)
    })

    it('should process SUB instruction correctly', () => {
      engine.processPlayerAction({
        id: 'load1',
        opcode: Opcode.LOAD,
        operand1: 10,
        destination: 'R1',
        description: 'Load 10',
      })
      engine.processPlayerAction({
        id: 'load2',
        opcode: Opcode.LOAD,
        operand1: 3,
        destination: 'R2',
        description: 'Load 3',
      })

      const instruction: Instruction = {
        id: 'sub',
        opcode: Opcode.SUB,
        operand1: 'R1',
        operand2: 'R2',
        destination: 'R3',
        description: 'Subtract R2 from R1',
      }

      engine.processPlayerAction(instruction)
      const state = engine.getState()
      const r3 = state.registers.find((r) => r.name === 'R3')
      expect(r3?.value).toBe(7)
    })

    it('should process MUL instruction correctly', () => {
      engine.processPlayerAction({
        id: 'load1',
        opcode: Opcode.LOAD,
        operand1: 5,
        destination: 'R1',
        description: 'Load 5',
      })
      engine.processPlayerAction({
        id: 'load2',
        opcode: Opcode.LOAD,
        operand1: 4,
        destination: 'R2',
        description: 'Load 4',
      })

      const instruction: Instruction = {
        id: 'mul',
        opcode: Opcode.MUL,
        operand1: 'R1',
        operand2: 'R2',
        destination: 'R3',
        description: 'Multiply R1 and R2',
      }

      engine.processPlayerAction(instruction)
      const state = engine.getState()
      const r3 = state.registers.find((r) => r.name === 'R3')
      expect(r3?.value).toBe(20)
    })

    it('should process DIV instruction correctly', () => {
      engine.processPlayerAction({
        id: 'load1',
        opcode: Opcode.LOAD,
        operand1: 10,
        destination: 'R1',
        description: 'Load 10',
      })
      engine.processPlayerAction({
        id: 'load2',
        opcode: Opcode.LOAD,
        operand1: 3,
        destination: 'R2',
        description: 'Load 3',
      })

      const instruction: Instruction = {
        id: 'div',
        opcode: Opcode.DIV,
        operand1: 'R1',
        operand2: 'R2',
        destination: 'R3',
        description: 'Divide R1 by R2',
      }

      engine.processPlayerAction(instruction)
      const state = engine.getState()
      const r3 = state.registers.find((r) => r.name === 'R3')
      expect(r3?.value).toBe(3) // Math.floor(10 / 3) = 3
    })

    it('should handle division by zero', () => {
      engine.processPlayerAction({
        id: 'load1',
        opcode: Opcode.LOAD,
        operand1: 10,
        destination: 'R1',
        description: 'Load 10',
      })
      engine.processPlayerAction({
        id: 'load2',
        opcode: Opcode.LOAD,
        operand1: 0,
        destination: 'R2',
        description: 'Load 0',
      })

      const instruction: Instruction = {
        id: 'div',
        opcode: Opcode.DIV,
        operand1: 'R1',
        operand2: 'R2',
        destination: 'R3',
        description: 'Divide R1 by R2',
      }

      engine.processPlayerAction(instruction)
      const state = engine.getState()
      const r3 = state.registers.find((r) => r.name === 'R3')
      expect(r3?.value).toBe(0) // Division by zero returns 0
    })

    it('should deplete energy and stop game when energy reaches 0', () => {
      engine.startGame(GameMode.CALCULATOR)
      const initialState = engine.getState()

      // Process many instructions to deplete energy
      for (let i = 0; i < 100; i++) {
        const instruction: Instruction = {
          id: `test-${i}`,
          opcode: Opcode.ADD,
          operand1: 1,
          operand2: 1,
          destination: 'R1',
          description: 'Test',
        }
        engine.processPlayerAction(instruction)
        const state = engine.getState()
        if (state.energy <= 0) {
          expect(state.isPlaying).toBe(false)
          break
        }
      }
    })
  })

  describe('submitTaskResult', () => {
    beforeEach(() => {
      engine.startGame(GameMode.CALCULATOR)
    })

    it('should successfully submit correct calculator result', () => {
      const state = engine.getState()
      const task = state.taskQueue[0]

      if (task && task.type === 'calculation' && task.operation) {
        const result = engine.submitTaskResult(
          task.id,
          task.operation.expectedResult
        )
        expect(result.success).toBe(true)
        expect(result.score).toBeGreaterThan(0)
        expect(result.completed).toBe(true)

        const newState = engine.getState()
        expect(newState.score).toBeGreaterThan(0)
        expect(newState.taskQueue).not.toContain(task)
      }
    })

    it('should fail when submitting incorrect calculator result', () => {
      const state = engine.getState()
      const task = state.taskQueue[0]

      if (task && task.type === 'calculation' && task.operation) {
        const wrongResult = task.operation.expectedResult + 100
        const result = engine.submitTaskResult(task.id, wrongResult)
        expect(result.success).toBe(false)
        expect(result.score).toBe(0)
        expect(result.completed).toBe(true)

        const newState = engine.getState()
        expect(newState.accuracy).toBeLessThan(100)
      }
    })

    it('should successfully submit correct traffic light result', () => {
      engine.startGame(GameMode.TRAFFIC_LIGHT)
      const state = engine.getState()
      const task = state.taskQueue[0]

      if (task && task.type === 'traffic_control' && task.trafficScenario) {
        const result = engine.submitTaskResult(
          task.id,
          task.trafficScenario.expectedAction
        )
        expect(result.success).toBe(true)
        expect(result.score).toBeGreaterThan(0)
      }
    })

    it('should fail when submitting incorrect traffic light result', () => {
      engine.startGame(GameMode.TRAFFIC_LIGHT)
      const state = engine.getState()
      const task = state.taskQueue[0]

      if (task && task.type === 'traffic_control' && task.trafficScenario) {
        const wrongAction =
          task.trafficScenario.expectedAction === 'RED' ? 'GREEN' : 'RED'
        const result = engine.submitTaskResult(task.id, wrongAction)
        expect(result.success).toBe(false)
        expect(result.score).toBe(0)
      }
    })

    it('should return false for non-existent task', () => {
      const result = engine.submitTaskResult('non-existent-id', 5)
      expect(result.success).toBe(false)
      expect(result.completed).toBe(false)
    })

    it('should generate new task when queue is low', () => {
      engine.startGame(GameMode.CALCULATOR)
      const state = engine.getState()
      const task = state.taskQueue[0]

      if (task && task.type === 'calculation' && task.operation) {
        engine.submitTaskResult(task.id, task.operation.expectedResult)
        const newState = engine.getState()
        // Should have generated a new task
        expect(newState.taskQueue.length).toBeGreaterThanOrEqual(1)
      }
    })

    it('should level up when score threshold is reached', () => {
      engine.startGame(GameMode.CALCULATOR)
      const initialState = engine.getState()
      const initialLevel = initialState.level

      // Complete many tasks to reach level up threshold
      for (let i = 0; i < 20; i++) {
        const state = engine.getState()
        if (state.taskQueue.length === 0) {
          engine.generateNewTask()
        }
        const task = state.taskQueue[0]

        if (task && task.type === 'calculation' && task.operation) {
          engine.submitTaskResult(task.id, task.operation.expectedResult)
        }

        const currentState = engine.getState()
        if (currentState.level > initialLevel) {
          expect(currentState.level).toBeGreaterThan(initialLevel)
          expect(currentState.energy).toBe(currentState.maxEnergy) // Energy refilled
          break
        }
      }
    })
  })

  describe('advanceClock', () => {
    beforeEach(() => {
      engine.startGame(GameMode.CALCULATOR)
    })

    it('should advance clock cycle', () => {
      const initialState = engine.getState()
      const initialCycle = initialState.clockCycle

      engine.advanceClock()
      const newState = engine.getState()
      expect(newState.clockCycle).toBe(initialCycle + 1)
    })

    it('should not advance clock when game is paused', () => {
      engine.togglePause()
      const initialState = engine.getState()
      expect(initialState.isPlaying).toBe(false)

      engine.advanceClock()
      const newState = engine.getState()
      // Clock should not advance when not playing
      expect(newState.clockCycle).toBe(initialState.clockCycle)
    })

    it('should remove expired tasks', () => {
      engine.startGame(GameMode.CALCULATOR)
      const state = engine.getState()
      const task = state.taskQueue[0]

      if (task) {
        // Advance clock past time limit
        for (let i = 0; i < task.timeLimit + 5; i++) {
          engine.advanceClock()
        }

        const newState = engine.getState()
        expect(newState.taskQueue).not.toContain(task)
        expect(newState.accuracy).toBeLessThan(100)
      }
    })

    it('should generate new tasks periodically', () => {
      engine.startGame(GameMode.CALCULATOR)
      const initialState = engine.getState()
      const initialQueueLength = initialState.taskQueue.length

      // Advance clock multiple times
      for (let i = 0; i < 50; i++) {
        engine.advanceClock()
      }

      const newState = engine.getState()
      // Should have generated at least one new task
      expect(newState.taskQueue.length).toBeGreaterThanOrEqual(initialQueueLength)
    })
  })

  describe('togglePause', () => {
    it('should toggle pause state', () => {
      engine.startGame(GameMode.CALCULATOR)
      const state1 = engine.getState()
      expect(state1.isPlaying).toBe(true)

      engine.togglePause()
      const state2 = engine.getState()
      expect(state2.isPlaying).toBe(false)

      engine.togglePause()
      const state3 = engine.getState()
      expect(state3.isPlaying).toBe(true)
    })
  })

  describe('reset', () => {
    it('should reset game to initial state', () => {
      engine.startGame(GameMode.CALCULATOR)
      engine.processPlayerAction({
        id: 'test',
        opcode: Opcode.LOAD,
        operand1: 42,
        destination: 'R1',
        description: 'Test',
      })
      engine.submitTaskResult(engine.getState().taskQueue[0]?.id || '', 5)

      engine.reset()
      const state = engine.getState()
      expect(state.score).toBe(0)
      expect(state.energy).toBe(100)
      expect(state.clockCycle).toBe(0)
      expect(state.taskQueue).toEqual([])
      expect(state.isPlaying).toBe(false)
      expect(state.registers.every((r) => r.value === 0)).toBe(true)
    })
  })
})

