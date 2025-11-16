import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/utils'
import userEvent from '@testing-library/user-event'
import TaskQueue from '../TaskQueue'
import { GameTask } from '@/types/cpu'

describe('TaskQueue Component', () => {
  const createCalculatorTask = (overrides?: Partial<GameTask>): GameTask => ({
    id: 'calc-1',
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
    ...overrides,
  })

  const createTrafficTask = (overrides?: Partial<GameTask>): GameTask => ({
    id: 'traffic-1',
    type: 'traffic_control',
    trafficScenario: {
      currentState: 'RED',
      sensorInput: true,
      expectedAction: 'GREEN',
    },
    priority: 1,
    timeLimit: 8,
    points: 120,
    ...overrides,
  })

  it('should render task queue title', () => {
    render(<TaskQueue tasks={[]} />)
    expect(screen.getByText('Task Queue')).toBeInTheDocument()
  })

  it('should display empty message when no tasks', () => {
    render(<TaskQueue tasks={[]} />)
    expect(screen.getByText('No tasks in queue')).toBeInTheDocument()
  })

  it('should render calculator tasks', () => {
    const task = createCalculatorTask()
    render(<TaskQueue tasks={[task]} />)
    
    expect(screen.getByText(/Calculate: 5 \+ 3/)).toBeInTheDocument()
    expect(screen.getByText(/Time limit: 10 cycles/)).toBeInTheDocument()
    expect(screen.getByText(/Points: 100/)).toBeInTheDocument()
  })

  it('should render traffic control tasks', () => {
    const task = createTrafficTask()
    render(<TaskQueue tasks={[task]} />)
    
    expect(screen.getByText(/Traffic Control: RED → GREEN/)).toBeInTheDocument()
    expect(screen.getByText(/Sensor: Car detected/)).toBeInTheDocument()
    expect(screen.getByText(/Time limit: 8 cycles/)).toBeInTheDocument()
  })

  it('should display "No car" when sensor input is false', () => {
    const task = createTrafficTask({ trafficScenario: { currentState: 'RED', sensorInput: false, expectedAction: 'RED' } })
    render(<TaskQueue tasks={[task]} />)
    
    expect(screen.getByText(/Sensor: No car/)).toBeInTheDocument()
  })

  it('should render multiple tasks', () => {
    const tasks = [
      createCalculatorTask({ id: 'calc-1' }),
      createCalculatorTask({ id: 'calc-2', operation: { operand1: 10, operand2: 5, operator: '-', expectedResult: 5 } }),
      createTrafficTask({ id: 'traffic-1' }),
    ]

    render(<TaskQueue tasks={tasks} />)
    
    expect(screen.getByText(/Calculate: 5 \+ 3/)).toBeInTheDocument()
    expect(screen.getByText(/Calculate: 10 - 5/)).toBeInTheDocument()
    expect(screen.getByText(/Traffic Control: RED → GREEN/)).toBeInTheDocument()
  })

  it('should call onTaskSelect when task is clicked', async () => {
    const user = userEvent.setup()
    const onTaskSelect = vi.fn()
    const task = createCalculatorTask()

    render(<TaskQueue tasks={[task]} onTaskSelect={onTaskSelect} />)
    
    const taskElement = screen.getByText(/Calculate: 5 \+ 3/)
    await user.click(taskElement)
    
    expect(onTaskSelect).toHaveBeenCalledTimes(1)
    expect(onTaskSelect).toHaveBeenCalledWith(task)
  })

  it('should not call onTaskSelect if not provided', async () => {
    const user = userEvent.setup()
    const task = createCalculatorTask()

    render(<TaskQueue tasks={[task]} />)
    
    const taskElement = screen.getByText(/Calculate: 5 \+ 3/)
    await user.click(taskElement)
    
    // Should not throw error
    expect(taskElement).toBeInTheDocument()
  })

  it('should highlight first task', () => {
    const tasks = [
      createCalculatorTask({ id: 'calc-1' }),
      createCalculatorTask({ id: 'calc-2' }),
    ]

    const { container } = render(<TaskQueue tasks={tasks} />)
    
    // First task should have blue background
    const firstTask = container.querySelector('.bg-blue-600\\/20')
    expect(firstTask).toBeInTheDocument()
  })

  it('should handle different operators', () => {
    const operators = ['+', '-', '*', '/'] as const
    
    operators.forEach((operator) => {
      const task = createCalculatorTask({
        id: `calc-${operator}`,
        operation: {
          operand1: 10,
          operand2: 5,
          operator,
          expectedResult: operator === '+' ? 15 : operator === '-' ? 5 : operator === '*' ? 50 : 2,
        },
      })
      
      const { unmount } = render(<TaskQueue tasks={[task]} />)
      expect(screen.getByText(new RegExp(`10 ${operator.replace('*', '\\*')} 5`))).toBeInTheDocument()
      unmount()
    })
  })

  it('should handle different traffic light states', () => {
    const states = ['RED', 'YELLOW', 'GREEN'] as const
    
    states.forEach((state) => {
      const task = createTrafficTask({
        id: `traffic-${state}`,
        trafficScenario: {
          currentState: state,
          sensorInput: true,
          expectedAction: state === 'RED' ? 'GREEN' : state === 'GREEN' ? 'YELLOW' : 'RED',
        },
      })
      
      const { unmount } = render(<TaskQueue tasks={[task]} />)
      expect(screen.getByText(new RegExp(`Traffic Control: ${state}`))).toBeInTheDocument()
      unmount()
    })
  })
})

