import { motion, AnimatePresence } from 'framer-motion'
import { GameTask } from '@/types/cpu'

interface TaskQueueProps {
  tasks: GameTask[]
  onTaskSelect?: (task: GameTask) => void
}

function TaskQueue({ tasks, onTaskSelect }: TaskQueueProps) {
  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Task Queue</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <AnimatePresence>
          {tasks.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-4">No tasks in queue</div>
          ) : (
            tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-3 rounded border cursor-pointer transition-colors ${
                  index === 0
                    ? 'bg-blue-600/20 border-blue-500'
                    : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                }`}
                onClick={() => onTaskSelect?.(task)}
              >
                {task.type === 'calculation' && task.operation ? (
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">
                      Calculate: {task.operation.operand1} {task.operation.operator}{' '}
                      {task.operation.operand2}
                    </div>
                    <div className="text-xs text-gray-400">
                      Time limit: {task.timeLimit} cycles | Points: {task.points}
                    </div>
                  </div>
                ) : task.type === 'traffic_control' && task.trafficScenario ? (
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">
                      Traffic Control: {task.trafficScenario.currentState} →{' '}
                      {task.trafficScenario.expectedAction}
                    </div>
                    <div className="text-xs text-gray-400">
                      Sensor: {task.trafficScenario.sensorInput ? 'Car detected' : 'No car'} | Time
                      limit: {task.timeLimit} cycles
                    </div>
                  </div>
                ) : null}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default TaskQueue

