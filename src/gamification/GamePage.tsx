import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GameEngine } from './logic/gameEngine'
import { GameMode, GameTask, Instruction, Opcode } from '@/types/cpu'
import TaskQueue from './components/TaskQueue'
import Clock from './components/Clock'
import GameRegisters from './components/GameRegisters'
import HUD from './components/HUD'
import EnergyMeter from './components/EnergyMeter'
import ScoreDisplay from './components/ScoreDisplay'

function GamePage() {
  const navigate = useNavigate()
  const [engine] = useState(() => new GameEngine())
  const [state, setState] = useState(engine.getState())
  const [selectedTask, setSelectedTask] = useState<GameTask | null>(null)
  const [selectedRegister, setSelectedRegister] = useState<string | null>(null)
  const [playerInput, setPlayerInput] = useState<string>('')
  const [gameStarted, setGameStarted] = useState(false)
  const intervalRef = useRef<number | null>(null)

  // Game loop
  useEffect(() => {
    if (state.isPlaying && gameStarted) {
      intervalRef.current = window.setInterval(() => {
        engine.advanceClock()
        setState(engine.getState())
      }, 1000) // Advance clock every second
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
  }, [state.isPlaying, gameStarted, engine])

  const handleStartGame = (mode: GameMode) => {
    engine.startGame(mode)
    setGameStarted(true)
    setState(engine.getState())
  }

  const handleRegisterClick = (registerName: string) => {
    setSelectedRegister(registerName)
  }

  const handleExecuteInstruction = (opcode: Opcode, operand1?: number | string, operand2?: number | string) => {
    if (!selectedTask) return

    const instruction: Instruction = {
      id: `inst-${Date.now()}`,
      opcode,
      operand1: operand1 || (selectedRegister || undefined),
      operand2: operand2 || (selectedRegister || undefined),
      destination: 'R3',
      description: `Execute ${opcode}`,
    }

    const result = engine.processPlayerAction(instruction)
    setState(engine.getState())

    if (result.success) {
      setSelectedRegister(null)
    }
  }

  const handleSubmitResult = () => {
    if (!selectedTask) return

    let result: number | 'RED' | 'YELLOW' | 'GREEN'
    if (selectedTask.type === 'calculation') {
      result = parseFloat(playerInput)
      if (isNaN(result)) {
        alert('Please enter a valid number')
        return
      }
    } else {
      // For traffic light, we'd need a UI to select the state
      // For now, use the input as a number and map it
      const num = parseInt(playerInput)
      if (num === 0) result = 'RED'
      else if (num === 1) result = 'YELLOW'
      else if (num === 2) result = 'GREEN'
      else {
        alert('Enter 0 for RED, 1 for YELLOW, or 2 for GREEN')
        return
      }
    }

    const submitResult = engine.submitTaskResult(selectedTask.id, result)
    setState(engine.getState())
    setPlayerInput('')
    setSelectedTask(null)

    if (submitResult.success) {
      // Show success feedback
    } else {
      // Show failure feedback
    }
  }

  const handleTaskSelect = (task: GameTask) => {
    setSelectedTask(task)
  }

  const handlePause = () => {
    engine.togglePause()
    setState(engine.getState())
  }

  const handleReset = () => {
    engine.reset()
    setGameStarted(false)
    setSelectedTask(null)
    setPlayerInput('')
    setState(engine.getState())
  }

  if (!gameStarted) {
    return (
      <div className="relative min-h-screen overflow-hidden text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="ambient-grid" />
          <div className="floating-orb" style={{ top: '10%', left: '-5%', background: 'rgba(56,189,248,0.5)' }} />
          <div className="floating-orb" style={{ bottom: '-10%', right: '-10%', background: 'rgba(16,185,129,0.45)' }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel-surface p-10 text-center"
          >
            <p className="panel-chip inline-flex items-center justify-center gap-2 text-cyan-200 mb-5">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Gamification Arena
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Play as the CPU</h1>
            <p className="text-lg text-slate-300 mb-10">
              Take control of registers, manage energy, and keep the system stable. Every clock tick counts toward your
              score.
            </p>

            <div className="grid gap-4 md:grid-cols-2 text-left mb-10">
              <div className="panel-surface p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Calculator Mode</p>
                <p className="text-sm text-slate-300">Process math tasks quickly with limited registers and energy.</p>
              </div>
              <div className="panel-surface p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Traffic Light Mode</p>
                <p className="text-sm text-slate-300">Balance sensor input, timers, and signal updates like a control CPU.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <motion.button
                onClick={() => handleStartGame(GameMode.CALCULATOR)}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 font-semibold shadow-glow"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Start Calculator Mode
              </motion.button>
              <motion.button
                onClick={() => handleStartGame(GameMode.TRAFFIC_LIGHT)}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-lime-500 to-yellow-400 font-semibold shadow-glow"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Start Traffic Mode
              </motion.button>
            </div>

            <motion.button
              onClick={() => navigate('/')}
              className="mt-8 w-full px-4 py-3 rounded-2xl border border-white/20 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              ← Back to Home
            </motion.button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="ambient-grid" />
        <div className="floating-orb" style={{ top: '-5%', right: '-10%', background: 'rgba(59,130,246,0.4)' }} />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300 mb-2">Gamification Arena</p>
            <h1 className="text-4xl font-bold">CPU Challenge Mode</h1>
            <p className="text-slate-300 mt-2 max-w-2xl">
              Process incoming tasks, juggle registers, and return results before the clock drains your energy.
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button
              onClick={handlePause}
              className="px-4 py-2 rounded-2xl border border-white/20 hover:bg-white/10 transition-colors font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {state.isPlaying ? '⏸ Pause' : '▶ Resume'}
            </motion.button>
            <motion.button
              onClick={handleReset}
              className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ↻ Reset
            </motion.button>
            <motion.button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-2xl border border-white/20 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ← Home
            </motion.button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="panel-surface p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Clock Cycle</p>
            <p className="text-2xl font-semibold font-mono">{state.clockCycle}</p>
            <p className="text-sm text-slate-400 mt-1">{state.isPlaying ? 'Live' : 'Standing by'}</p>
          </div>
          <div className="panel-surface p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Energy</p>
            <p className="text-2xl font-semibold text-emerald-300">
              {state.energy}/{state.maxEnergy}
            </p>
            <p className="text-sm text-slate-400 mt-1">Optimize instructions to save energy.</p>
          </div>
          <div className="panel-surface p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Queue</p>
            <p className="text-2xl font-semibold">{state.taskQueue.length} Tasks</p>
            <p className="text-sm text-slate-400 mt-1">Keep throughput high for score multipliers.</p>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="panel-surface p-6">
              <ScoreDisplay
                score={state.score}
                accuracy={state.accuracy}
                speedBonus={state.speedBonus}
                efficiencyBonus={state.efficiency}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="panel-surface p-6">
                <Clock cycle={state.clockCycle} isPulsing={state.isPlaying} />
              </div>
              <div className="panel-surface p-6">
                <EnergyMeter current={state.energy} max={state.maxEnergy} />
              </div>
            </div>

            <div className="panel-surface p-6">
              <TaskQueue tasks={state.taskQueue} onTaskSelect={handleTaskSelect} />
            </div>

            <div className="panel-surface p-6">
              <GameRegisters
                registers={state.registers}
                onRegisterClick={handleRegisterClick}
                selectedRegister={selectedRegister}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="panel-surface p-6">
              <HUD
                score={state.score}
                level={state.level}
                accuracy={state.accuracy}
                efficiency={state.efficiency}
                speedBonus={state.speedBonus}
              />
            </div>

            {/* Instruction Panel */}
            <div className="panel-surface p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Instructions</h3>
              <div className="space-y-2 mb-4">
                <motion.button
                  onClick={() => handleExecuteInstruction(Opcode.LOAD, 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-left transition-colors"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  LOAD (Load value into register)
                </motion.button>
                <motion.button
                  onClick={() => handleExecuteInstruction(Opcode.ADD)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-left transition-colors"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ADD (Add two values)
                </motion.button>
                <motion.button
                  onClick={() => handleExecuteInstruction(Opcode.SUB)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-left transition-colors"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  SUB (Subtract two values)
                </motion.button>
                <motion.button
                  onClick={() => handleExecuteInstruction(Opcode.MUL)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-left transition-colors"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  MUL (Multiply two values)
                </motion.button>
              </div>
            </div>

            {/* Task Input */}
            {selectedTask && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="panel-surface p-6 border border-blue-500/40"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Current Task</h3>
                {selectedTask.type === 'calculation' && selectedTask.operation ? (
                  <div className="space-y-4">
                    <div className="text-white">
                      Calculate: {selectedTask.operation.operand1} {selectedTask.operation.operator}{' '}
                      {selectedTask.operation.operand2}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={playerInput}
                        onChange={(e) => setPlayerInput(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                        placeholder="Enter result"
                      />
                      <motion.button
                        onClick={handleSubmitResult}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Submit
                      </motion.button>
                    </div>
                  </div>
                ) : selectedTask.type === 'traffic_control' && selectedTask.trafficScenario ? (
                  <div className="space-y-4">
                    <div className="text-white">
                      Current: {selectedTask.trafficScenario.currentState}
                      <br />
                      Sensor: {selectedTask.trafficScenario.sensorInput ? 'Car detected' : 'No car'}
                      <br />
                      Expected: {selectedTask.trafficScenario.expectedAction}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={playerInput}
                        onChange={(e) => setPlayerInput(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                        placeholder="0=RED, 1=YELLOW, 2=GREEN"
                        min="0"
                        max="2"
                      />
                      <motion.button
                        onClick={handleSubmitResult}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Submit
                      </motion.button>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GamePage

