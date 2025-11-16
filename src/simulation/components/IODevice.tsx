import { motion } from 'framer-motion'
import { ExampleType } from '@/types/cpu'

interface IODeviceProps {
  exampleType: ExampleType
  inputValue?: number | string
  outputValue?: number | string
  isActive?: boolean
}

function IODevice({ exampleType, inputValue, outputValue, isActive }: IODeviceProps) {
  if (exampleType === ExampleType.CALCULATOR) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700" data-component-id="io-device">
        <h3 className="text-lg font-semibold text-white mb-4">I/O Devices</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-400 mb-2">Input (Keyboard)</div>
            <motion.div
              className={`p-3 rounded border font-mono ${
                isActive ? 'bg-blue-600 border-blue-400' : 'bg-gray-800 border-gray-600'
              }`}
              animate={{ scale: isActive ? 1.05 : 1 }}
            >
              <div className="text-white">{inputValue || 'Waiting...'}</div>
            </motion.div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-2">Output (Display)</div>
            <motion.div
              className={`p-3 rounded border font-mono ${
                outputValue !== undefined ? 'bg-green-600 border-green-400' : 'bg-gray-800 border-gray-600'
              }`}
              animate={{ scale: outputValue !== undefined ? 1.05 : 1 }}
            >
              <div className="text-white">{outputValue !== undefined ? outputValue : '---'}</div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  } else {
    // Traffic Light
    return (
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700" data-component-id="io-device">
        <h3 className="text-lg font-semibold text-white mb-4">I/O Devices</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-400 mb-2">Input (Sensor)</div>
            <motion.div
              className={`p-3 rounded border ${
                isActive ? 'bg-blue-600 border-blue-400' : 'bg-gray-800 border-gray-600'
              }`}
              animate={{ scale: isActive ? 1.05 : 1 }}
            >
              <div className="text-white">{inputValue ? 'Car Detected' : 'No Car'}</div>
            </motion.div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-2">Output (Traffic Light)</div>
            <motion.div className="flex gap-2">
              {(['RED', 'YELLOW', 'GREEN'] as const).map((color) => {
                const isActive = outputValue === color
                let bgColor = 'bg-gray-700'
                if (isActive) {
                  if (color === 'RED') bgColor = 'bg-red-500'
                  else if (color === 'YELLOW') bgColor = 'bg-yellow-500'
                  else if (color === 'GREEN') bgColor = 'bg-green-500'
                }
                return (
                  <motion.div
                    key={color}
                    className={`w-16 h-16 rounded-full border-2 ${
                      isActive
                        ? `${bgColor} border-white shadow-lg`
                        : 'bg-gray-700 border-gray-600 opacity-30'
                    }`}
                    animate={{
                      scale: isActive ? 1.2 : 1,
                    }}
                  />
                )
              })}
            </motion.div>
          </div>
        </div>
      </div>
    )
  }
}

export default IODevice

