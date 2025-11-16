import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const featureCards = [
  {
    title: 'Visual Simulation',
    description: 'Trace the fetch → decode → execute → store loop with animated hardware, buses, and registers.',
    accent: 'from-cyan-500/30 via-blue-500/10 to-transparent',
  },
  {
    title: 'Gamified Learning',
    description: 'Play as the CPU, juggle tasks, and optimize performance in calculator and traffic scenarios.',
    accent: 'from-emerald-500/30 via-teal-500/10 to-transparent',
  },
  {
    title: 'Layered Story',
    description: 'See how software, drivers, and I/O travel through the OS before hitting the CPU core.',
    accent: 'from-purple-500/30 via-fuchsia-500/10 to-transparent',
  },
]

const modeCards = [
  {
    label: 'Simulation Lab',
    heading: 'Real-time CPU Walkthrough',
    detail: 'Step through each clock cycle with code, registers, and buses synced together.',
    route: '/simulation',
    accent: 'from-sky-500/60 to-blue-600/40',
  },
  {
    label: 'Gamification Arena',
    heading: 'Play as the Processor',
    detail: 'Manage energy, score multipliers, and interrupts while solving real tasks.',
    route: '/gamification',
    accent: 'from-emerald-500/60 to-lime-500/40',
  },
]

function WelcomePage() {
  const navigate = useNavigate()

  const binaryStreams = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 2,
        bits: Math.random().toString(2).substring(2, 10),
      })),
    [],
  )

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="ambient-grid" />
        <div className="floating-orb" style={{ top: '-8%', left: '-5%', background: 'rgba(56,189,248,0.55)' }} />
        <div className="floating-orb" style={{ bottom: '-10%', right: '-15%', background: 'rgba(59,130,246,0.65)' }} />

        {binaryStreams.map((stream) => (
          <motion.div
            key={stream.id}
            className="absolute text-emerald-400 text-xs font-mono opacity-30"
            style={{ left: stream.left }}
            initial={{ y: '120%', opacity: 0 }}
            animate={{ y: '-20%', opacity: [0, 1, 0.4, 0] }}
            transition={{ duration: stream.duration, repeat: Infinity, delay: stream.delay, ease: 'easeOut' }}
          >
            {stream.bits}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 shadow-glow" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Interactive Lab</p>
              <p className="text-xl font-semibold">CPU Simulator & Gamification</p>
            </div>
          </div>
          <div className="flex gap-3 text-sm text-slate-300">
            <span className="panel-chip">react + typescript</span>
            <span className="panel-chip">tailwind + framer motion</span>
          </div>
        </header>

        <section className="mt-14 grid gap-12 lg:grid-cols-[1.05fr,0.95fr] items-center">
          <div>
            <motion.p
              className="text-sm uppercase tracking-[0.35em] text-cyan-300 mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Understanding how processors think
            </motion.p>
            <motion.h1
              className="text-5xl md:text-6xl font-bold leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Visualize the CPU pipeline, then <span className="text-sky-300">play as the CPU</span>.
            </motion.h1>
            <motion.p
              className="text-lg text-slate-300 mb-10 max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Follow every instruction from input devices through the OS layers into registers, the ALU, cache, and buses.
              Then switch gears into a game that challenges you to keep the system stable under pressure.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={() => navigate('/simulation')}
                className="relative px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-lg font-semibold shadow-glow overflow-hidden"
              >
                <span className="relative z-10">Launch Simulation</span>
                <span className="absolute inset-0 bg-white/10 mix-blend-overlay" />
              </button>
              <button
                onClick={() => navigate('/gamification')}
                className="px-8 py-4 rounded-2xl border border-white/20 text-lg font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Play the Game
              </button>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Instruction Cycle', value: 'Fetch → Store', detail: 'Animated pipeline view' },
                { label: 'I/O + Drivers', value: 'Layered Story', detail: 'See software to silicon' },
                { label: 'Playable Modes', value: '2 Modes', detail: 'Calculator & Traffic Control' },
              ].map((stat) => (
                <div key={stat.label} className="panel-surface px-4 py-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-semibold mt-2">{stat.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            className="panel-surface p-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/15 via-transparent to-indigo-500/15 pointer-events-none" />
            <div className="relative">
              <p className="panel-chip inline-flex items-center gap-2 text-cyan-200 mb-4">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                Live Clock Cycle
              </p>
              <h3 className="text-2xl font-semibold mb-6">CPU Storyboard</h3>
              <div className="space-y-5">
                {['Fetch', 'Decode', 'Execute', 'Store'].map((phase, index) => (
                  <motion.div
                    key={phase}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center font-semibold text-sky-200">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{phase}</p>
                      <p className="text-sm text-slate-400">
                        {phase === 'Fetch' && 'Grab instructions + operands and prep buses.'}
                        {phase === 'Decode' && 'Control unit breaks instructions into micro-ops.'}
                        {phase === 'Execute' && 'ALU + registers crunch the operation.'}
                        {phase === 'Store' && 'Write back results / update IO signals.'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="glass-divider" />
              <p className="text-sm text-slate-300">
                Built with <span className="text-white font-semibold">React · Tailwind · Framer Motion</span> so every
                transition feels like hardware humming.
              </p>
            </div>
          </motion.div>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {featureCards.map((card) => (
            <div key={card.title} className="relative panel-surface p-6">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-70 pointer-events-none rounded-[inherit]`} />
              <div className="relative">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-3">{card.title}</p>
                <p className="text-base text-slate-300">{card.description}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-2">
          {modeCards.map((mode) => (
            <motion.div
              key={mode.label}
              className="panel-surface p-8 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.accent} opacity-40 pointer-events-none rounded-[inherit]`} />
              <div className="relative flex flex-col gap-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{mode.label}</p>
                <h3 className="text-2xl font-semibold">{mode.heading}</h3>
                <p className="text-base text-slate-300 flex-1">{mode.detail}</p>
                <button
                  onClick={() => navigate(mode.route)}
                  className="self-start px-6 py-3 rounded-2xl bg-white/10 border border-white/30 hover:bg-white/20 transition-colors text-sm font-semibold tracking-wide uppercase"
                >
                  Enter {mode.label.split(' ')[0]}
                </button>
              </div>
            </motion.div>
          ))}
        </section>
      </div>
    </div>
  )
}

export default WelcomePage

