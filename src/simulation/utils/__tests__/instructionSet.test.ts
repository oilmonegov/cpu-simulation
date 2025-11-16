import { describe, it, expect } from 'vitest'
import {
  INSTRUCTIONS,
  encodeInstruction,
  generateCalculatorInstructions,
  generateTrafficLightInstructions,
} from '../instructionSet'
import { Opcode, Instruction } from '@/types/cpu'

describe('Instruction Set', () => {
  describe('INSTRUCTIONS', () => {
    it('should have all opcodes defined', () => {
      expect(INSTRUCTIONS[Opcode.LOAD]).toBeDefined()
      expect(INSTRUCTIONS[Opcode.STORE]).toBeDefined()
      expect(INSTRUCTIONS[Opcode.ADD]).toBeDefined()
      expect(INSTRUCTIONS[Opcode.SUB]).toBeDefined()
      expect(INSTRUCTIONS[Opcode.MUL]).toBeDefined()
      expect(INSTRUCTIONS[Opcode.DIV]).toBeDefined()
      expect(INSTRUCTIONS[Opcode.JMP]).toBeDefined()
      expect(INSTRUCTIONS[Opcode.JZ]).toBeDefined()
      expect(INSTRUCTIONS[Opcode.JNZ]).toBeDefined()
      expect(INSTRUCTIONS[Opcode.HALT]).toBeDefined()
      expect(INSTRUCTIONS[Opcode.MOV]).toBeDefined()
    })

    it('should have encoding for each instruction', () => {
      Object.values(INSTRUCTIONS).forEach((instruction) => {
        expect(instruction.encoding).toBeDefined()
        expect(typeof instruction.encoding).toBe('number')
        expect(instruction.encoding).toBeGreaterThanOrEqual(0)
        expect(instruction.encoding).toBeLessThan(256) // 8-bit encoding
      })
    })

    it('should have description for each instruction', () => {
      Object.values(INSTRUCTIONS).forEach((instruction) => {
        expect(instruction.description).toBeDefined()
        expect(typeof instruction.description).toBe('string')
        expect(instruction.description.length).toBeGreaterThan(0)
      })
    })
  })

  describe('encodeInstruction', () => {
    it('should encode simple instruction without operands', () => {
      const instruction: Instruction = {
        id: 'test',
        opcode: Opcode.HALT,
        description: 'Halt',
      }

      const encoded = encodeInstruction(instruction)
      expect(encoded).toBeDefined()
      expect(typeof encoded).toBe('string')
      expect(encoded.length).toBeGreaterThan(0)
    })

    it('should encode instruction with address', () => {
      const instruction: Instruction = {
        id: 'test',
        opcode: Opcode.LOAD,
        address: 0x100,
        description: 'Load from address',
      }

      const encoded = encodeInstruction(instruction)
      expect(encoded).toContain(INSTRUCTIONS[Opcode.LOAD].encoding.toString(16).toUpperCase())
      expect(encoded).toContain('0100') // Address in hex
    })

    it('should encode instruction with numeric operands', () => {
      const instruction: Instruction = {
        id: 'test',
        opcode: Opcode.ADD,
        operand1: 5,
        operand2: 10,
        description: 'Add',
      }

      const encoded = encodeInstruction(instruction)
      expect(encoded).toBeDefined()
      expect(encoded).toContain(INSTRUCTIONS[Opcode.ADD].encoding.toString(16).toUpperCase())
    })

    it('should handle different opcodes correctly', () => {
      const opcodes = [
        Opcode.LOAD,
        Opcode.STORE,
        Opcode.ADD,
        Opcode.SUB,
        Opcode.MUL,
        Opcode.DIV,
      ]

      opcodes.forEach((opcode) => {
        const instruction: Instruction = {
          id: 'test',
          opcode,
          description: 'Test',
        }
        const encoded = encodeInstruction(instruction)
        expect(encoded).toBeDefined()
        expect(encoded.length).toBeGreaterThan(0)
      })
    })
  })

  describe('generateCalculatorInstructions', () => {
    it('should generate instructions for addition', () => {
      const instructions = generateCalculatorInstructions(5, 3, '+')
      expect(instructions).toHaveLength(4) // LOAD, LOAD, ADD, STORE

      expect(instructions[0].opcode).toBe(Opcode.LOAD)
      expect(instructions[0].operand1).toBe(5)
      expect(instructions[0].destination).toBe('R1')

      expect(instructions[1].opcode).toBe(Opcode.LOAD)
      expect(instructions[1].operand1).toBe(3)
      expect(instructions[1].destination).toBe('R2')

      expect(instructions[2].opcode).toBe(Opcode.ADD)
      expect(instructions[2].operand1).toBe('R1')
      expect(instructions[2].operand2).toBe('R2')
      expect(instructions[2].destination).toBe('R3')

      expect(instructions[3].opcode).toBe(Opcode.STORE)
      expect(instructions[3].destination).toBe('R3')
    })

    it('should generate instructions for subtraction', () => {
      const instructions = generateCalculatorInstructions(10, 3, '-')
      expect(instructions).toHaveLength(4)

      expect(instructions[2].opcode).toBe(Opcode.SUB)
      expect(instructions[2].operand1).toBe('R1')
      expect(instructions[2].operand2).toBe('R2')
    })

    it('should generate instructions for multiplication', () => {
      const instructions = generateCalculatorInstructions(5, 4, '*')
      expect(instructions).toHaveLength(4)

      expect(instructions[2].opcode).toBe(Opcode.MUL)
    })

    it('should generate instructions for division', () => {
      const instructions = generateCalculatorInstructions(10, 2, '/')
      expect(instructions).toHaveLength(4)

      expect(instructions[2].opcode).toBe(Opcode.DIV)
    })

    it('should have unique IDs for each instruction', () => {
      const instructions = generateCalculatorInstructions(5, 3, '+')
      const ids = instructions.map((i) => i.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have descriptions for each instruction', () => {
      const instructions = generateCalculatorInstructions(5, 3, '+')
      instructions.forEach((instruction) => {
        expect(instruction.description).toBeDefined()
        expect(typeof instruction.description).toBe('string')
        expect(instruction.description.length).toBeGreaterThan(0)
      })
    })

    it('should handle different operand values', () => {
      const testCases = [
        { a: 1, b: 1, op: '+' as const },
        { a: 100, b: 50, op: '-' as const },
        { a: 7, b: 8, op: '*' as const },
        { a: 20, b: 4, op: '/' as const },
      ]

      testCases.forEach(({ a, b, op }) => {
        const instructions = generateCalculatorInstructions(a, b, op)
        expect(instructions[0].operand1).toBe(a)
        expect(instructions[1].operand1).toBe(b)
      })
    })
  })

  describe('generateTrafficLightInstructions', () => {
    it('should generate instructions for RED state with sensor', () => {
      const instructions = generateTrafficLightInstructions('RED', true)
      expect(instructions.length).toBeGreaterThan(0)

      // Should have sensor load
      const sensorLoad = instructions.find((i) => i.id === 'load_sensor')
      expect(sensorLoad).toBeDefined()
      expect(sensorLoad?.opcode).toBe(Opcode.LOAD)
      expect(sensorLoad?.operand1).toBe(1) // true = 1

      // Should have state load
      const stateLoad = instructions.find((i) => i.id === 'load_state')
      expect(stateLoad).toBeDefined()
      expect(stateLoad?.opcode).toBe(Opcode.LOAD)
      expect(stateLoad?.operand1).toBe(0) // RED = 0

      // Should have set_green
      const setGreen = instructions.find((i) => i.id === 'set_green')
      expect(setGreen).toBeDefined()
      expect(setGreen?.opcode).toBe(Opcode.MOV)
      expect(setGreen?.operand1).toBe(2) // GREEN = 2
    })

    it('should generate instructions for GREEN state', () => {
      const instructions = generateTrafficLightInstructions('GREEN', false)
      expect(instructions.length).toBeGreaterThan(0)

      const setYellow = instructions.find((i) => i.id === 'set_yellow')
      expect(setYellow).toBeDefined()
      expect(setYellow?.opcode).toBe(Opcode.MOV)
      expect(setYellow?.operand1).toBe(1) // YELLOW = 1
    })

    it('should generate instructions for YELLOW state', () => {
      const instructions = generateTrafficLightInstructions('YELLOW', false)
      expect(instructions.length).toBeGreaterThan(0)

      const setRed = instructions.find((i) => i.id === 'set_red')
      expect(setRed).toBeDefined()
      expect(setRed?.opcode).toBe(Opcode.MOV)
      expect(setRed?.operand1).toBe(0) // RED = 0
    })

    it('should always include sensor load instruction', () => {
      const testCases = [
        { state: 'RED' as const, sensor: true },
        { state: 'RED' as const, sensor: false },
        { state: 'GREEN' as const, sensor: true },
        { state: 'GREEN' as const, sensor: false },
        { state: 'YELLOW' as const, sensor: true },
        { state: 'YELLOW' as const, sensor: false },
      ]

      testCases.forEach(({ state, sensor }) => {
        const instructions = generateTrafficLightInstructions(state, sensor)
        const sensorLoad = instructions.find((i) => i.id === 'load_sensor')
        expect(sensorLoad).toBeDefined()
        expect(sensorLoad?.operand1).toBe(sensor ? 1 : 0)
      })
    })

    it('should always include state load instruction', () => {
      const stateValues = {
        RED: 0,
        YELLOW: 1,
        GREEN: 2,
      }

      Object.entries(stateValues).forEach(([state, value]) => {
        const instructions = generateTrafficLightInstructions(
          state as 'RED' | 'YELLOW' | 'GREEN',
          true
        )
        const stateLoad = instructions.find((i) => i.id === 'load_state')
        expect(stateLoad).toBeDefined()
        expect(stateLoad?.operand1).toBe(value)
      })
    })

    it('should always include store output instruction', () => {
      const testCases = [
        { state: 'RED' as const, sensor: true },
        { state: 'GREEN' as const, sensor: false },
        { state: 'YELLOW' as const, sensor: true },
      ]

      testCases.forEach(({ state, sensor }) => {
        const instructions = generateTrafficLightInstructions(state, sensor)
        const storeOutput = instructions.find((i) => i.id === 'store_output')
        expect(storeOutput).toBeDefined()
        expect(storeOutput?.opcode).toBe(Opcode.STORE)
        expect(storeOutput?.address).toBe(0x200)
      })
    })

    it('should have unique IDs for each instruction', () => {
      const instructions = generateTrafficLightInstructions('RED', true)
      const ids = instructions.map((i) => i.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have descriptions for each instruction', () => {
      const instructions = generateTrafficLightInstructions('RED', true)
      instructions.forEach((instruction) => {
        expect(instruction.description).toBeDefined()
        expect(typeof instruction.description).toBe('string')
        expect(instruction.description.length).toBeGreaterThan(0)
      })
    })
  })
})

