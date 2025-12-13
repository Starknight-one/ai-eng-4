import { useEffect } from 'react'
import { Task, TaskStatus } from '../types/Task'
import './TaskDetailModal.css'

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  'backlog': '#6b7280',
  'todo': '#3b82f6',
  'in-progress': '#f59e0b',
  'test': '#8b5cf6',
  'done': '#10b981',
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  'backlog': 'Backlog',
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'test': 'Test',
  'done': 'Done',
}

export default function TaskDetailModal({ task, isOpen, onClose }: TaskDetailModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !task) {
    return null
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Not set'
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-header-content">
            <span
              className="status-badge"
              style={{ backgroundColor: STATUS_COLORS[task.status] }}
            >
              {STATUS_LABELS[task.status]}
            </span>
            <h2>{task.title}</h2>
          </div>
          <button
            className="btn-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <label className="detail-label">Description</label>
            <p className="detail-content">
              {task.description || 'No description provided'}
            </p>
          </div>

          <div className="detail-section">
            <label className="detail-label">Assignee</label>
            <p className="detail-content">
              {task.assignee || 'Unassigned'}
            </p>
          </div>

          <div className="detail-section">
            <label className="detail-label">Deadline</label>
            <p className="detail-content">
              {formatDate(task.deadline)}
            </p>
          </div>

          <div className="detail-section">
            <label className="detail-label">Created</label>
            <p className="detail-content">
              {formatDate(task.createdAt)}
            </p>
          </div>

          {task.updatedAt && (
            <div className="detail-section">
              <label className="detail-label">Last Updated</label>
              <p className="detail-content">
                {formatDate(task.updatedAt)}
              </p>
            </div>
          )}

          {task.dod && task.dod.length > 0 && (
            <div className="detail-section">
              <label className="detail-label">Definition of Done</label>
              <ul className="dod-list">
                {task.dod.map((item) => (
                  <li key={item.id} className={`dod-item ${item.completed ? 'completed' : ''}`}>
                    <span className={`dod-checkbox ${item.completed ? 'checked' : ''}`}>
                      {item.completed ? '✓' : ''}
                    </span>
                    <span className="dod-text">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
