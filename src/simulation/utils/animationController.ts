/**
 * Animation Controller
 * Manages animation timing and coordination for simulation components
 */

export class AnimationController {
  private animations: Map<string, () => void> = new Map()
  private isPlaying: boolean = false
  private speed: number = 1000 // milliseconds per cycle
  private currentCycle: number = 0

  /**
   * Register an animation callback
   */
  register(id: string, callback: () => void) {
    this.animations.set(id, callback)
  }

  /**
   * Unregister an animation
   */
  unregister(id: string) {
    this.animations.delete(id)
  }

  /**
   * Play all animations
   */
  play() {
    this.isPlaying = true
    this.runCycle()
  }

  /**
   * Pause animations
   */
  pause() {
    this.isPlaying = false
  }

  /**
   * Reset animations
   */
  reset() {
    this.pause()
    this.currentCycle = 0
    this.animations.forEach((callback) => callback())
  }

  /**
   * Set animation speed
   */
  setSpeed(milliseconds: number) {
    this.speed = milliseconds
  }

  /**
   * Run a single animation cycle
   */
  private runCycle() {
    if (!this.isPlaying) return

    this.animations.forEach((callback) => callback())
    this.currentCycle++

    setTimeout(() => {
      if (this.isPlaying) {
        this.runCycle()
      }
    }, this.speed)
  }

  /**
   * Step through one cycle
   */
  step() {
    this.animations.forEach((callback) => callback())
    this.currentCycle++
  }

  getCurrentCycle(): number {
    return this.currentCycle
  }

  getIsPlaying(): boolean {
    return this.isPlaying
  }
}

