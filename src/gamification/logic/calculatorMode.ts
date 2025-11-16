/**
 * Calculator Mode
 * Game mode where players process math operations
 */

import { GameTask } from '@/types/cpu'

/**
 * Generate a random calculator task
 */
export function generateCalculatorTask(level: number): GameTask {
  const operations: Array<'+' | '-' | '*' | '/'> = ['+', '-', '*', '/']
  
  // Increase difficulty with level
  let maxOperand = 10 + level * 5
  if (level > 3) maxOperand = 50 + (level - 3) * 10
  
  const operand1 = Math.floor(Math.random() * maxOperand) + 1
  const operand2 = Math.floor(Math.random() * maxOperand) + 1
  const operator = operations[Math.floor(Math.random() * operations.length)]
  
  let expectedResult: number
  switch (operator) {
    case '+':
      expectedResult = operand1 + operand2
      break
    case '-':
      expectedResult = operand1 - operand2
      break
    case '*':
      expectedResult = operand1 * operand2
      break
    case '/':
      // Ensure division results in whole number
      expectedResult = Math.floor(operand1 / operand2)
      break
  }
  
  const timeLimit = 10 + level * 2 // More time pressure at higher levels
  const basePoints = 100 + level * 50
  
  return {
    id: `calc-${Date.now()}-${Math.random()}`,
    type: 'calculation',
    operation: {
      operand1,
      operand2,
      operator,
      expectedResult,
    },
    priority: 1,
    timeLimit,
    points: basePoints,
  }
}

/**
 * Validate calculator task result
 */
export function validateCalculatorTask(task: GameTask, playerResult: number): boolean {
  if (task.type !== 'calculation' || !task.operation) return false
  return Math.abs(playerResult - task.operation.expectedResult) < 0.01 // Allow floating point tolerance
}

/**
 * Get optimal cycles for a calculator task
 */
export function getOptimalCalculatorCycles(task: GameTask): number {
  if (task.type !== 'calculation' || !task.operation) return 5
  
  // Optimal: LOAD (3) + LOAD (3) + OPERATION (1-3) + STORE (3) = 10-12 cycles
  const operationCycles = task.operation.operator === '*' || task.operation.operator === '/' ? 3 : 1
  return 3 + 3 + operationCycles + 3
}

