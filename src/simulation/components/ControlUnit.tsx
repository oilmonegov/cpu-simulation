import { motion } from 'framer-motion'
import { InstructionPhase } from '@/types/cpu'
import Tooltip from './Tooltip'

interface ControlUnitProps {
  currentPhase: InstructionPhase
}

function ControlUnit({ currentPhase }: ControlUnitProps) {
  const phases: InstructionPhase[] = [
    InstructionPhase.FETCH,
    InstructionPhase.DECODE,
    InstructionPhase.EXECUTE,
    InstructionPhase.STORE,
  ]

  const getPhaseColor = (phase: InstructionPhase, isActive: boolean) => {
    if (!isActive) return 'bg-gray-700 text-gray-400'
    switch (phase) {
      case InstructionPhase.FETCH:
        return 'bg-blue-600 text-white'
      case InstructionPhase.DECODE:
        return 'bg-yellow-600 text-white'
      case InstructionPhase.EXECUTE:
        return 'bg-green-600 text-white'
      case InstructionPhase.STORE:
        return 'bg-purple-600 text-white'
      default:
        return 'bg-gray-700 text-gray-400'
    }
  }

  return (
    <Tooltip content="Control Unit - Manages the instruction cycle (Fetch, Decode, Execute, Store)">
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 overflow-hidden" data-component-id="control-unit">
        <div className="text-lg font-semibold text-white mb-4">Control Unit</div>
        <div className="flex flex-wrap gap-2">
          {phases.map((phase) => {
            const isActive = currentPhase === phase
            return (
              <motion.div
                key={phase}
                className={`px-3 py-2 rounded text-xs font-semibold flex-shrink-0 ${getPhaseColor(phase, isActive)}`}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {phase}
              </motion.div>
            )
          })}
        </div>
      </div>
    </Tooltip>
  )
}

export default ControlUnit

