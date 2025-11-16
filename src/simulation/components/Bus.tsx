import { motion } from 'framer-motion'
import { BusTransfer, BusType } from '@/types/cpu'

interface BusProps {
  transfers: BusTransfer[]
}

function Bus({ transfers }: BusProps) {
  const activeTransfers = transfers.filter((t) => t.active)

  const getBusColor = (type: BusType) => {
    switch (type) {
      case BusType.DATA:
        return 'text-blue-400'
      case BusType.ADDRESS:
        return 'text-green-400'
      case BusType.CONTROL:
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const getBusBgColor = (type: BusType) => {
    switch (type) {
      case BusType.DATA:
        return 'bg-blue-500/20 border-blue-500'
      case BusType.ADDRESS:
        return 'bg-green-500/20 border-green-500'
      case BusType.CONTROL:
        return 'bg-yellow-500/20 border-yellow-500'
      default:
        return 'bg-gray-500/20 border-gray-500'
    }
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700" data-component-id="bus">
      <h3 className="text-lg font-semibold text-white mb-4">Bus Activity</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {activeTransfers.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-4">No active transfers</div>
        ) : (
          activeTransfers.map((transfer) => (
            <motion.div
              key={transfer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`p-3 rounded border ${getBusBgColor(transfer.type)}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-sm font-semibold ${getBusColor(transfer.type)}`}>
                    {transfer.type} Bus
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    {transfer.from} → {transfer.to}
                  </div>
                </div>
                <div className="text-lg font-mono text-white">
                  0x{transfer.value.toString(16).toUpperCase()}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default Bus

