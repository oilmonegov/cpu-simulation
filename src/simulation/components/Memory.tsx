import { motion } from 'framer-motion'
import { MemoryLocation } from '@/types/cpu'

interface MemoryProps {
  memory: MemoryLocation[]
  maxVisible?: number
  columns?: number
}

function Memory({ memory, maxVisible = 16, columns = 4 }: MemoryProps) {
  const visibleMemory = memory.slice(0, maxVisible)
  const rows = Math.ceil(visibleMemory.length / columns)

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700" data-component-id="memory">
      <h3 className="text-lg font-semibold text-white mb-3">Memory</h3>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: rows * columns }).map((_, index) => {
          const mem = visibleMemory[index]
          if (!mem) {
            return <div key={`empty-${index}`} className="aspect-square" /> // Empty cell
          }
          
          // Determine styling based on active and used states
          const getCellClassName = () => {
            if (mem.active) {
              return 'bg-green-600/20 border-green-400 shadow-md shadow-green-500/30'
            }
            if (mem.used) {
              return 'bg-blue-600/10 border-blue-500/50 hover:bg-blue-600/20'
            }
            return 'bg-gray-800/50 border-gray-600/50 hover:bg-gray-800'
          }

          return (
            <motion.div
              key={mem.address}
              className={`aspect-square flex flex-col items-center justify-center rounded border font-mono text-xs transition-all ${getCellClassName()}`}
              animate={{
                scale: mem.active ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
              title={`Address: 0x${mem.address.toString(16).padStart(2, '0').toUpperCase()}, Value: 0x${mem.value.toString(16).padStart(2, '0').toUpperCase()}${mem.used ? ' (Used)' : ''}`}
            >
              <div className="text-gray-400 text-[10px] mb-0.5">
                0x{mem.address.toString(16).padStart(2, '0').toUpperCase()}
              </div>
              <div className={`font-semibold text-sm ${
                mem.active ? 'text-green-300' : mem.used ? 'text-blue-200' : 'text-white'
              }`}>
                {mem.value.toString(16).padStart(2, '0').toUpperCase()}
              </div>
            </motion.div>
          )
        })}
      </div>
      {memory.length > maxVisible && (
        <div className="text-xs text-gray-500 mt-3 text-center pt-2 border-t border-gray-700">
          ... and {memory.length - maxVisible} more locations
        </div>
      )}
    </div>
  )
}

export default Memory

