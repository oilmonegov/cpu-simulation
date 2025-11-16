# CPU Simulator & Gamification

An interactive educational project that simulates and gamifies how a CPU works, making it intuitive for laypeople while maintaining technical accuracy.

## Project Overview

This project provides a comprehensive visual experience of the entire data and instruction flow from software/programs, operating system and drivers, input/output devices (hardware), all the way to the CPU instruction cycle (fetch, decode, execute, store). The simulation clearly visualizes the logic flow between these layers before the CPU executes.

## Features

### 1. Simulation Module (`/simulation`)

A highly visual simulation of how the CPU works in real-time, featuring:

- **Animated Visualization**: See the complete flow from Input → Drivers → OS kernel → CPU registers → ALU → Memory
- **Instruction Cycle**: Watch the Fetch-Decode-Execute-Store cycle in action
- **Example Scenarios**:
  - **Calculator**: Run simple operations (e.g., `5 + 3`) showing how data travels through layers
  - **Traffic Light Controller**: Simulate digital signal processing for traffic control
- **Interactive Controls**: Play, pause, step-through, and reset functionality
- **Code View**: Toggle between assembly and machine code representations
- **Educational Tooltips**: Hover over components to learn about registers, ALU, cache, control unit, buses, etc.

### 2. Gamification Module (`/gamification`)

Turn CPU processing into an engaging educational game where you act as the CPU:

- **Game Modes**:
  - **Calculator Mode**: Process math operations correctly and efficiently with limited registers and energy
  - **Traffic Light Mode**: Handle input signals (sensors/timers) and control outputs correctly under time pressure
- **Game Mechanics**:
  - Limited resources (registers, energy)
  - Time pressure (clock cycles)
  - Progressive difficulty (pipelining, interrupts, cache)
  - Scoring based on speed, accuracy, and efficiency
- **Visual UI**: Energy meters, task queues, performance scores, and real-time feedback

### 3. Welcome Page (`/`)

A landing page that introduces the project and provides navigation to both modules with an animated background.

## Technology Stack

- **React** (TypeScript) - UI framework
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth transitions and interactions
- **D3.js** - Data visualization for complex CPU architecture diagrams
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **Zustand** - State management (optional, can use React Context)

## Project Structure

```
src/
├── main.tsx                 # Application entry point
├── App.tsx                  # Main router setup
├── index.css               # Global styles
├── types/
│   └── cpu.ts              # TypeScript type definitions
├── welcome/
│   ├── index.tsx
│   └── WelcomePage.tsx     # Landing page
├── simulation/
│   ├── index.tsx
│   ├── SimulationPage.tsx  # Main simulation page
│   ├── components/         # Simulation UI components
│   │   ├── CPU.tsx
│   │   ├── Memory.tsx
│   │   ├── Bus.tsx
│   │   ├── Register.tsx
│   │   ├── ALU.tsx
│   │   ├── ControlUnit.tsx
│   │   ├── IODevice.tsx
│   │   ├── CodeView.tsx
│   │   └── Tooltip.tsx
│   └── utils/              # Simulation logic
│       ├── simulationEngine.ts
│       ├── instructionSet.ts
│       └── animationController.ts
└── gamification/
    ├── index.tsx
    ├── GamePage.tsx        # Main game page
    ├── components/         # Game UI components
    │   ├── TaskQueue.tsx
    │   ├── Clock.tsx
    │   ├── GameRegisters.tsx
    │   ├── HUD.tsx
    │   ├── EnergyMeter.tsx
    │   └── ScoreDisplay.tsx
    └── logic/              # Game logic
        ├── gameEngine.ts
        ├── calculatorMode.ts
        ├── trafficLightMode.ts
        └── cpuRules.ts
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository or navigate to the project directory:
```bash
cd /Users/chux/Sites/Cpu
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in the terminal)

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Running Tests

The project includes an extensive test suite. See [TESTING.md](./TESTING.md) for detailed documentation.

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

## How It Works

### CPU Simulation

The simulation engine implements a simplified but accurate CPU instruction cycle:

1. **Fetch**: Load instruction from memory into the instruction register
2. **Decode**: Interpret the instruction opcode and operands
3. **Execute**: Perform the operation (arithmetic, memory access, etc.)
4. **Store**: Write results back to registers or memory

