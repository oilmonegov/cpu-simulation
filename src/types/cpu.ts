/**
 * Type definitions for CPU Simulator components
 * These types represent the core data structures used throughout the simulation and gamification modules
 */

// CPU Instruction Structure
export interface Instruction {
  id: string;
  opcode: Opcode;
  operand1?: number | string;
  operand2?: number | string;
  destination?: string;
  address?: number;
  description: string;
}

// CPU Opcodes
export enum Opcode {
  LOAD = 'LOAD',
  STORE = 'STORE',
  ADD = 'ADD',
  SUB = 'SUB',
  MUL = 'MUL',
  DIV = 'DIV',
  JMP = 'JMP',
  JZ = 'JZ',
  JNZ = 'JNZ',
  HALT = 'HALT',
  MOV = 'MOV',
}

// Register State
export interface Register {
  name: string;
  value: number;
  active: boolean;
  description: string;
}

// Memory Location
export interface MemoryLocation {
  address: number;
  value: number;
  active: boolean;
  used: boolean; // Whether this address has been read from or written to
  label?: string;
}

// Cache Levels
export enum CacheLevel {
  L1 = 'L1',
  L2 = 'L2',
  L3 = 'L3',
}

// Cache Line
export interface CacheLine {
  address: number;
  value: number;
  valid: boolean;
  dirty: boolean;
  lastAccessed: number;
}

// Cache State
export interface CacheState {
  level: CacheLevel;
  lines: CacheLine[];
  hits: number;
  misses: number;
  size: number; // number of cache lines
  activeAddress?: number; // currently accessed address
  isHit?: boolean; // whether current access is a hit or miss
}

// Bus Types
export enum BusType {
  DATA = 'DATA',
  ADDRESS = 'ADDRESS',
  CONTROL = 'CONTROL',
}

// Bus Transfer
export interface BusTransfer {
  id: string;
  type: BusType;
  from: string;
  to: string;
  value: number;
  active: boolean;
  timestamp: number;
}

// CPU State
export interface CPUState {
  registers: Register[];
  memory: MemoryLocation[];
  cache: CacheState[];
  programCounter: number;
  instructionRegister: Instruction | null;
  currentPhase: InstructionPhase;
  clockCycle: number;
  isRunning: boolean;
  isPaused: boolean;
}

// Instruction Execution Phases
export enum InstructionPhase {
  FETCH = 'FETCH',
  DECODE = 'DECODE',
  EXECUTE = 'EXECUTE',
  STORE = 'STORE',
  IDLE = 'IDLE',
}

// Simulation State
export interface SimulationState {
  cpu: CPUState;
  currentExample: ExampleType;
  speed: number; // milliseconds per cycle
  showCodeView: boolean;
  codeViewMode: 'assembly' | 'machine';
  busTransfers: BusTransfer[];
  history: SimulationStep[];
}

// Simulation Step (for history/playback)
export interface SimulationStep {
  cycle: number;
  phase: InstructionPhase;
  instruction: Instruction | null;
  registerChanges: { name: string; oldValue: number; newValue: number }[];
  memoryChanges: { address: number; oldValue: number; newValue: number }[];
}

// Example Types
export enum ExampleType {
  CALCULATOR = 'CALCULATOR',
  TRAFFIC_LIGHT = 'TRAFFIC_LIGHT',
}

// Calculator Example State
export interface CalculatorExample {
  input1: number;
  input2: number;
  operation: '+' | '-' | '*' | '/';
  result: number | null;
  steps: Instruction[];
}

// Traffic Light Example State
export interface TrafficLightExample {
  currentState: 'RED' | 'YELLOW' | 'GREEN';
  timer: number;
  sensorInput: boolean; // Car detected
  steps: Instruction[];
}

// Game State
export interface GameState {
  mode: GameMode;
  level: number;
  score: number;
  energy: number;
  maxEnergy: number;
  clockCycle: number;
  taskQueue: GameTask[];
  registers: Register[];
  isPlaying: boolean;
  accuracy: number;
  efficiency: number;
  speedBonus: number;
}

// Game Modes
export enum GameMode {
  CALCULATOR = 'CALCULATOR',
  TRAFFIC_LIGHT = 'TRAFFIC_LIGHT',
}

// Game Task
export interface GameTask {
  id: string;
  type: 'calculation' | 'traffic_control';
  operation?: {
    operand1: number;
    operand2: number;
    operator: '+' | '-' | '*' | '/';
    expectedResult: number;
  };
  trafficScenario?: {
    currentState: 'RED' | 'YELLOW' | 'GREEN';
    sensorInput: boolean;
    expectedAction: 'RED' | 'YELLOW' | 'GREEN';
  };
  priority: number;
  timeLimit: number; // clock cycles
  points: number;
}

// Game Performance Metrics
export interface GameMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageAccuracy: number;
  averageEfficiency: number;
  totalScore: number;
  levelProgress: number;
}

