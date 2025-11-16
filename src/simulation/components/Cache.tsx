import { CacheState, CacheLevel } from '@/types/cpu'
import { motion } from 'framer-motion'

interface CacheProps {
  cache: CacheState[]
  isActive?: boolean
}

function Cache({ cache, isActive = false }: CacheProps) {
  const getCacheColor = (level: CacheLevel | string) => {
    const levelStr = typeof level === 'string' ? level : level
    switch (levelStr) {
      case CacheLevel.L1:
      case 'L1':
        return 'border-blue-400 bg-blue-950'
      case CacheLevel.L2:
      case 'L2':
        return 'border-green-400 bg-green-950'
      case CacheLevel.L3:
      case 'L3':
        return 'border-yellow-400 bg-yellow-950'
      default:
        return 'border-gray-400 bg-gray-950'
    }
  }

  const getCacheLabel = (level: CacheLevel | string) => {
    const levelStr = typeof level === 'string' ? level : level
    switch (levelStr) {
      case CacheLevel.L1:
      case 'L1':
        return 'L1 Cache (Fastest)'
      case CacheLevel.L2:
      case 'L2':
        return 'L2 Cache'
      case CacheLevel.L3:
      case 'L3':
        return 'L3 Cache (Largest)'
      default:
        return 'Cache'
    }
  }

  const getHitRate = (state: CacheState) => {
    const total = state.hits + state.misses
    return total > 0 ? ((state.hits / total) * 100).toFixed(1) : '0.0'
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700" data-component-id="cache">
      <h2 className="text-xl font-bold text-white mb-4 text-center">CPU Cache Hierarchy</h2>
      
      <div className="space-y-4">
        {cache.map((cacheState, index) => {
          const isActiveCache = isActive && cacheState.activeAddress !== undefined
          const hitRate = getHitRate(cacheState)
          
          return (
            <motion.div
              key={cacheState.level}
              className={`p-4 rounded-lg border-2 ${getCacheColor(cacheState.level)} ${
                isActiveCache ? 'ring-2 ring-white ring-opacity-50' : ''
              }`}
              animate={isActiveCache ? { scale: 1.02 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">
                  {getCacheLabel(cacheState.level)}
                </h3>
                <div className="text-sm text-gray-300">
                  {cacheState.size} lines
                </div>
              </div>

              {/* Cache Status Indicator */}
              {isActiveCache && (
                <motion.div
                  className={`mb-2 p-2 rounded text-sm font-semibold ${
                    cacheState.isHit
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  {cacheState.isHit ? '✓ Cache HIT' : '✗ Cache MISS'}
                  {cacheState.activeAddress !== undefined && (
                    <span className="ml-2 font-mono">
                      @0x{cacheState.activeAddress.toString(16).toUpperCase()}
                    </span>
                  )}
                </motion.div>
              )}

              {/* Cache Statistics */}
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-gray-400">Hits:</span>
                  <span className="text-green-400 font-mono ml-2">{cacheState.hits}</span>
                </div>
                <div>
                  <span className="text-gray-400">Misses:</span>
                  <span className="text-red-400 font-mono ml-2">{cacheState.misses}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400">Hit Rate:</span>
                  <span className="text-white font-mono ml-2">{hitRate}%</span>
                </div>
              </div>

              {/* Cache Lines Preview */}
              <div className="mt-3">
                <div className="text-xs text-gray-400 mb-1">Cache Lines (showing first 8):</div>
                <div className="grid grid-cols-4 gap-1">
                  {cacheState.lines.slice(0, 8).map((line, lineIndex) => {
                    const isActiveLine = isActiveCache && line.address === cacheState.activeAddress
                    return (
                      <motion.div
                        key={lineIndex}
                        className={`p-1 rounded text-xs font-mono text-center ${
                          isActiveLine
                            ? 'bg-white text-gray-900 font-bold'
                            : line.valid
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-800 text-gray-500'
                        }`}
                        animate={isActiveLine ? { scale: 1.1 } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                        title={`Address: 0x${line.address.toString(16)}, Value: ${line.value}, Valid: ${line.valid}, Dirty: ${line.dirty}`}
                      >
                        {line.valid ? (
                          <div>
                            <div className="text-[10px]">0x{line.address.toString(16)}</div>
                            <div className="font-bold">{line.value}</div>
                          </div>
                        ) : (
                          <div className="text-gray-500">—</div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
                {cacheState.lines.length > 8 && (
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    +{cacheState.lines.length - 8} more lines
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Cache Explanation Tooltip */}
      <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong className="text-white">Cache Memory:</strong> Fast memory that stores frequently accessed data. 
          L1 is fastest but smallest, L3 is largest but slower. Cache hits are fast, misses require fetching from main memory.
        </p>
      </div>
    </div>
  )
}

export default Cache

