/**
 * Clock Component
 * Prominent clock display that emphasizes when cycles trigger
 */

import { motion } from 'framer-motion'
import { InstructionPhase } from '@/types/cpu'
import Tooltip from './Tooltip'

interface ClockProps {
  clockCycle: number
  currentPhase: InstructionPhase
  isActive: boolean
  compact?: boolean
}

function Clock({ clockCycle, currentPhase, isActive, compact = false }: ClockProps) {
  const phaseColors: Record<InstructionPhase, string> = {
    [InstructionPhase.FETCH]: 'bg-blue-500',
    [InstructionPhase.DECODE]: 'bg-yellow-500',
    [InstructionPhase.EXECUTE]: 'bg-green-500',
    [InstructionPhase.STORE]: 'bg-purple-500',
    [InstructionPhase.IDLE]: 'bg-gray-500',
  }

  const phaseColor = phaseColors[currentPhase] || 'bg-gray-500'

  return (
    <Tooltip content="Clock Cycle - Synchronizes all CPU operations. Each cycle advances the instruction execution.">
      <motion.div
        data-component-id="clock"
        className={`relative ${compact ? 'p-3' : 'p-8'} rounded-full ${compact ? 'border-2' : 'border-4'} ${
          isActive ? `${phaseColor} border-white` : 'bg-gray-800 border-gray-600'
        } ${compact ? 'shadow-lg' : 'shadow-2xl'}`}
        animate={{
          scale: isActive ? [1, 1.12, 1] : 1,
          boxShadow: isActive
            ? [
                '0 0 0px rgba(59, 130, 246, 0)',
                '0 0 35px rgba(59, 130, 246, 0.7)',
                '0 0 0px rgba(59, 130, 246, 0)',
              ]
            : '0 0 0px rgba(0, 0, 0, 0)',
        }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <div className="text-center">
          {!compact && (
            <div className="text-sm font-semibold text-white mb-2 opacity-90">CLOCK</div>
          )}
          <motion.div
            className={`${compact ? 'text-xl' : 'text-4xl'} font-bold text-white font-mono`}
            key={clockCycle}
            initial={{ scale: 0.7, opacity: 0.4, y: -5 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            {clockCycle}
          </motion.div>
          {!compact && (
            <div className="text-xs text-white mt-2 opacity-75">{currentPhase}</div>
          )}
        </div>
        
        {/* Animated ring */}
        {isActive && (
          <motion.div
            className={`absolute inset-0 rounded-full border-4 ${phaseColor} opacity-30`}
            animate={{
              scale: [1, 1.5, 1.5],
              opacity: [0.3, 0, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
      </motion.div>
    </Tooltip>
  )
}

export default Clock

