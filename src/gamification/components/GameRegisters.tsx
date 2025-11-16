import { motion } from 'framer-motion'
import { Register } from '@/types/cpu'

interface GameRegistersProps {
  registers: Register[]
  onRegisterClick?: (register: Register) => void
  selectedRegister?: string
}

function GameRegisters({ registers, onRegisterClick, selectedRegister }: GameRegistersProps) {
  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Registers</h3>
      <div className="grid grid-cols-3 gap-3">
        {registers.map((register) => (
          <motion.button
            key={register.name}
            onClick={() => onRegisterClick?.(register)}
            className={`p-3 rounded-lg border-2 transition-all ${
              register.active
                ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/50'
                : selectedRegister === register.name
                ? 'bg-gray-700 border-yellow-500'
                : 'bg-gray-800 border-gray-600 hover:border-gray-500'
            }`}
            animate={{
              scale: register.active ? 1.05 : selectedRegister === register.name ? 1.02 : 1,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-xs font-semibold text-gray-300 mb-1">{register.name}</div>
            <div className="text-lg font-mono text-white">
              {register.value.toString(16).toUpperCase().padStart(4, '0')}
            </div>
            <div className="text-xs text-gray-400 mt-1">{register.value}</div>
          </motion.button>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-4 text-center">
        Click registers to use in operations
      </div>
    </div>
  )
}

export default GameRegisters

