import { useState } from 'react'
import Column from './Column'
import TaskDetailModal from './TaskDetailModal'
import { Task, Column as ColumnType } from '../types/Task'
import './Board.css'

interface BoardProps {
  tasks: Task[]
  onAddTask: (title: string, description: string) => void
  onDeleteTask: (taskId: string) => void
}

const COLUMNS: ColumnType[] = [
  { id: 'backlog', title: 'Backlog', color: '#6b7280' },
  { id: 'todo', title: 'To Do', color: '#3b82f6' },
  { id: 'in-progress', title: 'In Progress', color: '#f59e0b' },
  { id: 'test', title: 'Test', color: '#8b5cf6' },
  { id: 'done', title: 'Done', color: '#10b981' },
]

export default function Board({ tasks, onAddTask, onDeleteTask }: BoardProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleAddTask = () => {
    if (title.trim()) {
      onAddTask(title, description)
      setTitle('')
      setDescription('')
      setShowAddForm(false)
    }
  }

  const getTasksByStatus = (status: string) =>
    tasks.filter((task) => {
      const matchesStatus = task.status === status
      const matchesSearch = searchQuery.trim() === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSearch
    })

  const handleShowDetails = (task: Task) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTask(null)
  }

  return (
    <div className="board">
      <div className="board-actions">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        {!showAddForm ? (
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            + Add Task
          </button>
        ) : (
          <form className="add-task-form" onSubmit={(e) => {
            e.preventDefault()
            handleAddTask()
          }}>
            <input
              type="text"
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            <textarea
              placeholder="Description (optional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                Add
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddForm(false)
                  setTitle('')
                  setDescription('')
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="columns-container">
        {COLUMNS.map((column) => (
          <Column
            key={column.id}
            column={column}
            tasks={getTasksByStatus(column.id)}
            onDeleteTask={onDeleteTask}
            onShowDetails={handleShowDetails}
          />
        ))}
      </div>

      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
