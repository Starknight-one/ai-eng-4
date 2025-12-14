import { useState, useEffect } from 'react'
import Column from './Column'
import TaskDetailModal from './TaskDetailModal'
import { Task, Column as ColumnType, TaskStatus } from '../types/Task'
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

const STORAGE_KEY = 'taskTracker.visibleColumns'

// Utility functions for localStorage operations
const getVisibleColumnsFromStorage = (): Set<TaskStatus> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return new Set(parsed)
    }
  } catch (error) {
    console.warn('Failed to load visible columns from localStorage:', error)
  }
  // Default: all columns visible
  return new Set<TaskStatus>(['backlog', 'todo', 'in-progress', 'test', 'done'])
}

const saveVisibleColumnsToStorage = (visibleColumns: Set<TaskStatus>): void => {
  try {
    const array = Array.from(visibleColumns)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(array))
  } catch (error) {
    console.warn('Failed to save visible columns to localStorage:', error)
  }
}

export default function Board({ tasks, onAddTask, onDeleteTask }: BoardProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleColumns, setVisibleColumns] = useState<Set<TaskStatus>>(() =>
    getVisibleColumnsFromStorage()
  )

  // Persist visible columns to localStorage whenever they change
  useEffect(() => {
    saveVisibleColumnsToStorage(visibleColumns)
  }, [visibleColumns])

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

  const handleToggleColumn = (columnId: TaskStatus) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(columnId)) {
        // Prevent hiding all columns - require at least one visible
        if (newSet.size > 1) {
          newSet.delete(columnId)
        }
      } else {
        newSet.add(columnId)
      }
      return newSet
    })
  }

  const visibleColumnsArray = COLUMNS.filter((col) => visibleColumns.has(col.id))
  const hiddenCount = COLUMNS.length - visibleColumns.size

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
        <div className="column-filters">
          <div className="column-filters-label">
            Columns {hiddenCount > 0 && <span className="hidden-count">({hiddenCount} hidden)</span>}
          </div>
          <div className="column-filter-toggles">
            {COLUMNS.map((column) => (
              <button
                key={column.id}
                className={`column-filter-toggle ${visibleColumns.has(column.id) ? 'active' : ''}`}
                onClick={() => handleToggleColumn(column.id)}
                style={{
                  '--column-color': column.color,
                } as React.CSSProperties}
                aria-label={`${visibleColumns.has(column.id) ? 'Hide' : 'Show'} ${column.title} column`}
                aria-pressed={visibleColumns.has(column.id)}
              >
                <span className="filter-indicator" style={{ backgroundColor: column.color }} />
                {column.title}
              </button>
            ))}
          </div>
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
        {visibleColumnsArray.map((column) => (
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
