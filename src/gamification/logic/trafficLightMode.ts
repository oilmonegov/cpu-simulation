/**
 * Traffic Light Mode
 * Game mode where players control traffic lights based on sensor inputs
 */

import { GameTask } from '@/types/cpu'

/**
 * Generate a random traffic light task
 */
export function generateTrafficLightTask(level: number): GameTask {
  const states: Array<'RED' | 'YELLOW' | 'GREEN'> = ['RED', 'YELLOW', 'GREEN']
  const currentState = states[Math.floor(Math.random() * states.length)]
  const sensorInput = Math.random() > 0.3 // 70% chance of car detected
  
  // Determine expected action based on state machine logic
  let expectedAction: 'RED' | 'YELLOW' | 'GREEN'
  if (currentState === 'RED' && sensorInput) {
    expectedAction = 'GREEN' // Car detected at red, go to green
  } else if (currentState === 'GREEN') {
    expectedAction = 'YELLOW' // Green always transitions to yellow
  } else if (currentState === 'YELLOW') {
    expectedAction = 'RED' // Yellow always transitions to red
  } else {
    expectedAction = currentState // Stay in current state
  }
  
  const timeLimit = 8 + level * 2
  const basePoints = 120 + level * 60
  
  return {
    id: `traffic-${Date.now()}-${Math.random()}`,
    type: 'traffic_control',
    trafficScenario: {
      currentState,
      sensorInput,
      expectedAction,
    },
    priority: 1,
    timeLimit,
    points: basePoints,
  }
}

/**
 * Validate traffic light task
 */
export function validateTrafficLightTask(task: GameTask, playerAction: 'RED' | 'YELLOW' | 'GREEN'): boolean {
  if (task.type !== 'traffic_control' || !task.trafficScenario) return false
  return playerAction === task.trafficScenario.expectedAction
}

/**
 * Get optimal cycles for a traffic light task
 */
export function getOptimalTrafficLightCycles(task: GameTask): number {
  if (task.type !== 'traffic_control') return 5
  
  // Optimal: LOAD sensor (3) + LOAD state (3) + DECISION (1) + STORE (3) = 10 cycles
  return 10
}

