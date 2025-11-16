import { motion } from 'framer-motion'

interface HUDProps {
  score: number
  level: number
  accuracy: number
  efficiency: number
  speedBonus: number
}

function HUD({ score, level, accuracy, efficiency, speedBonus }: HUDProps) {
  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Score</span>
            <span className="text-white font-bold">{score.toLocaleString()}</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Level</span>
            <span className="text-yellow-400 font-bold">{level}</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Accuracy</span>
            <span className="text-white font-semibold">{accuracy.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${accuracy}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Efficiency</span>
            <span className="text-white font-semibold">{efficiency.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${efficiency}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        {speedBonus > 0 && (
          <div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Speed Bonus</span>
              <span className="text-green-400 font-semibold">+{speedBonus}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HUD

