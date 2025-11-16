import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SimulationEngine } from './utils/simulationEngine'
import { ExampleType, CalculatorExample, TrafficLightExample, InstructionPhase } from '@/types/cpu'
import CPU from './components/CPU'
import Memory from './components/Memory'
import Cache from './components/Cache'
import Bus from './components/Bus'
import IODevice from './components/IODevice'
import CodeView from './components/CodeView'
import ConnectionLayer from './components/ConnectionLayer'
import Clock from './components/Clock'

const instructionPhases: InstructionPhase[] = [
  InstructionPhase.FETCH,
  InstructionPhase.DECODE,
  InstructionPhase.EXECUTE,
  InstructionPhase.STORE,
]

function SimulationPage() {
  const navigate = useNavigate()
  const [engine] = useState(() => new SimulationEngine())
  const [state, setState] = useState(engine.getState())
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0)
  const [isDetailedMode, setIsDetailedMode] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize with calculator example
  useEffect(() => {
    const calcExample: CalculatorExample = {
      input1: 5,
      input2: 3,
      operation: '+',
      result: null,
      steps: [],
    }
    engine.setExample(ExampleType.CALCULATOR, calcExample)
    setState(engine.getState())
  }, [engine])

  // Auto-play logic
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        const hasMore = engine.step()
        const newState = engine.getState()
        setState(newState)
        
        // Update instruction index from engine
        setCurrentInstructionIndex(engine.getCurrentInstructionIndex())

        if (!hasMore) {
          setIsPlaying(false)
        }
      }, state.speed)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, state.speed, engine])

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleStep = () => {
    const hasMore = engine.step()
    const newState = engine.getState()
    setState(newState)
    setCurrentInstructionIndex(engine.getCurrentInstructionIndex())

    if (!hasMore) {
      setIsPlaying(false)
    }
  }

  const handleReset = () => {
    setIsPlaying(false)
    engine.reset()
    setCurrentInstructionIndex(0)
    
    // Re-initialize with current example
    if (state.currentExample === ExampleType.CALCULATOR) {
      const calcExample: CalculatorExample = {
        input1: 5,
        input2: 3,
        operation: '+',
        result: null,
        steps: [],
      }
      engine.setExample(ExampleType.CALCULATOR, calcExample)
    } else {
      const trafficExample: TrafficLightExample = {
        currentState: 'RED',
        timer: 0,
        sensorInput: false,
        steps: [],
      }
      engine.setExample(ExampleType.TRAFFIC_LIGHT, trafficExample)
    }
    
    setState(engine.getState())
  }

  const handleExampleChange = (exampleType: ExampleType) => {
    setIsPlaying(false)
    setCurrentInstructionIndex(0)
    
    if (exampleType === ExampleType.CALCULATOR) {
      const calcExample: CalculatorExample = {
        input1: 5,
        input2: 3,
        operation: '+',
        result: null,
        steps: [],
      }
      engine.setExample(ExampleType.CALCULATOR, calcExample)
    } else {
      const trafficExample: TrafficLightExample = {
        currentState: 'RED',
        timer: 0,
        sensorInput: true,
        steps: [],
      }
      engine.setExample(ExampleType.TRAFFIC_LIGHT, trafficExample)
    }
    
    setState(engine.getState())
  }

  const handleSpeedChange = (speed: number) => {
    engine.setSpeed(speed)
    setState(engine.getState())
  }

  const handleToggleCodeView = () => {
    engine.toggleCodeView()
    setState(engine.getState())
  }

  const handleCodeViewModeChange = (mode: 'assembly' | 'machine') => {
    engine.setCodeViewMode(mode)
    setState(engine.getState())
  }

  // Get current instructions from engine
  const currentInstructions = engine.getCurrentInstructions()
  const currentInstructionIdx = engine.getCurrentInstructionIndex()

  // Get input/output values based on example
  const inputValue = state.currentExample === ExampleType.CALCULATOR 
    ? `${5} + ${3}`
    : state.currentExample === ExampleType.TRAFFIC_LIGHT
    ? true
    : undefined

  const outputValue = state.currentExample === ExampleType.CALCULATOR
    ? state.cpu.registers.find((r) => r.name === 'R3')?.value
    : state.currentExample === ExampleType.TRAFFIC_LIGHT
    ? ['RED', 'YELLOW', 'GREEN'][state.cpu.registers.find((r) => r.name === 'R3')?.value || 0]
    : undefined

  const exampleDescriptions = useMemo(
    () => ({
      [ExampleType.CALCULATOR]: 'Trace arithmetic through registers, the ALU, and cache hierarchy.',
      [ExampleType.TRAFFIC_LIGHT]: 'Watch sensor inputs propagate through control logic and I/O buses.',
    }),
    [],
  )

  const activePhaseIndex = instructionPhases.indexOf(state.cpu.currentPhase as InstructionPhase)
  const nextPhase = activePhaseIndex >= 0 && activePhaseIndex < instructionPhases.length - 1
    ? instructionPhases[activePhaseIndex + 1]
    : InstructionPhase.FETCH

  const activeExampleLabel =
    state.currentExample === ExampleType.CALCULATOR ? 'Calculator Example' : 'Traffic Light Controller'

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="ambient-grid" />
        <div className="floating-orb" style={{ top: '5%', right: '-10%', background: 'rgba(14,165,233,0.45)' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 py-10">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300 mb-2">Simulation Lab</p>
            <h1 className="text-4xl font-bold mb-2">CPU Simulation</h1>
            <p className="text-slate-300 max-w-2xl">
              Follow data as it travels from input devices through the operating system layers, cache hierarchy, and into
              the CPU&apos;s fetch–decode–execute–store rhythm.
            </p>
          </div>
          <motion.button
            onClick={() => navigate('/')}
            className="px-5 py-3 rounded-2xl border border-white/20 hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            ← Back to Home
          </motion.button>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="panel-surface p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Current Phase</p>
            <p className="text-2xl font-semibold">{state.cpu.currentPhase}</p>
            <p className="text-sm text-slate-400 mt-1">Next: {nextPhase}</p>
          </div>
          <div className="panel-surface p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Active Example</p>
            <p className="text-2xl font-semibold">{activeExampleLabel}</p>
            <p className="text-sm text-slate-400 mt-1">{exampleDescriptions[state.currentExample]}</p>
          </div>
          <div className="panel-surface p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Clock Cycle</p>
            <p className="text-2xl font-semibold font-mono">{state.cpu.clockCycle}</p>
            <p className="text-sm text-slate-400 mt-1">Program Counter: 0x{state.cpu.programCounter.toString(16).toUpperCase()}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="panel-surface p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              {!isPlaying ? (
                <motion.button
                  onClick={handlePlay}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 font-semibold shadow-glow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ▶ Play
                </motion.button>
              ) : (
                <motion.button
                  onClick={handlePause}
                  className="px-4 py-2 rounded-xl bg-yellow-500/90 text-gray-900 font-semibold shadow-glow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ⏸ Pause
                </motion.button>
              )}
              <motion.button
                onClick={handleStep}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ⏭ Step
              </motion.button>
              <motion.button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ↻ Reset
              </motion.button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">Example:</label>
              <select
                value={state.currentExample}
                onChange={(e) => handleExampleChange(e.target.value as ExampleType)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white"
              >
                <option value={ExampleType.CALCULATOR}>Calculator (5 + 3)</option>
                <option value={ExampleType.TRAFFIC_LIGHT}>Traffic Light Controller</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">Speed:</label>
              <input
                type="range"
                min="100"
                max="60000"
                step="100"
                value={state.speed}
                onChange={(e) => handleSpeedChange(Number(e.target.value))}
                className="w-48"
              />
              <span className="text-sm text-gray-300">
                {state.speed < 1000 ? `${state.speed}ms` : `${(state.speed / 1000).toFixed(1)}s`}
              </span>
            </div>

            <motion.button
              onClick={handleToggleCodeView}
              className={`px-4 py-2 rounded-xl font-semibold ${
                state.showCodeView ? 'bg-blue-600 hover:bg-blue-500' : 'bg-white/10 hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {state.showCodeView ? 'Hide' : 'Show'} Code View
            </motion.button>

            <motion.button
              onClick={() => setIsDetailedMode(!isDetailedMode)}
              className={`px-4 py-2 rounded-xl font-semibold ${
                isDetailedMode ? 'bg-purple-600 hover:bg-purple-500' : 'bg-white/10 hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDetailedMode ? 'Simple' : 'Detailed'} Mode
            </motion.button>
          </div>
        </div>

        <div className="panel-surface p-5 mb-8">
          <div className="flex flex-wrap gap-3">
            {instructionPhases.map((phase) => (
              <span
                key={phase}
                className={`panel-chip text-xs ${
                  phase === state.cpu.currentPhase ? 'text-white border-sky-400 text-opacity-100' : 'text-slate-400'
                }`}
              >
                {phase}
              </span>
            ))}
          </div>
        </div>

        {/* Main Content - Grid Layout */}
        <div ref={containerRef} className="relative panel-surface p-5 min-h-[800px]">
          {/* Connection Layer Overlay */}
          <ConnectionLayer
            busTransfers={state.busTransfers}
            speed={state.speed}
            containerRef={containerRef}
          />

          {/* Clock - Top Center (only when active) */}
          {state.cpu.currentPhase !== InstructionPhase.IDLE && (
            <div className="flex justify-center mb-6">
              <div className="w-64">
                <Clock
                  clockCycle={state.cpu.clockCycle}
                  currentPhase={state.cpu.currentPhase}
                  isActive={state.cpu.currentPhase !== InstructionPhase.IDLE}
                />
              </div>
            </div>
          )}

          {/* Main Components Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            {/* Left Column - IO Device */}
            <div className="lg:col-span-2">
              <IODevice
                exampleType={state.currentExample}
                inputValue={inputValue}
                outputValue={outputValue}
                isActive={state.cpu.currentPhase !== 'IDLE'}
              />
            </div>

            {/* Center Left - Memory and Cache */}
            <div className="lg:col-span-3 space-y-6">
              <Memory memory={state.cpu.memory} maxVisible={16} columns={4} />
              {isDetailedMode && (
                <Cache
                  cache={state.cpu.cache}
                  isActive={state.cpu.currentPhase !== 'IDLE'}
                />
              )}
            </div>

            {/* Center - CPU Core */}
            <div className="lg:col-span-4">
              <CPU
                registers={state.cpu.registers}
                currentInstruction={state.cpu.instructionRegister}
                currentPhase={state.cpu.currentPhase}
              />
            </div>

            {/* Right Column - Code View */}
            <div className="lg:col-span-3">
              {state.showCodeView ? (
                <CodeView
                  instructions={currentInstructions}
                  currentInstructionIndex={currentInstructionIdx}
                  mode={state.codeViewMode}
                  onModeChange={handleCodeViewModeChange}
                />
              ) : (
                <div className="panel-surface p-6 text-center text-gray-400 border border-white/10">
                  Code View Hidden
                </div>
              )}
            </div>
          </div>

          {/* Bus - Bottom */}
          <div className="mt-6">
            <Bus transfers={state.busTransfers} />
          </div>
        </div>

        {/* Status Bar */}
        <div className="panel-surface p-5 mt-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-400">Clock Cycle: </span>
                <span className="text-white font-mono">{state.cpu.clockCycle}</span>
              </div>
              <div>
                <span className="text-gray-400">Program Counter: </span>
                <span className="text-white font-mono">0x{state.cpu.programCounter.toString(16).toUpperCase()}</span>
              </div>
              <div>
                <span className="text-gray-400">Phase: </span>
                <span className="text-white font-semibold">{state.cpu.currentPhase}</span>
              </div>
            </div>
            {/* Clock - Right side when idle */}
            {state.cpu.currentPhase === InstructionPhase.IDLE && (
              <div className="w-24">
                <Clock
                  clockCycle={state.cpu.clockCycle}
                  currentPhase={state.cpu.currentPhase}
                  isActive={false}
                  compact={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimulationPage

