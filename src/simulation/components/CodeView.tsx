import { motion } from 'framer-motion'
import { Instruction } from '@/types/cpu'
import { encodeInstruction } from '../utils/instructionSet'

interface CodeViewProps {
  instructions: Instruction[]
  currentInstructionIndex: number
  mode: 'assembly' | 'machine'
  onModeChange: (mode: 'assembly' | 'machine') => void
}

function CodeView({ instructions, currentInstructionIndex, mode, onModeChange }: CodeViewProps) {
  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700" data-component-id="code-view">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Code View</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onModeChange('assembly')}
            className={`px-3 py-1 rounded text-sm ${
              mode === 'assembly' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Assembly
          </button>
          <button
            onClick={() => onModeChange('machine')}
            className={`px-3 py-1 rounded text-sm ${
              mode === 'machine' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Machine
          </button>
        </div>
      </div>
      <div className="space-y-1 max-h-96 overflow-y-auto overflow-x-hidden font-mono text-sm">
        {instructions.map((instruction, index) => {
          const isCurrent = index === currentInstructionIndex
          return (
            <motion.div
              key={instruction.id}
              className={`p-2 rounded break-words ${
                isCurrent ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
              }`}
              animate={{
                scale: isCurrent ? 1.02 : 1,
              }}
            >
              {mode === 'assembly' ? (
                <div className="break-words">
                  <span className="font-semibold">{instruction.opcode}</span>
                  {instruction.operand1 !== undefined && (
                    <span> {String(instruction.operand1)}</span>
                  )}
                  {instruction.operand2 !== undefined && (
                    <span>, {String(instruction.operand2)}</span>
                  )}
                  {instruction.destination && <span> → {instruction.destination}</span>}
                  {instruction.address !== undefined && (
                    <span> [0x{instruction.address.toString(16).toUpperCase()}]</span>
                  )}
                  <div className="text-xs opacity-75 mt-1 break-words">{instruction.description}</div>
                </div>
              ) : (
                <div className="text-yellow-300 break-all">{encodeInstruction(instruction)}</div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default CodeView

