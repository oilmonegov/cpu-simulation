import { motion } from 'framer-motion'

interface ScoreDisplayProps {
  score: number
  accuracy: number
  speedBonus: number
  efficiencyBonus: number
}

function ScoreDisplay({ score, accuracy, speedBonus, efficiencyBonus }: ScoreDisplayProps) {
  return (
    <div className="bg-gradient-to-br from-blue-900 to-purple-900 p-6 rounded-lg border-2 border-blue-500">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">Score</h2>
      <motion.div
        className="text-5xl font-bold text-center text-yellow-400 mb-4"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
      >
        {score.toLocaleString()}
      </motion.div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-gray-300 mb-1">Accuracy</div>
          <div className="text-lg font-semibold text-white">{accuracy.toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-xs text-gray-300 mb-1">Speed</div>
          <div className="text-lg font-semibold text-green-400">+{speedBonus}%</div>
        </div>
        <div>
          <div className="text-xs text-gray-300 mb-1">Efficiency</div>
          <div className="text-lg font-semibold text-blue-400">+{efficiencyBonus.toFixed(0)}%</div>
        </div>
      </div>
    </div>
  )
}

export default ScoreDisplay

