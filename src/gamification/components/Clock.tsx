import { motion } from 'framer-motion'

interface ClockProps {
  cycle: number
  isPulsing?: boolean
}

function Clock({ cycle, isPulsing = false }: ClockProps) {
  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">CPU Clock</h3>
      <div className="flex items-center justify-center">
        <motion.div
          className="w-24 h-24 rounded-full border-4 border-blue-500 flex items-center justify-center bg-gray-800"
          animate={{
            scale: isPulsing ? [1, 1.1, 1] : 1,
            boxShadow: isPulsing
              ? ['0 0 0px rgba(59, 130, 246, 0.5)', '0 0 20px rgba(59, 130, 246, 0.8)', '0 0 0px rgba(59, 130, 246, 0.5)']
              : '0 0 0px rgba(59, 130, 246, 0.5)',
          }}
          transition={{
            duration: 1,
            repeat: isPulsing ? Infinity : 0,
          }}
        >
          <div className="text-2xl font-mono font-bold text-blue-400">{cycle}</div>
        </motion.div>
      </div>
      <div className="text-center text-sm text-gray-400 mt-4">Clock Cycles</div>
    </div>
  )
}

export default Clock

