import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'
import { Task, Column as ColumnType } from '../types/Task'
import './Column.css'

interface ColumnProps {
  column: ColumnType
  tasks: Task[]
  onDeleteTask: (taskId: string) => void
  onShowDetails: (task: Task) => void
}

export default function Column({
  column,
  tasks,
  onDeleteTask,
  onShowDetails,
}: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: 'Column' },
  })

  return (
    <div className="column" ref={setNodeRef}>
      <div className="column-header" style={{ borderTopColor: column.color }}>
        <h2>{column.title}</h2>
        <span className="task-count">{tasks.length}</span>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="column-content">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks yet</p>
              <p className="text-small">Drag tasks here or create a new one</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={onDeleteTask}
                onShowDetails={onShowDetails}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}
