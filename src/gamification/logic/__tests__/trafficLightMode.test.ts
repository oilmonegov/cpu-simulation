import { describe, it, expect } from 'vitest'
import {
  generateTrafficLightTask,
  validateTrafficLightTask,
  getOptimalTrafficLightCycles,
} from '../trafficLightMode'
import { GameTask } from '@/types/cpu'

describe('Traffic Light Mode', () => {
  describe('generateTrafficLightTask', () => {
    it('should generate a valid traffic light task', () => {
      const task = generateTrafficLightTask(1)
      expect(task).toBeDefined()
      expect(task.type).toBe('traffic_control')
      expect(task.trafficScenario).toBeDefined()
      expect(['RED', 'YELLOW', 'GREEN']).toContain(
        task.trafficScenario?.currentState
      )
      expect(typeof task.trafficScenario?.sensorInput).toBe('boolean')
      expect(['RED', 'YELLOW', 'GREEN']).toContain(
        task.trafficScenario?.expectedAction
      )
      expect(task.id).toBeDefined()
      expect(task.points).toBeGreaterThan(0)
      expect(task.timeLimit).toBeGreaterThan(0)
    })

    it('should generate tasks with increasing time limits at higher levels', () => {
      const task1 = generateTrafficLightTask(1)
      const task5 = generateTrafficLightTask(5)

      expect(task5.timeLimit).toBeGreaterThan(task1.timeLimit)
    })

    it('should generate tasks with increasing points at higher levels', () => {
      const task1 = generateTrafficLightTask(1)
      const task5 = generateTrafficLightTask(5)

      expect(task5.points).toBeGreaterThan(task1.points)
    })

    it('should generate unique task IDs', () => {
      const task1 = generateTrafficLightTask(1)
      const task2 = generateTrafficLightTask(1)
      expect(task1.id).not.toBe(task2.id)
    })

    it('should follow state machine logic for RED state with sensor', () => {
      // Generate multiple tasks to find RED state with sensor
      let task: GameTask | null = null
      for (let i = 0; i < 20; i++) {
        const t = generateTrafficLightTask(1)
        if (
          t.trafficScenario?.currentState === 'RED' &&
          t.trafficScenario?.sensorInput === true
        ) {
          task = t
          break
        }
      }

      if (task && task.trafficScenario) {
        // RED with sensor should transition to GREEN
        expect(task.trafficScenario.expectedAction).toBe('GREEN')
      }
    })

    it('should follow state machine logic for GREEN state', () => {
      let task: GameTask | null = null
      for (let i = 0; i < 20; i++) {
        const t = generateTrafficLightTask(1)
        if (t.trafficScenario?.currentState === 'GREEN') {
          task = t
          break
        }
      }

      if (task && task.trafficScenario) {
        // GREEN should always transition to YELLOW
        expect(task.trafficScenario.expectedAction).toBe('YELLOW')
      }
    })

    it('should follow state machine logic for YELLOW state', () => {
      let task: GameTask | null = null
      for (let i = 0; i < 20; i++) {
        const t = generateTrafficLightTask(1)
        if (t.trafficScenario?.currentState === 'YELLOW') {
          task = t
          break
        }
      }

      if (task && task.trafficScenario) {
        // YELLOW should always transition to RED
        expect(task.trafficScenario.expectedAction).toBe('RED')
      }
    })

    it('should handle RED state without sensor', () => {
      let task: GameTask | null = null
      for (let i = 0; i < 20; i++) {
        const t = generateTrafficLightTask(1)
        if (
          t.trafficScenario?.currentState === 'RED' &&
          t.trafficScenario?.sensorInput === false
        ) {
          task = t
          break
        }
      }

      if (task && task.trafficScenario) {
        // RED without sensor should stay RED
        expect(task.trafficScenario.expectedAction).toBe('RED')
      }
    })
  })

  describe('validateTrafficLightTask', () => {
    it('should validate correct actions', () => {
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

      expect(validateTrafficLightTask(task, 'GREEN')).toBe(true)
    })

    it('should reject incorrect actions', () => {
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

      expect(validateTrafficLightTask(task, 'RED')).toBe(false)
      expect(validateTrafficLightTask(task, 'YELLOW')).toBe(false)
    })

    it('should return false for non-traffic tasks', () => {
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

      expect(validateTrafficLightTask(task, 'GREEN')).toBe(false)
    })

    it('should return false for tasks without traffic scenario', () => {
      const task: GameTask = {
        id: 'test',
        type: 'traffic_control',
        priority: 1,
        timeLimit: 10,
        points: 100,
      }

      expect(validateTrafficLightTask(task, 'GREEN')).toBe(false)
    })
  })

  describe('getOptimalTrafficLightCycles', () => {
    it('should return optimal cycles for traffic light tasks', () => {
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

      const cycles = getOptimalTrafficLightCycles(task)
      // LOAD sensor (3) + LOAD state (3) + DECISION (1) + STORE (3) = 10
      expect(cycles).toBe(10)
    })

    it('should return default cycles for invalid tasks', () => {
      const task: GameTask = {
        id: 'test',
        type: 'calculation',
        priority: 1,
        timeLimit: 10,
        points: 100,
      }

      const cycles = getOptimalTrafficLightCycles(task)
      expect(cycles).toBe(5) // Default
    })

    it('should return optimal cycles for all traffic scenarios', () => {
      const scenarios = [
        { currentState: 'RED' as const, sensorInput: true, expectedAction: 'GREEN' as const },
        { currentState: 'GREEN' as const, sensorInput: false, expectedAction: 'YELLOW' as const },
        { currentState: 'YELLOW' as const, sensorInput: false, expectedAction: 'RED' as const },
      ]

      scenarios.forEach((scenario) => {
        const task: GameTask = {
          id: 'test',
          type: 'traffic_control',
          trafficScenario: scenario,
          priority: 1,
          timeLimit: 10,
          points: 100,
        }

        const cycles = getOptimalTrafficLightCycles(task)
        expect(cycles).toBe(10)
      })
    })
  })
})

