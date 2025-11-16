import { motion } from 'framer-motion'

interface EnergyMeterProps {
  current: number
  max: number
}

function EnergyMeter({ current, max }: EnergyMeterProps) {
  const percentage = (current / max) * 100
  const isLow = percentage < 20
  const isMedium = percentage < 50

  const getColor = () => {
    if (isLow) return 'bg-red-500'
    if (isMedium) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Energy</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Current</span>
          <span className={`font-bold ${isLow ? 'text-red-400' : isMedium ? 'text-yellow-400' : 'text-green-400'}`}>
            {current.toFixed(1)} / {max}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
          <motion.div
            className={`h-full ${getColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">{percentage.toFixed(0)}%</span>
            </div>
          </motion.div>
        </div>
        {isLow && (
          <motion.div
            className="text-xs text-red-400 text-center"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ⚠ Low Energy Warning
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default EnergyMeter

