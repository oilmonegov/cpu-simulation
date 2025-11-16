import { motion } from 'framer-motion'
import { Register as RegisterType } from '@/types/cpu'
import Tooltip from './Tooltip'

interface RegisterProps {
  register: RegisterType
}

function Register({ register }: RegisterProps) {
  return (
    <Tooltip content={register.description}>
      <motion.div
        data-component-id={`register-${register.name}`}
        className={`p-2 rounded-lg border-2 transition-all ${
          register.active
            ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/50'
            : 'bg-gray-800 border-gray-600'
        }`}
        animate={{
          scale: register.active ? 1.05 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-xs font-semibold text-gray-300 mb-0.5">{register.name}</div>
        <div className="text-lg font-mono text-white">
          {register.value.toString(16).toUpperCase().padStart(8, '0')}
        </div>
        <div className="text-[10px] text-gray-400 mt-0.5">0x{register.value.toString(16).toUpperCase()}</div>
      </motion.div>
    </Tooltip>
  )
}

export default Register

