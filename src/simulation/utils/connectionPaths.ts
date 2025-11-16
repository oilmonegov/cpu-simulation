/**
 * Connection Path Utilities
 * Calculate SVG paths between component positions for visual interconnections
 */

export interface ComponentPosition {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface ConnectionPoint {
  x: number
  y: number
}

export interface ConnectionPath {
  path: string
  startPoint: ConnectionPoint
  endPoint: ConnectionPoint
}

/**
 * Get connection point on component edge
 */
export function getConnectionPoint(
  from: ComponentPosition,
  to: ComponentPosition,
  side: 'left' | 'right' | 'top' | 'bottom' = 'right'
): ConnectionPoint {
  switch (side) {
    case 'left':
      return { x: from.x, y: from.y + from.height / 2 }
    case 'right':
      return { x: from.x + from.width, y: from.y + from.height / 2 }
    case 'top':
      return { x: from.x + from.width / 2, y: from.y }
    case 'bottom':
      return { x: from.x + from.width / 2, y: from.y + from.height }
    default:
      return { x: from.x + from.width / 2, y: from.y + from.height / 2 }
  }
}

/**
 * Determine which side of a component to connect from/to
 */
function getConnectionSide(
  from: ComponentPosition,
  to: ComponentPosition
): { fromSide: 'left' | 'right' | 'top' | 'bottom'; toSide: 'left' | 'right' | 'top' | 'bottom' } {
  const fromCenterX = from.x + from.width / 2
  const fromCenterY = from.y + from.height / 2
  const toCenterX = to.x + to.width / 2
  const toCenterY = to.y + to.height / 2

  const dx = toCenterX - fromCenterX
  const dy = toCenterY - fromCenterY

  // Determine from side
  let fromSide: 'left' | 'right' | 'top' | 'bottom'
  if (Math.abs(dx) > Math.abs(dy)) {
    fromSide = dx > 0 ? 'right' : 'left'
  } else {
    fromSide = dy > 0 ? 'bottom' : 'top'
  }

  // Determine to side (opposite)
  let toSide: 'left' | 'right' | 'top' | 'bottom'
  if (Math.abs(dx) > Math.abs(dy)) {
    toSide = dx > 0 ? 'left' : 'right'
  } else {
    toSide = dy > 0 ? 'top' : 'bottom'
  }

  return { fromSide, toSide }
}

/**
 * Calculate SVG path between two components with curved lines
 * Improved routing with better control points and offset handling
 */
export function calculateConnectionPath(
  from: ComponentPosition,
  to: ComponentPosition,
  offset: number = 0
): ConnectionPath {
  const { fromSide, toSide } = getConnectionSide(from, to)
  const startPoint = getConnectionPoint(from, to, fromSide)
  const endPoint = getConnectionPoint(to, from, toSide)

  // Calculate control points for smooth curves
  const dx = endPoint.x - startPoint.x
  const dy = endPoint.y - startPoint.y
  
  // Calculate distance for better curve control
  const distance = Math.sqrt(dx * dx + dy * dy)
  const curveOffset = Math.min(distance * 0.3, 100) // Limit curve offset for better appearance

  // Determine curve direction based on connection sides
  let controlPoint1X: number
  let controlPoint1Y: number
  let controlPoint2X: number
  let controlPoint2Y: number

  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connection
    controlPoint1X = startPoint.x + dx * 0.5
    controlPoint1Y = startPoint.y + (offset * 8) // Vertical offset for parallel flows
    controlPoint2X = endPoint.x - dx * 0.5
    controlPoint2Y = endPoint.y + (offset * 8)
  } else {
    // Vertical connection
    controlPoint1X = startPoint.x + (offset * 8) // Horizontal offset for parallel flows
    controlPoint1Y = startPoint.y + dy * 0.5
    controlPoint2X = endPoint.x + (offset * 8)
    controlPoint2Y = endPoint.y - dy * 0.5
  }

  // Apply curve offset for smoother appearance
  if (fromSide === 'right' || fromSide === 'left') {
    controlPoint1X += Math.sign(dx) * curveOffset * 0.3
    controlPoint2X -= Math.sign(dx) * curveOffset * 0.3
  } else {
    controlPoint1Y += Math.sign(dy) * curveOffset * 0.3
    controlPoint2Y -= Math.sign(dy) * curveOffset * 0.3
  }

  // Create smooth cubic bezier path
  const path = `M ${startPoint.x} ${startPoint.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endPoint.x} ${endPoint.y}`

  return {
    path,
    startPoint,
    endPoint,
  }
}

/**
 * Calculate reverse path for bidirectional connections
 */
export function calculateReversePath(originalPath: ConnectionPath): ConnectionPath {
  // Parse the original path to reverse it
  const pathMatch = originalPath.path.match(/M\s+(\d+)\s+(\d+).*C\s+(\d+)\s+(\d+),\s+(\d+)\s+(\d+),\s+(\d+)\s+(\d+)/)
  
  if (pathMatch) {
    const [, x1, y1, cx1, cy1, cx2, cy2, x2, y2] = pathMatch.map(Number)
    
    // Reverse the path: swap start/end and control points
    const reversePath = `M ${x2} ${y2} C ${cx2} ${cy2}, ${cx1} ${cy1}, ${x1} ${y1}`
    
    return {
      path: reversePath,
      startPoint: originalPath.endPoint,
      endPoint: originalPath.startPoint,
    }
  }
  
  // Fallback: return original if parsing fails
  return originalPath
}

/**
 * Calculate path length for animation timing
 */
export function getPathLength(path: string): number {
  // Approximate path length by calculating distance between key points
  const pathMatch = path.match(/M\s+(\d+)\s+(\d+).*C\s+(\d+)\s+(\d+),\s+(\d+)\s+(\d+),\s+(\d+)\s+(\d+)/)
  if (pathMatch) {
    const [, x1, y1, cx1, cy1, cx2, cy2, x2, y2] = pathMatch.map(Number)
    
    // Approximate bezier curve length using chord length
    const dist1 = Math.sqrt((cx1 - x1) ** 2 + (cy1 - y1) ** 2)
    const dist2 = Math.sqrt((cx2 - cx1) ** 2 + (cy2 - cy1) ** 2)
    const dist3 = Math.sqrt((x2 - cx2) ** 2 + (y2 - cy2) ** 2)
    
    return dist1 + dist2 + dist3
  }
  
  // Fallback: simple distance calculation
  const coords = path.match(/\d+/g)?.map(Number) || []
  if (coords.length >= 4) {
    return Math.sqrt((coords[coords.length - 2] - coords[0]) ** 2 + (coords[coords.length - 1] - coords[1]) ** 2)
  }
  
  return 100 // Default fallback
}

