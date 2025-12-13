export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'test' | 'done'

export interface DodItem {
  id: string
  text: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  createdAt?: Date
  updatedAt?: Date
  assignee?: string
  deadline?: string
  dod?: DodItem[]
}

export interface Column {
  id: TaskStatus
  title: string
  color: string
}
