# Test Suite Documentation

This document describes the comprehensive test suite for the CPU Simulator project.

## Overview

The test suite uses **Vitest** as the test runner, with **React Testing Library** for component testing and **jsdom** for DOM simulation. The suite provides extensive coverage of:

- Game logic (game engine, CPU rules, game modes)
- Simulation logic (simulation engine, instruction set)
- React components (UI components for both gamification and simulation)

## Setup

### Installation

Install all test dependencies:

```bash
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

```
src/
├── test/
│   ├── setup.ts          # Test configuration and setup
│   └── utils.tsx         # Test utilities and helpers
├── gamification/
│   └── logic/
│       └── __tests__/
│           ├── gameEngine.test.ts
│           ├── cpuRules.test.ts
│           ├── calculatorMode.test.ts
│           └── trafficLightMode.test.ts
│   └── components/
│       └── __tests__/
│           ├── Clock.test.tsx
│           ├── ScoreDisplay.test.tsx
│           ├── EnergyMeter.test.tsx
│           └── TaskQueue.test.tsx
└── simulation/
    └── utils/
        └── __tests__/
            ├── simulationEngine.test.ts
            └── instructionSet.test.ts
    └── components/
        └── __tests__/
            ├── Register.test.tsx
            └── Memory.test.tsx
```

## Test Coverage

### Game Logic Tests

#### GameEngine (`gameEngine.test.ts`)
- ✅ Initialization and state management
- ✅ Game start/stop/pause functionality
- ✅ Task generation (calculator and traffic light modes)
- ✅ Player action processing (all instruction types)
- ✅ Task result submission and scoring
- ✅ Level progression and energy management
- ✅ Clock advancement and task expiration

#### CPU Rules (`cpuRules.test.ts`)
- ✅ Instruction cycle calculation for all opcodes
- ✅ Energy cost calculation
- ✅ Register availability checking
- ✅ Instruction execution with success/failure handling
- ✅ Efficiency calculation
- ✅ Score calculation with bonuses

#### Calculator Mode (`calculatorMode.test.ts`)
- ✅ Task generation with difficulty scaling
- ✅ Task validation
- ✅ Optimal cycle calculation
- ✅ All arithmetic operations (+, -, *, /)

#### Traffic Light Mode (`trafficLightMode.test.ts`)
- ✅ Task generation with state machine logic
- ✅ Task validation
- ✅ Optimal cycle calculation
- ✅ All traffic light states and transitions

### Simulation Logic Tests

#### Simulation Engine (`simulationEngine.test.ts`)
- ✅ Initialization and state management
- ✅ Example setting (calculator and traffic light)
- ✅ Instruction cycle execution (FETCH, DECODE, EXECUTE, STORE)
- ✅ Register and memory updates
- ✅ Bus transfer creation
- ✅ History tracking
- ✅ Speed and code view controls

#### Instruction Set (`instructionSet.test.ts`)
- ✅ Instruction encoding definitions
- ✅ Instruction encoding to machine code
- ✅ Calculator instruction generation
- ✅ Traffic light instruction generation
- ✅ All opcode support

### Component Tests

#### Gamification Components
- ✅ **Clock**: Cycle display, pulsing animation
- ✅ **ScoreDisplay**: Score, accuracy, speed, efficiency display
- ✅ **EnergyMeter**: Energy level display with color coding
- ✅ **TaskQueue**: Task list rendering, selection, empty state

#### Simulation Components
- ✅ **Register**: Register value display, active/inactive states
- ✅ **Memory**: Memory location display, active/inactive states

## Test Utilities

The test suite includes utility functions in `src/test/utils.tsx`:

- `render()`: Custom render function with Router provider
- `createMockRegisters()`: Helper to create mock register arrays
- `createMockInstruction()`: Helper to create mock instructions

## Writing New Tests

### Adding a New Logic Test

1. Create a test file: `src/[module]/logic/__tests__/[module].test.ts`
2. Import necessary dependencies:
   ```typescript
   import { describe, it, expect } from 'vitest'
   ```
3. Write test cases following the existing patterns

### Adding a New Component Test

1. Create a test file: `src/[module]/components/__tests__/[Component].test.tsx`
2. Import test utilities:
   ```typescript
   import { render, screen } from '../../../test/utils'
   ```
3. Test rendering, props, and user interactions

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Clear Test Names**: Use descriptive test names that explain what is being tested
3. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification
4. **Mock External Dependencies**: Use mocks for timers, random numbers, etc.
5. **Test Edge Cases**: Include tests for boundary conditions and error cases
6. **Component Testing**: Focus on user-visible behavior, not implementation details

## Coverage Goals

The test suite aims for:
- **Logic Functions**: 90%+ coverage
- **Components**: 80%+ coverage (focusing on critical paths)
- **Edge Cases**: Comprehensive coverage of error conditions

## Continuous Integration

Tests should be run:
- Before committing code
- In CI/CD pipeline
- Before merging pull requests

## Troubleshooting

### Tests fail with "Cannot find module"
- Run `npm install` to ensure all dependencies are installed

### Component tests fail with routing errors
- Ensure components are wrapped with the Router provider (use `render` from `test/utils`)

### Tests are slow
- Use `--run` flag to disable watch mode
- Consider using `vi.useFakeTimers()` for time-dependent tests

## Future Enhancements

Potential additions to the test suite:
- Integration tests for full game flows
- E2E tests with Playwright or Cypress
- Performance tests for animation-heavy components
- Accessibility tests
- Visual regression tests

