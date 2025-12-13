import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '../types/Task'
import './TaskCard.css'

interface TaskCardProps {
  task: Task
  onDelete: (taskId: string) => void
  onShowDetails: (task: Task) => void
}

export default function TaskCard({ task, onDelete, onShowDetails }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleShowDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onShowDetails(task)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete(task.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? 'dragging' : ''}`}
    >
      <div
        className="task-card-draggable"
        {...attributes}
        {...listeners}
      >
        <div className="task-card-header">
          <h3>{task.title}</h3>
          <button
            className="btn-delete"
            onClick={handleDelete}
            onPointerDown={(e) => e.stopPropagation()}
            title="Delete task"
          >
            ×
          </button>
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
      </div>

      <button
        className="btn-details"
        onClick={handleShowDetails}
        onPointerDown={(e) => e.stopPropagation()}
      >
        Show Details
      </button>
    </div>
  )
}
