import request from 'supertest';
import app from '../../app';
import * as fs from 'fs';
import * as path from 'path';

const tasksFilePath = path.join(__dirname, '../../data/tasks.json');

// Helper to backup and restore tasks.json
const backupTasks = () => {
  if (fs.existsSync(tasksFilePath)) {
    return fs.readFileSync(tasksFilePath, 'utf-8');
  }
  return '[]';
};

const restoreTasks = (backup: string) => {
  fs.writeFileSync(tasksFilePath, backup, 'utf-8');
};

describe('Tasks API', () => {
  let originalTasks: string;

  beforeAll(() => {
    originalTasks = backupTasks();
  });

  afterAll(() => {
    restoreTasks(originalTasks);
  });

  beforeEach(() => {
    // Reset to empty tasks before each test
    fs.writeFileSync(tasksFilePath, '[]', 'utf-8');
  });

  describe('GET /api/tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    it('should return all tasks', async () => {
      // Create a task first
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task' });

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.count).toBe(1);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with valid data', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task description',
        priority: 'high',
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Task');
      expect(response.body.data.description).toBe('Task description');
      expect(response.body.data.priority).toBe('high');
      expect(response.body.data.completed).toBe(false);
      expect(response.body.data.id).toBeDefined();
    });

    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ description: 'No title' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Title is required');
    });

    it('should return 400 when title is empty', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a task by id', async () => {
      // Create a task first
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Find Me' });

      const taskId = createResponse.body.data.id;

      const response = await request(app).get(`/api/tasks/${taskId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Find Me');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app).get('/api/tasks/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      // Create a task first
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Original Title' });

      const taskId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ title: 'Updated Title', completed: true });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.completed).toBe(true);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/non-existent-id')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      // Create a task first
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Delete Me' });

      const taskId = createResponse.body.data.id;

      const response = await request(app).delete(`/api/tasks/${taskId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task deleted successfully');

      // Verify task is deleted
      const getResponse = await request(app).get(`/api/tasks/${taskId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app).delete('/api/tasks/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});

describe('Health Check', () => {
  it('should return healthy status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.message).toBe('Task Tracker API is running');
    expect(response.body.timestamp).toBeDefined();
  });
});

describe('Special Characters Handling', () => {
  let originalTasks: string;

  beforeAll(() => {
    if (fs.existsSync(tasksFilePath)) {
      originalTasks = fs.readFileSync(tasksFilePath, 'utf-8');
    } else {
      originalTasks = '[]';
    }
  });

  afterAll(() => {
    fs.writeFileSync(tasksFilePath, originalTasks, 'utf-8');
  });

  beforeEach(() => {
    fs.writeFileSync(tasksFilePath, '[]', 'utf-8');
  });

  it('should create a task with & in the title', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ title: 'Research & Development' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Research & Development');

    // Verify the file is valid JSON
    const fileContent = fs.readFileSync(tasksFilePath, 'utf-8');
    expect(() => JSON.parse(fileContent)).not.toThrow();
  });

  it('should create a task with emojis in the title', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ title: 'Bug fix 🐛' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Bug fix 🐛');

    // Verify the file is valid JSON
    const fileContent = fs.readFileSync(tasksFilePath, 'utf-8');
    expect(() => JSON.parse(fileContent)).not.toThrow();
  });

  it('should create a task with multiple special characters', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test & Debug 🔧 Feature 🚀' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Test & Debug 🔧 Feature 🚀');

    // Verify the file is valid JSON
    const fileContent = fs.readFileSync(tasksFilePath, 'utf-8');
    expect(() => JSON.parse(fileContent)).not.toThrow();
  });

  it('should retrieve tasks with special characters after creation', async () => {
    // Create task with special characters
    const createResponse = await request(app)
      .post('/api/tasks')
      .send({ title: 'Sales & Marketing 📊' });

    expect(createResponse.status).toBe(201);
    const taskId = createResponse.body.data.id;

    // Retrieve the task
    const getResponse = await request(app).get(`/api/tasks/${taskId}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.success).toBe(true);
    expect(getResponse.body.data.title).toBe('Sales & Marketing 📊');
  });

  it('should update a task to add special characters', async () => {
    // Create a normal task
    const createResponse = await request(app)
      .post('/api/tasks')
      .send({ title: 'Original Title' });

    expect(createResponse.status).toBe(201);
    const taskId = createResponse.body.data.id;

    // Update with special characters
    const updateResponse = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ title: 'Updated & Improved 🎉' });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.data.title).toBe('Updated & Improved 🎉');

    // Verify the file is valid JSON
    const fileContent = fs.readFileSync(tasksFilePath, 'utf-8');
    expect(() => JSON.parse(fileContent)).not.toThrow();

    // Verify subsequent API calls work
    const getAllResponse = await request(app).get('/api/tasks');
    expect(getAllResponse.status).toBe(200);
    expect(getAllResponse.body.data).toHaveLength(1);
  });

  it('should handle multiple tasks with special characters without corruption', async () => {
    // Create multiple tasks with special characters
    await request(app)
      .post('/api/tasks')
      .send({ title: 'Task One & Only' });

    await request(app)
      .post('/api/tasks')
      .send({ title: 'Task Two 🎯' });

    await request(app)
      .post('/api/tasks')
      .send({ title: 'Task & Three 🚀 More' });

    // Verify all tasks can be retrieved
    const response = await request(app).get('/api/tasks');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(3);

    // Verify the file is valid JSON
    const fileContent = fs.readFileSync(tasksFilePath, 'utf-8');
    expect(() => JSON.parse(fileContent)).not.toThrow();
  });
});
