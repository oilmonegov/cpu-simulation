import { motion } from 'framer-motion'
import { Instruction, InstructionPhase } from '@/types/cpu'
import Tooltip from './Tooltip'

interface ALUProps {
  currentInstruction: Instruction | null
  currentPhase: InstructionPhase
}

function ALU({ currentInstruction, currentPhase }: ALUProps) {
  const isActive = currentPhase === InstructionPhase.EXECUTE && currentInstruction !== null
  const isArithmetic =
    currentInstruction &&
    ['ADD', 'SUB', 'MUL', 'DIV'].includes(currentInstruction.opcode)

  return (
    <Tooltip content="Arithmetic Logic Unit (ALU) - Performs mathematical and logical operations">
      <motion.div
        data-component-id="alu"
        className={`p-6 rounded-lg border-2 ${
          isActive && isArithmetic
            ? 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/50'
            : 'bg-gray-800 border-gray-600'
        }`}
        animate={{
          scale: isActive && isArithmetic ? 1.05 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-lg font-semibold text-white mb-2">ALU</div>
        {isActive && isArithmetic && currentInstruction ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-300">Operation:</div>
            <div className="text-xl font-mono text-white">{currentInstruction.opcode}</div>
            {typeof currentInstruction.operand1 !== 'undefined' &&
              typeof currentInstruction.operand2 !== 'undefined' && (
                <div className="text-sm text-gray-300 mt-2">
                  {currentInstruction.operand1} {getOperator(currentInstruction.opcode)}{' '}
                  {currentInstruction.operand2}
                </div>
              )}
          </div>
        ) : (
          <div className="text-sm text-gray-500">Idle</div>
        )}
      </motion.div>
    </Tooltip>
  )
}

function getOperator(opcode: string): string {
  switch (opcode) {
    case 'ADD':
      return '+'
    case 'SUB':
      return '-'
    case 'MUL':
      return '×'
    case 'DIV':
      return '÷'
    default:
      return '?'
  }
}

export default ALU

