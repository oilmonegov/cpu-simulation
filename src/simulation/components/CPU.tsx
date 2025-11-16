import { Register } from '@/types/cpu'
import RegisterComponent from './Register'
import ALU from './ALU'
import ControlUnit from './ControlUnit'
import { Instruction, InstructionPhase } from '@/types/cpu'

interface CPUProps {
  registers: Register[]
  currentInstruction: Instruction | null
  currentPhase: InstructionPhase
}

function CPU({ registers, currentInstruction, currentPhase }: CPUProps) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg border-2 border-gray-700 overflow-hidden" data-component-id="cpu">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">CPU</h2>
      
      <div className="mb-6">
        <ControlUnit currentPhase={currentPhase} />
      </div>

      <div className="mb-6">
        <ALU currentInstruction={currentInstruction} currentPhase={currentPhase} />
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-3">Registers</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {registers.map((register) => (
            <RegisterComponent key={register.name} register={register} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default CPU

