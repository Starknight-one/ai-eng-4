import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/Task';
import { logger } from '../utils/logger';

const router = Router();

// Path to tasks.json file
const tasksFilePath = path.join(__dirname, '../data/tasks.json');

// Helper function to read tasks from file
const readTasks = (): Task[] => {
  logger.info('Reading tasks from file', { path: tasksFilePath });
  try {
    const data = fs.readFileSync(tasksFilePath, 'utf-8');
    logger.info('Raw file content length', { length: data.length });
    const tasks = JSON.parse(data);
    logger.info('Successfully parsed tasks', { count: tasks.length });
    return tasks;
  } catch (error) {
    logger.error('Failed to read/parse tasks file', error);
    logger.warn('Returning empty array due to read error');
    return [];
  }
};

// Helper function to write tasks to file
const writeTasks = (tasks: Task[]): void => {
  logger.info('Writing tasks to file', { count: tasks.length });
  const jsonString = JSON.stringify(tasks, null, 2);
  logger.info('Final JSON string length', { length: jsonString.length });
  fs.writeFileSync(tasksFilePath, jsonString, 'utf-8');
  logger.info('Tasks file written successfully');
};

// GET /api/tasks - Get all tasks
router.get('/', (req: Request, res: Response): void => {
  logger.info('GET /api/tasks - Fetching all tasks');
  try {
    const tasks = readTasks();
    logger.info('Tasks fetched successfully', { count: tasks.length });
    res.status(200).json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    logger.error('Failed to fetch tasks', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks'
    });
  }
});

// POST /api/tasks - Create a new task
router.post('/', (req: Request, res: Response): void => {
  logger.info('POST /api/tasks - Creating new task', { body: req.body });
  try {
    const { title, description, dueDate, priority, assignee, dod } = req.body as CreateTaskRequest;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim() === '') {
      logger.warn('Task creation failed - invalid title', { title });
      res.status(400).json({
        success: false,
        error: 'Title is required and must be a non-empty string'
      });
      return;
    }

    const newTask: Task = {
      id: uuidv4(),
      title: title.trim(),
      description: description?.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: dueDate || undefined,
      priority: priority || undefined,
      assignee: assignee?.trim() || undefined,
      dod: dod || undefined
    };

    logger.info('New task object created', { task: newTask });

    const tasks = readTasks();
    logger.info('Current tasks count before adding', { count: tasks.length });
    tasks.push(newTask);
    writeTasks(tasks);

    logger.info('Task created successfully', { taskId: newTask.id });
    res.status(201).json({
      success: true,
      data: newTask,
      message: 'Task created successfully'
    });
  } catch (error) {
    logger.error('Failed to create task', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task'
    });
  }
});

// GET /api/tasks/:id - Get a single task by ID
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const tasks = readTasks();
    const task = tasks.find(t => t.id === id);

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task'
    });
  }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { title, description, completed, dueDate, priority, assignee, dod } = req.body as UpdateTaskRequest;

    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      });
      return;
    }

    // Update only provided fields
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        res.status(400).json({
          success: false,
          error: 'Title must be a non-empty string'
        });
        return;
      }
      tasks[taskIndex].title = title.trim();
    }

    if (description !== undefined) {
      tasks[taskIndex].description = description.trim() || undefined;
    }

    if (completed !== undefined) {
      tasks[taskIndex].completed = Boolean(completed);
    }

    if (dueDate !== undefined) {
      tasks[taskIndex].dueDate = dueDate || undefined;
    }

    if (priority !== undefined) {
      tasks[taskIndex].priority = priority || undefined;
    }

    if (assignee !== undefined) {
      tasks[taskIndex].assignee = assignee.trim() || undefined;
    }

    if (dod !== undefined) {
      tasks[taskIndex].dod = dod || undefined;
    }

    tasks[taskIndex].updatedAt = new Date().toISOString();

    writeTasks(tasks);

    res.status(200).json({
      success: true,
      data: tasks[taskIndex],
      message: 'Task updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
    });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      res.status(404).json({
        success: false,
        error: 'Task not found'
      });
      return;
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];
    writeTasks(tasks);

    res.status(200).json({
      success: true,
      data: deletedTask,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete task'
    });
  }
});

export default router;