The engine tracks:
- Register states and values
- Memory locations and data
- Bus transfers (data, address, control buses)
- Instruction history for step-by-step playback

### Gamification

The game engine simulates CPU operations with game constraints:

- **Resource Management**: Limited registers and energy
- **Time Pressure**: Tasks have time limits measured in clock cycles
- **Scoring System**: Based on:
  - **Accuracy**: Correct task completion
  - **Speed**: How quickly tasks are completed
  - **Efficiency**: Optimal use of resources (registers, energy, cycles)

### Educational Concepts Covered

1. **CPU Architecture**:
   - Registers (general purpose, program counter, instruction register)
   - Arithmetic Logic Unit (ALU)
   - Control Unit
   - Memory hierarchy

2. **Instruction Cycle**:
   - Fetch-Decode-Execute-Store phases
   - Instruction pipelining concepts
   - Clock cycles

3. **Data Flow**:
   - Input/Output devices
   - Bus systems (data, address, control)
   - Memory access patterns

4. **Assembly/Machine Code**:
   - Instruction encoding
   - Opcodes and operands
   - Low-level programming concepts

5. **System Integration**:
   - How software interacts with hardware
   - Operating system role
   - Device drivers

## Development Guide

### Adding New Examples

To add a new simulation example:

1. Add example type to `src/types/cpu.ts`:
```typescript
export enum ExampleType {
  CALCULATOR = 'CALCULATOR',
  TRAFFIC_LIGHT = 'TRAFFIC_LIGHT',
  YOUR_NEW_EXAMPLE = 'YOUR_NEW_EXAMPLE',
}
```

2. Create instruction generator in `src/simulation/utils/instructionSet.ts`:
```typescript
export function generateYourExampleInstructions(...): Instruction[] {
  // Generate instructions for your example
}
```

3. Update `SimulationEngine.setExample()` to handle the new type

### Adding New Game Modes

1. Add game mode to `src/types/cpu.ts`:
```typescript
export enum GameMode {
  CALCULATOR = 'CALCULATOR',
  TRAFFIC_LIGHT = 'TRAFFIC_LIGHT',
  YOUR_NEW_MODE = 'YOUR_NEW_MODE',
}
```

2. Create mode logic in `src/gamification/logic/yourNewMode.ts`
3. Update `GameEngine` to handle the new mode

### Styling

The project uses TailwindCSS for styling. Custom colors are defined in `tailwind.config.js`:
- `cpu-blue`: Primary blue for CPU components
- `cpu-green`: Success/active states
- `cpu-red`: Errors/warnings
- `cpu-yellow`: Warnings/highlights

## Architecture Explanation

### State Management

The project uses a combination of:
- **Local Component State**: For UI-specific state (React `useState`)
- **Engine Classes**: For complex business logic (`SimulationEngine`, `GameEngine`)
- **React Context** (optional): For shared state across components

### Component Design

Components follow a modular design:
- **Presentation Components**: Pure UI components (e.g., `Register`, `Memory`)
- **Container Components**: Components that manage state and logic (e.g., `SimulationPage`, `GamePage`)
- **Utility Classes**: Business logic separated from UI (e.g., `SimulationEngine`, `GameEngine`)

### Animation Strategy

- **Framer Motion**: Used for component animations, page transitions, and interactive feedback
- **D3.js**: Reserved for complex data visualizations (CPU architecture diagrams, data flow graphs)
- **CSS Transitions**: For simple hover effects and state changes

## Performance Considerations

- Components use `React.memo` where appropriate to prevent unnecessary re-renders
- D3.js visualizations are optimized for smooth animations
- Large memory views could be virtualized if needed (not currently implemented)
- Game loop uses `requestAnimationFrame`-like timing for smooth updates

## Accessibility

- Keyboard navigation support
- ARIA labels for interactive elements
- Screen reader friendly structure
- High contrast color schemes

## Future Enhancements

Potential improvements:
- More complex CPU architectures (multi-core, pipelining)
- Additional game modes and levels
- Save/load game states
- Multiplayer competitive mode
- Advanced visualization with D3.js force-directed graphs
- Sound effects and audio feedback
- Tutorial mode for beginners

## License

This project is created for educational purposes.

## Contributing

This is an educational project. Feel free to fork, modify, and use it for learning purposes.

---

**Enjoy learning how CPUs work!** 🚀

