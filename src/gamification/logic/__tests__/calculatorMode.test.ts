import { describe, it, expect, vi } from 'vitest'
import {
  generateCalculatorTask,
  validateCalculatorTask,
  getOptimalCalculatorCycles,
} from '../calculatorMode'
import { GameTask } from '@/types/cpu'

describe('Calculator Mode', () => {
  describe('generateCalculatorTask', () => {
    it('should generate a valid calculator task', () => {
      const task = generateCalculatorTask(1)
      expect(task).toBeDefined()
      expect(task.type).toBe('calculation')
      expect(task.operation).toBeDefined()
      expect(task.operation?.operand1).toBeGreaterThan(0)
      expect(task.operation?.operand2).toBeGreaterThan(0)
      expect(['+', '-', '*', '/']).toContain(task.operation?.operator)
      expect(task.operation?.expectedResult).toBeDefined()
      expect(task.id).toBeDefined()
      expect(task.points).toBeGreaterThan(0)
      expect(task.timeLimit).toBeGreaterThan(0)
    })

    it('should generate tasks with increasing difficulty at higher levels', () => {
      const task1 = generateCalculatorTask(1)
      const task5 = generateCalculatorTask(5)
      const task10 = generateCalculatorTask(10)

      // Higher levels should have larger operands (on average)
      const maxOperand1 = Math.max(
        task1.operation?.operand1 || 0,
        task1.operation?.operand2 || 0
      )
      const maxOperand5 = Math.max(
        task5.operation?.operand1 || 0,
        task5.operation?.operand2 || 0
      )
      const maxOperand10 = Math.max(
        task10.operation?.operand1 || 0,
        task10.operation?.operand2 || 0
      )

      // This is probabilistic, but generally higher levels have larger numbers
      expect(maxOperand10).toBeGreaterThanOrEqual(maxOperand1)
    })

    it('should generate tasks with increasing time limits at higher levels', () => {
      const task1 = generateCalculatorTask(1)
      const task5 = generateCalculatorTask(5)

      expect(task5.timeLimit).toBeGreaterThan(task1.timeLimit)
    })

    it('should generate tasks with increasing points at higher levels', () => {
      const task1 = generateCalculatorTask(1)
      const task5 = generateCalculatorTask(5)

      expect(task5.points).toBeGreaterThan(task1.points)
    })

    it('should generate valid addition tasks', () => {
      // Generate multiple tasks to find an addition
      let task: GameTask | null = null
      for (let i = 0; i < 10; i++) {
        const t = generateCalculatorTask(1)
        if (t.operation?.operator === '+') {
          task = t
          break
        }
      }

      if (task && task.operation) {
        expect(task.operation.expectedResult).toBe(
          task.operation.operand1 + task.operation.operand2
        )
      }
    })

    it('should generate valid subtraction tasks', () => {
      let task: GameTask | null = null
      for (let i = 0; i < 10; i++) {
        const t = generateCalculatorTask(1)
        if (t.operation?.operator === '-') {
          task = t
          break
        }
      }

      if (task && task.operation) {
        expect(task.operation.expectedResult).toBe(
          task.operation.operand1 - task.operation.operand2
        )
      }
    })

    it('should generate valid multiplication tasks', () => {
      let task: GameTask | null = null
      for (let i = 0; i < 10; i++) {
        const t = generateCalculatorTask(1)
        if (t.operation?.operator === '*') {
          task = t
          break
        }
      }

      if (task && task.operation) {
        expect(task.operation.expectedResult).toBe(
          task.operation.operand1 * task.operation.operand2
        )
      }
    })

    it('should generate valid division tasks with whole number results', () => {
      let task: GameTask | null = null
      for (let i = 0; i < 20; i++) {
        const t = generateCalculatorTask(1)
        if (t.operation?.operator === '/') {
          task = t
          break
        }
      }

      if (task && task.operation) {
        const expected = Math.floor(
          task.operation.operand1 / task.operation.operand2
        )
        expect(task.operation.expectedResult).toBe(expected)
      }
    })

    it('should generate unique task IDs', () => {
      const task1 = generateCalculatorTask(1)
      const task2 = generateCalculatorTask(1)
      expect(task1.id).not.toBe(task2.id)
    })
  })

  describe('validateCalculatorTask', () => {
    it('should validate correct results', () => {
      const task: GameTask = {
        id: 'test',
        type: 'calculation',
        operation: {
          operand1: 5,
          operand2: 3,
          operator: '+',
          expectedResult: 8,
        },
        priority: 1,
        timeLimit: 10,
        points: 100,
      }

      expect(validateCalculatorTask(task, 8)).toBe(true)
    })

    it('should reject incorrect results', () => {
      const task: GameTask = {
        id: 'test',
        type: 'calculation',
        operation: {
          operand1: 5,
          operand2: 3,
          operator: '+',
          expectedResult: 8,
        },
        priority: 1,
        timeLimit: 10,
        points: 100,
      }

      expect(validateCalculatorTask(task, 7)).toBe(false)
      expect(validateCalculatorTask(task, 9)).toBe(false)
    })

    it('should handle floating point tolerance', () => {
      const task: GameTask = {
        id: 'test',
        type: 'calculation',
        operation: {
          operand1: 1,
          operand2: 3,
          operator: '/',
          expectedResult: 0,
        },
        priority: 1,
        timeLimit: 10,
        points: 100,
      }

      // Should allow small floating point differences
      expect(validateCalculatorTask(task, 0.333)).toBe(false) // Too different
      expect(validateCalculatorTask(task, 0)).toBe(true)
    })

    it('should return false for non-calculation tasks', () => {
      const task: GameTask = {
        id: 'test',
        type: 'traffic_control',
        trafficScenario: {
          currentState: 'RED',
          sensorInput: true,
          expectedAction: 'GREEN',
        },
        priority: 1,
        timeLimit: 10,
        points: 100,
      }

      expect(validateCalculatorTask(task, 5)).toBe(false)
    })

    it('should return false for tasks without operation', () => {
      const task: GameTask = {
        id: 'test',
        type: 'calculation',
        priority: 1,
        timeLimit: 10,
        points: 100,
      }

      expect(validateCalculatorTask(task, 5)).toBe(false)
    })
  })

  describe('getOptimalCalculatorCycles', () => {
    it('should return optimal cycles for addition', () => {
      const task: GameTask = {
        id: 'test',
        type: 'calculation',
        operation: {
          operand1: 5,
          operand2: 3,
          operator: '+',
          expectedResult: 8,
        },
        priority: 1,
        timeLimit: 10,
        points: 100,
      }

      const cycles = getOptimalCalculatorCycles(task)
      // LOAD (3) + LOAD (3) + ADD (1) + STORE (3) = 10
      expect(cycles).toBe(10)
    })

    it('should return optimal cycles for subtraction', () => {
      const task: GameTask = {
        id: 'test',
        type: 'calculation',
        operation: {
          operand1: 5,
          operand2: 3,
          operator: '-',
          expectedResult: 2,
        },
        priority: 1,
        timeLimit: 10,
        points: 100,
      }

      const cycles = getOptimalCalculatorCycles(task)
      expect(cycles).toBe(10)
    })

    it('should return higher cycles for multiplication', () => {
      const task: GameTask = {
        id: 'test',
        type: 'calculation',
        operation: {
          operand1: 5,
          operand2: 3,
          operator: '*',
          expectedResult: 15,
        },
        priority: 1,
        timeLimit: 10,
        points: 100,
      }

      const cycles = getOptimalCalculatorCycles(task)
      // LOAD (3) + LOAD (3) + MUL (3) + STORE (3) = 12
      expect(cycles).toBe(12)
    })

    it('should return higher cycles for division', () => {
      const task: GameTask = {
        id: 'test',
        type: 'calculation',
        operation: {
          operand1: 6,
          operand2: 3,
          operator: '/',
          expectedResult: 2,
        },
        priority: 1,
        timeLimit: 10,
        points: 100,
      }

      const cycles = getOptimalCalculatorCycles(task)
      // LOAD (3) + LOAD (3) + DIV (3) + STORE (3) = 12
      expect(cycles).toBe(12)
    })

    it('should return default cycles for invalid tasks', () => {
      const task: GameTask = {
        id: 'test',
        type: 'traffic_control',
        priority: 1,
        timeLimit: 10,
        points: 100,
      }

      const cycles = getOptimalCalculatorCycles(task)
      expect(cycles).toBe(5) // Default
    })
  })
})

