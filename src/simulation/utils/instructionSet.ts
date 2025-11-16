/**
 * Instruction Set Definition
 * Defines the CPU instruction set and encoding/decoding logic
 */

import { Instruction, Opcode } from '@/types/cpu'

/**
 * Simple instruction set for educational purposes
 * Supports basic arithmetic, memory operations, and control flow
 */

export const INSTRUCTIONS: Record<Opcode, { encoding: number; description: string }> = {
  [Opcode.LOAD]: { encoding: 0x01, description: 'Load value from memory into register' },
  [Opcode.STORE]: { encoding: 0x02, description: 'Store register value to memory' },
  [Opcode.ADD]: { encoding: 0x03, description: 'Add two values' },
  [Opcode.SUB]: { encoding: 0x04, description: 'Subtract two values' },
  [Opcode.MUL]: { encoding: 0x05, description: 'Multiply two values' },
  [Opcode.DIV]: { encoding: 0x06, description: 'Divide two values' },
  [Opcode.JMP]: { encoding: 0x07, description: 'Jump to address' },
  [Opcode.JZ]: { encoding: 0x08, description: 'Jump if zero' },
  [Opcode.JNZ]: { encoding: 0x09, description: 'Jump if not zero' },
  [Opcode.HALT]: { encoding: 0x0A, description: 'Halt execution' },
  [Opcode.MOV]: { encoding: 0x0B, description: 'Move value between registers' },
}

/**
 * Encode an instruction to machine code
 */
export function encodeInstruction(instruction: Instruction): string {
  const opcodeEncoding = INSTRUCTIONS[instruction.opcode].encoding
  const opcodeHex = opcodeEncoding.toString(16).padStart(2, '0').toUpperCase()
  
  if (instruction.address !== undefined) {
    return `${opcodeHex} ${instruction.address.toString(16).padStart(4, '0').toUpperCase()}`
  }
  if (instruction.operand1 !== undefined && instruction.operand2 !== undefined) {
    const op1 = typeof instruction.operand1 === 'number' 
      ? instruction.operand1.toString(16).padStart(2, '0').toUpperCase()
      : '00'
    const op2 = typeof instruction.operand2 === 'number'
      ? instruction.operand2.toString(16).padStart(2, '0').toUpperCase()
      : '00'
    return `${opcodeHex} ${op1} ${op2}`
  }
  
  return opcodeHex
}

/**
 * Generate calculator example instructions
 */
export function generateCalculatorInstructions(
  operand1: number,
  operand2: number,
  operation: '+' | '-' | '*' | '/'
): Instruction[] {
  const instructions: Instruction[] = []
  
  // Load operands into registers
  instructions.push({
    id: 'load1',
    opcode: Opcode.LOAD,
    operand1: operand1,
    destination: 'R1',
    description: `Load ${operand1} into register R1`,
  })
  
  instructions.push({
    id: 'load2',
    opcode: Opcode.LOAD,
    operand1: operand2,
    destination: 'R2',
    description: `Load ${operand2} into register R2`,
  })
  
  // Perform operation
  let opcode: Opcode
  switch (operation) {
    case '+':
      opcode = Opcode.ADD
      break
    case '-':
      opcode = Opcode.SUB
      break
    case '*':
      opcode = Opcode.MUL
      break
    case '/':
      opcode = Opcode.DIV
      break
  }
  
  instructions.push({
    id: 'compute',
    opcode,
    operand1: 'R1',
    operand2: 'R2',
    destination: 'R3',
    description: `Compute ${operand1} ${operation} ${operand2}`,
  })
  
  // Store result
  instructions.push({
    id: 'store',
    opcode: Opcode.STORE,
    destination: 'R3',
    address: 0x100,
    description: 'Store result to memory',
  })
  
  return instructions
}

/**
 * Generate traffic light controller instructions
 */
export function generateTrafficLightInstructions(
  currentState: 'RED' | 'YELLOW' | 'GREEN',
  sensorInput: boolean
): Instruction[] {
  const instructions: Instruction[] = []
  
  // Load sensor input
  instructions.push({
    id: 'load_sensor',
    opcode: Opcode.LOAD,
    operand1: sensorInput ? 1 : 0,
    destination: 'R1',
    description: `Load sensor input: ${sensorInput ? 'Car detected' : 'No car'}`,
  })
  
  // Load current state
  const stateValue = currentState === 'RED' ? 0 : currentState === 'YELLOW' ? 1 : 2
  instructions.push({
    id: 'load_state',
    opcode: Opcode.LOAD,
    operand1: stateValue,
    destination: 'R2',
    description: `Load current state: ${currentState}`,
  })
  
  // Decision logic (simplified state machine)
  if (currentState === 'RED' && sensorInput) {
    // Transition to GREEN
    instructions.push({
      id: 'set_green',
      opcode: Opcode.MOV,
      operand1: 2,
      destination: 'R3',
      description: 'Set output to GREEN',
    })
  } else if (currentState === 'GREEN') {
    // Transition to YELLOW
    instructions.push({
      id: 'set_yellow',
      opcode: Opcode.MOV,
      operand1: 1,
      destination: 'R3',
      description: 'Set output to YELLOW',
    })
  } else if (currentState === 'YELLOW') {
    // Transition to RED
    instructions.push({
      id: 'set_red',
      opcode: Opcode.MOV,
      operand1: 0,
      destination: 'R3',
      description: 'Set output to RED',
    })
  }
  
  // Store output
  instructions.push({
    id: 'store_output',
    opcode: Opcode.STORE,
    destination: 'R3',
    address: 0x200,
    description: 'Store output signal',
  })
  
  return instructions
}

