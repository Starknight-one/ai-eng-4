export interface DodItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  dod?: DodItem[];
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  dod?: DodItem[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  dod?: DodItem[];
}
