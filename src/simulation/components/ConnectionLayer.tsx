/**
 * ConnectionLayer Component
 * SVG overlay that renders connection paths between components with animated data flow
 */

import { useEffect, useState, useRef } from 'react'
import { BusTransfer, BusType } from '@/types/cpu'
import { ComponentPosition, calculateConnectionPath, ConnectionPath } from '../utils/connectionPaths'
import DataFlow from './DataFlow'

interface ConnectionLayerProps {
  busTransfers: BusTransfer[]
  speed: number
  containerRef: React.RefObject<HTMLDivElement>
}

// Component ID mapping for bus transfer from/to strings
const componentIdMap: Record<string, string> = {
  'PC': 'register-PC',
  'IR': 'register-IR',
  'R1': 'register-R1',
  'R2': 'register-R2',
  'R3': 'register-R3',
  'Memory': 'memory',
  'CPU': 'cpu',
  'ALU': 'alu',
  'ControlUnit': 'control-unit',
  'IODevice': 'io-device',
  'Bus': 'bus',
  'Clock': 'clock',
}

function ConnectionLayer({ busTransfers, speed, containerRef }: ConnectionLayerProps) {
  const [componentPositions, setComponentPositions] = useState<Map<string, ComponentPosition>>(new Map())
  const [connections, setConnections] = useState<Map<string, ConnectionPath>>(new Map())
  const [connectionOffsets, setConnectionOffsets] = useState<Map<string, number>>(new Map())
  const updateIntervalRef = useRef<number | null>(null)

  // Update component positions periodically
  useEffect(() => {
    const updatePositions = () => {
      if (!containerRef.current) return

      const newPositions = new Map<string, ComponentPosition>()
      const containerRect = containerRef.current.getBoundingClientRect()

      // Find all components with data-component-id attribute
      const components = containerRef.current.querySelectorAll('[data-component-id]')
      
      components.forEach((element) => {
        const componentId = element.getAttribute('data-component-id')
        if (!componentId) return

        const rect = element.getBoundingClientRect()
        newPositions.set(componentId, {
          id: componentId,
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height,
        })
      })

      setComponentPositions(newPositions)
    }

    // Initial update
    updatePositions()

    // Update on window resize
    const handleResize = () => updatePositions()
    window.addEventListener('resize', handleResize)

    // Update periodically to catch layout changes
    updateIntervalRef.current = window.setInterval(updatePositions, 100)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [containerRef])

  // Calculate connection paths for active transfers (supports multiple simultaneous flows)
  useEffect(() => {
    const newConnections = new Map<string, ConnectionPath>()
    const newOffsets = new Map<string, number>()
    const activeTransfers = busTransfers.filter((t) => t.active)

    // Group transfers by connection pair to handle bidirectional/mesh connections
    const connectionGroups = new Map<string, BusTransfer[]>()
    
    activeTransfers.forEach((transfer) => {
      // Create a key for the connection pair (bidirectional)
      const key1 = `${transfer.from}-${transfer.to}`
      const key2 = `${transfer.to}-${transfer.from}`
      const key = key1 < key2 ? key1 : key2
      
      if (!connectionGroups.has(key)) {
        connectionGroups.set(key, [])
      }
      connectionGroups.get(key)!.push(transfer)
    })

    // Calculate paths for each transfer, offsetting for multiple flows on same path
    // Group by connection pair to calculate proper offsets
    const pathGroups = new Map<string, BusTransfer[]>()
    
    activeTransfers.forEach((transfer) => {
      const fromId = componentIdMap[transfer.from] || `register-${transfer.from}` || transfer.from.toLowerCase()
      const toId = componentIdMap[transfer.to] || `register-${transfer.to}` || transfer.to.toLowerCase()
      const pathKey = `${fromId}-${toId}`
      
      if (!pathGroups.has(pathKey)) {
        pathGroups.set(pathKey, [])
      }
      pathGroups.get(pathKey)!.push(transfer)
    })
    
    // Calculate paths with proper offsets for parallel flows
    activeTransfers.forEach((transfer) => {
      // Map component names to component IDs
      const fromId = componentIdMap[transfer.from] || `register-${transfer.from}` || transfer.from.toLowerCase()
      const toId = componentIdMap[transfer.to] || `register-${transfer.to}` || transfer.to.toLowerCase()
      const pathKey = `${fromId}-${toId}`

      const fromPos = componentPositions.get(fromId)
      const toPos = componentPositions.get(toId)

      // Only create connection if both components are found
      if (fromPos && toPos) {
        // Calculate offset based on position in group
        const group = pathGroups.get(pathKey) || []
        const groupIndex = group.findIndex(t => t.id === transfer.id)
        const offset = group.length > 1 ? (groupIndex - (group.length - 1) / 2) : 0
        
        const path = calculateConnectionPath(fromPos, toPos, offset)
        newConnections.set(transfer.id, path)
        newOffsets.set(transfer.id, offset)
      }
    })

    setConnections(newConnections)
    setConnectionOffsets(newOffsets)
  }, [busTransfers, componentPositions])

  const getBusColor = (type: BusType) => {
    switch (type) {
      case BusType.DATA:
        return 'stroke-blue-400'
      case BusType.ADDRESS:
        return 'stroke-green-400'
      case BusType.CONTROL:
        return 'stroke-yellow-400'
      default:
        return 'stroke-gray-400'
    }
  }

  const getBusStrokeWidth = (type: BusType) => {
    switch (type) {
      case BusType.DATA:
        return 2
      case BusType.ADDRESS:
        return 2
      case BusType.CONTROL:
        return 2
      default:
        return 1
    }
  }

  if (!containerRef.current) return null

  const containerRect = containerRef.current.getBoundingClientRect()
  const activeTransfers = busTransfers.filter((t) => t.active)

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      width={containerRect.width}
      height={containerRect.height}
      style={{ zIndex: 10 }}
    >
      <defs>
        {/* Arrow markers for connection endpoints */}
        <marker
          id="arrowhead-blue"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#60a5fa" />
        </marker>
        <marker
          id="arrowhead-green"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#4ade80" />
        </marker>
        <marker
          id="arrowhead-yellow"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#facc15" />
        </marker>
      </defs>

      {/* Render connection paths - supports multiple simultaneous flows */}
      {activeTransfers.map((transfer) => {
        const connection = connections.get(transfer.id)
        if (!connection) return null

        const markerId =
          transfer.type === BusType.DATA
            ? 'arrowhead-blue'
            : transfer.type === BusType.ADDRESS
            ? 'arrowhead-green'
            : 'arrowhead-yellow'

        // Get offset for this transfer (used for animation timing)
        const offset = connectionOffsets.get(transfer.id) || 0

        return (
          <g key={transfer.id}>
            {/* Connection path with improved visibility */}
            <path
              d={connection.path}
              className={getBusColor(transfer.type)}
              strokeWidth={getBusStrokeWidth(transfer.type) + 0.5}
              fill="none"
              opacity={transfer.active ? 0.7 : 0.3}
              markerEnd={`url(#${markerId})`}
              style={{
                filter: transfer.active ? 'drop-shadow(0 0 3px currentColor)' : 'none',
                transition: 'opacity 0.2s ease',
              }}
            />
            {/* Subtle glow effect for active connections */}
            {transfer.active && (
              <path
                d={connection.path}
                className={getBusColor(transfer.type)}
                strokeWidth={getBusStrokeWidth(transfer.type) + 2}
                fill="none"
                opacity={0.15}
                style={{
                  filter: 'blur(2px)',
                }}
              />
            )}
            <DataFlow
              path={connection}
              busType={transfer.type}
              isActive={transfer.active}
              value={transfer.value}
              speed={speed}
              transferId={transfer.id}
              offset={offset}
            />
          </g>
        )
      })}
    </svg>
  )
}

export default ConnectionLayer

