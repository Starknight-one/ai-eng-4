import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Board from '../Board'
import { Task } from '../../types/Task'

describe('Board Column Filter', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      status: 'backlog',
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      status: 'todo',
    },
    {
      id: '3',
      title: 'Task 3',
      description: 'Description 3',
      status: 'in-progress',
    },
    {
      id: '4',
      title: 'Task 4',
      description: 'Description 4',
      status: 'test',
    },
    {
      id: '5',
      title: 'Task 5',
      description: 'Description 5',
      status: 'done',
    },
  ]

  const mockOnAddTask = vi.fn()
  const mockOnDeleteTask = vi.fn()

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should render all column filter toggles', () => {
    render(
      <Board
        tasks={mockTasks}
        onAddTask={mockOnAddTask}
        onDeleteTask={mockOnDeleteTask}
      />
    )

    expect(screen.getByLabelText(/hide backlog column/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/hide to do column/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/hide in progress column/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/hide test column/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/hide done column/i)).toBeInTheDocument()
  })

  it('should show all columns by default', () => {
    render(
      <Board
        tasks={mockTasks}
        onAddTask={mockOnAddTask}
        onDeleteTask={mockOnDeleteTask}
      />
    )

    expect(screen.getByText('Backlog')).toBeInTheDocument()
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('should hide a column when its toggle is clicked', () => {
    render(
      <Board
        tasks={mockTasks}
        onAddTask={mockOnAddTask}
        onDeleteTask={mockOnDeleteTask}
      />
    )

    const backlogToggle = screen.getByLabelText(/hide backlog column/i)
    fireEvent.click(backlogToggle)

    // Column header should not be visible
    const backlogColumns = screen.queryAllByText('Backlog')
    // Only the filter toggle should have "Backlog" text, not the column header
    expect(backlogColumns.length).toBe(1)
  })

  it('should show a column when its toggle is clicked again', () => {
    render(
      <Board
        tasks={mockTasks}
        onAddTask={mockOnAddTask}
        onDeleteTask={mockOnDeleteTask}
      />
    )

    const backlogToggle = screen.getByLabelText(/hide backlog column/i)

    // Hide the column
    fireEvent.click(backlogToggle)
    let backlogColumns = screen.queryAllByText('Backlog')
    expect(backlogColumns.length).toBe(1) // Only in filter toggle

    // Show the column again
    fireEvent.click(backlogToggle)
    backlogColumns = screen.queryAllByText('Backlog')
    expect(backlogColumns.length).toBeGreaterThan(1) // In filter toggle and column header
  })

  it('should show hidden count when columns are hidden', () => {
    render(
      <Board
        tasks={mockTasks}
        onAddTask={mockOnAddTask}
        onDeleteTask={mockOnDeleteTask}
      />
    )

    const backlogToggle = screen.getByLabelText(/hide backlog column/i)
    const todoToggle = screen.getByLabelText(/hide to do column/i)

    // Initially no hidden count
    expect(screen.queryByText(/hidden/i)).not.toBeInTheDocument()

    // Hide one column
    fireEvent.click(backlogToggle)
    expect(screen.getByText('(1 hidden)')).toBeInTheDocument()

    // Hide another column
    fireEvent.click(todoToggle)
    expect(screen.getByText('(2 hidden)')).toBeInTheDocument()

    // Show one column back
    fireEvent.click(backlogToggle)
    expect(screen.getByText('(1 hidden)')).toBeInTheDocument()
  })

  it('should save visibility state to localStorage', () => {
    render(
      <Board
        tasks={mockTasks}
        onAddTask={mockOnAddTask}
        onDeleteTask={mockOnDeleteTask}
      />
    )

    const backlogToggle = screen.getByLabelText(/hide backlog column/i)
    fireEvent.click(backlogToggle)

    const stored = localStorage.getItem('taskTracker.visibleColumns')
    expect(stored).toBeTruthy()

    const visibleColumns = JSON.parse(stored!)
    expect(visibleColumns).not.toContain('backlog')
    expect(visibleColumns).toContain('todo')
    expect(visibleColumns).toContain('in-progress')
  })

  it('should load visibility state from localStorage on mount', () => {
    // Set initial localStorage state
    localStorage.setItem(
      'taskTracker.visibleColumns',
      JSON.stringify(['todo', 'in-progress', 'done'])
    )

    render(
      <Board
        tasks={mockTasks}
        onAddTask={mockOnAddTask}
        onDeleteTask={mockOnDeleteTask}
      />
    )

    // Backlog and Test should be hidden
    const backlogColumns = screen.queryAllByText('Backlog')
    expect(backlogColumns.length).toBe(1) // Only in filter toggle

    const testColumns = screen.queryAllByText('Test')
    expect(testColumns.length).toBe(1) // Only in filter toggle

    // Others should be visible
    const todoColumns = screen.queryAllByText('To Do')
    expect(todoColumns.length).toBeGreaterThan(1)
  })

  it('should prevent hiding all columns', () => {
    render(
      <Board
        tasks={mockTasks}
        onAddTask={mockOnAddTask}
        onDeleteTask={mockOnDeleteTask}
      />
    )

    // Hide all columns except one
    const backlogToggle = screen.getByLabelText(/hide backlog column/i)
    const todoToggle = screen.getByLabelText(/hide to do column/i)
    const inProgressToggle = screen.getByLabelText(/hide in progress column/i)
    const testToggle = screen.getByLabelText(/hide test column/i)

    fireEvent.click(backlogToggle)
    fireEvent.click(todoToggle)
    fireEvent.click(inProgressToggle)
    fireEvent.click(testToggle)

    // Try to hide the last column
    const doneToggle = screen.getByLabelText(/hide done column/i)
    fireEvent.click(doneToggle)

    // Done column should still be visible
    const doneColumns = screen.queryAllByText('Done')
    expect(doneColumns.length).toBeGreaterThan(1) // In filter toggle and column header
  })

  it('should have correct aria-pressed states', () => {
    render(
      <Board
        tasks={mockTasks}
        onAddTask={mockOnAddTask}
        onDeleteTask={mockOnDeleteTask}
      />
    )

    const backlogToggle = screen.getByLabelText(/hide backlog column/i)

    // Initially all columns are visible (pressed = true)
    expect(backlogToggle).toHaveAttribute('aria-pressed', 'true')

    // Click to hide
    fireEvent.click(backlogToggle)
    expect(backlogToggle).toHaveAttribute('aria-pressed', 'false')

    // Click to show again
    fireEvent.click(backlogToggle)
    expect(backlogToggle).toHaveAttribute('aria-pressed', 'true')
  })

  it('should apply active class to visible column toggles', () => {
    render(
      <Board
        tasks={mockTasks}
        onAddTask={mockOnAddTask}
        onDeleteTask={mockOnDeleteTask}
      />
    )

    const backlogToggle = screen.getByLabelText(/hide backlog column/i)

    // Initially active
    expect(backlogToggle).toHaveClass('active')

    // Click to hide
    fireEvent.click(backlogToggle)
    expect(backlogToggle).not.toHaveClass('active')

    // Click to show again
    fireEvent.click(backlogToggle)
    expect(backlogToggle).toHaveClass('active')
  })

  it('should work with search functionality', () => {
    render(
      <Board
        tasks={mockTasks}
        onAddTask={mockOnAddTask}
        onDeleteTask={mockOnDeleteTask}
      />
    )

    // Hide a column
    const backlogToggle = screen.getByLabelText(/hide backlog column/i)
    fireEvent.click(backlogToggle)

    // Search for a task
    const searchInput = screen.getByPlaceholderText(/search tasks/i)
    fireEvent.change(searchInput, { target: { value: 'Task 2' } })

    // Task 2 should be visible in To Do column
    expect(screen.getByText('Task 2')).toBeInTheDocument()

    // Task 1 should not be visible (in hidden Backlog column)
    const backlogColumns = screen.queryAllByText('Backlog')
    expect(backlogColumns.length).toBe(1) // Only in filter toggle
  })

  it('should handle corrupted localStorage gracefully', () => {
    // Set corrupted localStorage
    localStorage.setItem('taskTracker.visibleColumns', 'invalid-json')

    // Should not throw and should default to all columns visible
    expect(() => {
      render(
        <Board
          tasks={mockTasks}
          onAddTask={mockOnAddTask}
          onDeleteTask={mockOnDeleteTask}
        />
      )
    }).not.toThrow()

    // All columns should be visible
    expect(screen.getByText('Backlog')).toBeInTheDocument()
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })
})
