/**
 * DataFlow Component
 * Animated particles/packets that move along connection paths
 * Supports multiple simultaneous flows with proper timing
 * Enhanced with motion trails, pulsing effects, and smooth easing
 */

import { BusType } from '@/types/cpu'
import { ConnectionPath } from '../utils/connectionPaths'

interface DataFlowProps {
  path: ConnectionPath
  busType: BusType
  isActive: boolean
  value: number
  speed: number // milliseconds per cycle
  transferId?: string
  offset?: number // Offset for parallel flows on same path
}

function DataFlow({ path, busType, isActive, value, speed, transferId, offset = 0 }: DataFlowProps) {
  // Calculate animation duration based on speed (supports up to 60 seconds)
  // Use a minimum of 0.5s for very fast speeds to ensure smooth animation, and scale proportionally
  // Make animation duration match the actual speed more closely for better synchronization
  const animationDuration = Math.max(0.5, Math.min(60, speed / 1000))
  const uniqueId = transferId || `flow-${busType}-${value}-${Math.random().toString(36).substr(2, 9)}`
  
  // Add slight delay for parallel flows to create staggered effect
  const delay = Math.abs(offset) * 0.1

  const getBusColor = (type: BusType) => {
    switch (type) {
      case BusType.DATA:
        return '#60a5fa'
      case BusType.ADDRESS:
        return '#4ade80'
      case BusType.CONTROL:
        return '#facc15'
      default:
        return '#9ca3af'
    }
  }

  const getBusGlowColor = (type: BusType) => {
    switch (type) {
      case BusType.DATA:
        return '#93c5fd'
      case BusType.ADDRESS:
        return '#86efac'
      case BusType.CONTROL:
        return '#fde047'
      default:
        return '#d1d5db'
    }
  }

  if (!isActive) return null

  const color = getBusColor(busType)
  const glowColor = getBusGlowColor(busType)
  const particleSize = 8 + Math.abs(offset) * 1.5
  const glowSize = particleSize * 2.2
  
  // Create trail particles for motion blur effect
  // Trail particles start earlier in the cycle to appear behind the main particle
  const trailCount = 4
  const trailSpacing = animationDuration / (trailCount + 3) // Spacing between trail particles
  const trailParticles = Array.from({ length: trailCount }, (_, i) => {
    // Start trail particles earlier in the cycle (negative offset wrapped by duration)
    const trailOffset = -(i + 1) * trailSpacing
    const trailBegin = trailOffset < 0 ? `${animationDuration + trailOffset}` : `${trailOffset}`
    const trailOpacity = Math.max(0.1, 0.3 - (i * 0.05))
    const trailSize = particleSize * (0.8 - i * 0.1)
    return { begin: trailBegin, opacity: trailOpacity, size: trailSize }
  })

  return (
    <g opacity={isActive ? 1 : 0}>
      {/* Path reference for animateMotion */}
      <path
        id={`path-${uniqueId}`}
        d={path.path}
        fill="none"
        stroke="none"
        style={{ visibility: 'hidden' }}
      />
      
      {/* Motion trail particles for smooth blur effect */}
      {trailParticles.map((trail, index) => {
        const finalBegin = delay > 0 ? `${delay + parseFloat(trail.begin)}s` : `${trail.begin}s`
        return (
          <circle
            key={`trail-${index}`}
            r={trail.size}
            fill={color}
            opacity={trail.opacity}
          >
            <animateMotion
              dur={`${animationDuration}s`}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
              keyTimes="0; 1"
              begin={finalBegin}
            >
              <mpath href={`#path-${uniqueId}`} />
            </animateMotion>
            <animate
              attributeName="opacity"
              values={`0;${trail.opacity * 0.7};${trail.opacity};${trail.opacity};${trail.opacity * 0.7};0`}
              keyTimes="0;0.1;0.2;0.8;0.9;1"
              dur={`${animationDuration}s`}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
              begin={finalBegin}
            />
          </circle>
        )
      })}
      
      {/* Enhanced glow effect with pulsing animation */}
      <circle r={glowSize} fill={glowColor} opacity={0.4}>
        <animateMotion
          dur={`${animationDuration}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
          keyTimes="0; 1"
          begin={delay > 0 ? `${delay}s` : undefined}
        >
          <mpath href={`#path-${uniqueId}`} />
        </animateMotion>
        <animate
          attributeName="opacity"
          values="0;0.6;0.6;0"
          keyTimes="0;0.15;0.85;1"
          dur={`${animationDuration}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
          begin={delay > 0 ? `${delay}s` : undefined}
        />
        <animate
          attributeName="r"
          values={`${glowSize * 0.95};${glowSize * 1.05};${glowSize * 0.95}`}
          dur={`${Math.min(animationDuration * 0.3, 0.6)}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
        />
      </circle>
      
      {/* Secondary glow layer for depth */}
      <circle r={glowSize * 1.5} fill={glowColor} opacity={0.2}>
        <animateMotion
          dur={`${animationDuration}s`}
          repeatCount="indefinite"
          calcMode="linear"
          begin={delay > 0 ? `${delay}s` : undefined}
        >
          <mpath href={`#path-${uniqueId}`} />
        </animateMotion>
        <animate
          attributeName="opacity"
          values="0;0.25;0.25;0"
          dur={`${animationDuration}s`}
          repeatCount="indefinite"
          begin={delay > 0 ? `${delay}s` : undefined}
        />
      </circle>
      
      {/* Main animated particle with pulsing effect */}
      <circle r={particleSize} fill={color} opacity={1}>
        <animateMotion
          dur={`${animationDuration}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
          keyTimes="0; 1"
          begin={delay > 0 ? `${delay}s` : undefined}
        >
          <mpath href={`#path-${uniqueId}`} />
        </animateMotion>
        <animate
          attributeName="opacity"
          values="0;0.9;1;1;0.9;0"
          keyTimes="0;0.1;0.2;0.8;0.9;1"
          dur={`${animationDuration}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
          begin={delay > 0 ? `${delay}s` : undefined}
        />
        <animate
          attributeName="r"
          values={`${particleSize * 0.96};${particleSize * 1.04};${particleSize * 0.96}`}
          dur={`${Math.min(animationDuration * 0.25, 0.5)}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
        />
      </circle>
      
      {/* Inner highlight with enhanced glow */}
      <circle r={particleSize * 0.6} fill="white" opacity={0.7}>
        <animateMotion
          dur={`${animationDuration}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
          keyTimes="0; 1"
          begin={delay > 0 ? `${delay}s` : undefined}
        >
          <mpath href={`#path-${uniqueId}`} />
        </animateMotion>
        <animate
          attributeName="opacity"
          values="0;0.6;0.7;0.7;0.6;0"
          keyTimes="0;0.1;0.2;0.8;0.9;1"
          dur={`${animationDuration}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
          begin={delay > 0 ? `${delay}s` : undefined}
        />
        <animate
          attributeName="r"
          values={`${particleSize * 0.58};${particleSize * 0.62};${particleSize * 0.58}`}
          dur={`${Math.min(animationDuration * 0.25, 0.5)}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
        />
      </circle>
      
      {/* Core highlight for extra shine */}
      <circle r={particleSize * 0.3} fill="white" opacity={0.9}>
        <animateMotion
          dur={`${animationDuration}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
          keyTimes="0; 1"
          begin={delay > 0 ? `${delay}s` : undefined}
        >
          <mpath href={`#path-${uniqueId}`} />
        </animateMotion>
        <animate
          attributeName="opacity"
          values="0;0.8;0.9;0.9;0.8;0"
          keyTimes="0;0.1;0.2;0.8;0.9;1"
          dur={`${animationDuration}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
          begin={delay > 0 ? `${delay}s` : undefined}
        />
      </circle>
      
      {/* Value label for slower animations (when speed > 2 seconds) */}
      {animationDuration > 2 && (
        <text
          fontSize="11"
          fill={color}
          fontWeight="bold"
          opacity={0.95}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }}
        >
          <animateMotion
            dur={`${animationDuration}s`}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
            keyTimes="0; 1"
            begin={delay > 0 ? `${delay}s` : undefined}
          >
            <mpath href={`#path-${uniqueId}`} />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0;0.85;0.95;0.95;0.85;0"
            keyTimes="0;0.1;0.2;0.8;0.9;1"
            dur={`${animationDuration}s`}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
            begin={delay > 0 ? `${delay}s` : undefined}
          />
          <textPath href={`#path-${uniqueId}`} startOffset="50%">
            {value.toString(16).toUpperCase()}
          </textPath>
        </text>
      )}
    </g>
  )
}

export default DataFlow
