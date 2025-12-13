import { useState, useCallback, useEffect } from 'react'
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import Board from './components/Board'
import { Task, TaskStatus } from './types/Task'
import './App.css'

const API_URL = 'http://localhost:3001/api/tasks'

// Конвертация бэкенд-формата в фронтенд-формат
interface BackendTask {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  updatedAt: string
  priority?: string
  assignee?: string
  dod?: { id: string; text: string; completed: boolean }[]
}

const backendToFrontend = (task: BackendTask): Task => ({
  id: task.id,
  title: task.title,
  description: task.description || '',
  status: task.completed ? 'done' : 'backlog',
  createdAt: new Date(task.createdAt),
  updatedAt: new Date(task.updatedAt),
  assignee: task.assignee,
  dod: task.dod,
})

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Загрузка задач с бэкенда
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(API_URL)
      const result = await response.json()

      if (result.success) {
        setTasks(result.data.map(backendToFrontend))
      } else {
        setError('Failed to load tasks')
      }
    } catch (err) {
      setError('Cannot connect to server')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event

    if (!over) return

    if (active.id !== over.id) {
      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((task) => task.id === active.id)
        const overIndex = prevTasks.findIndex((task) => task.id === over.id)

        if (activeIndex !== -1 && overIndex !== -1) {
          return arrayMove(prevTasks, activeIndex, overIndex)
        }

        // Handle dropping on a status column
        if (over.data?.current?.type === 'Column') {
          const updatedTasks = [...prevTasks]
          const taskIndex = updatedTasks.findIndex((t) => t.id === active.id)
          if (taskIndex !== -1) {
            updatedTasks[taskIndex] = {
              ...updatedTasks[taskIndex],
              status: over.id as TaskStatus,
            }
            return updatedTasks
          }
        }

        return prevTasks
      })
    }
  }, [])

  const addTask = useCallback(async (title: string, description: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      })
      const result = await response.json()

      if (result.success) {
        // Перезагружаем все задачи с сервера
        fetchTasks()
      } else {
        setError('Failed to create task')
      }
    } catch (err) {
      setError('Cannot connect to server')
    }
  }, [fetchTasks])

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        fetchTasks()
      } else {
        setError('Failed to delete task')
      }
    } catch (err) {
      setError('Cannot connect to server')
    }
  }, [fetchTasks])

  if (loading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Task Tracker</h1>
          <p>Loading tasks...</p>
        </header>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Task Tracker</h1>
        <p>Organize your tasks efficiently</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <Board tasks={tasks} onAddTask={addTask} onDeleteTask={deleteTask} />
      </DndContext>
    </div>
  )
}

export default App
