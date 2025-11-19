import axios, { AxiosInstance } from 'axios';
import type {
  Project,
  Task,
  TaskDependency,
  ApiResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateDependencyRequest,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Project APIs
  async getProjects(activeOnly = false): Promise<Project[]> {
    const response = await this.client.get<ApiResponse<Project[]>>('/projects', {
      params: { activeOnly },
    });
    return response.data.data;
  }

  async getProject(id: number): Promise<Project> {
    const response = await this.client.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data;
  }

  async createProject(data: CreateProjectRequest): Promise<Project> {
    const response = await this.client.post<ApiResponse<Project>>('/projects', data);
    return response.data.data;
  }

  async updateProject(id: number, data: UpdateProjectRequest): Promise<Project> {
    const response = await this.client.patch<ApiResponse<Project>>(`/projects/${id}`, data);
    return response.data.data;
  }

  async deleteProject(id: number): Promise<void> {
    await this.client.delete(`/projects/${id}`);
  }

  // Task APIs
  async getTasks(projectId: number, from?: string, to?: string): Promise<Task[]> {
    const response = await this.client.get<ApiResponse<Task[]>>(`/projects/${projectId}/tasks`, {
      params: { from, to },
    });
    return response.data.data;
  }

  async getTask(id: number): Promise<Task> {
    const response = await this.client.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data;
  }

  async createTask(projectId: number, data: CreateTaskRequest): Promise<Task> {
    const response = await this.client.post<ApiResponse<Task>>(
      `/projects/${projectId}/tasks`,
      data
    );
    return response.data.data;
  }

  async updateTask(id: number, data: UpdateTaskRequest): Promise<Task> {
    const response = await this.client.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
    return response.data.data;
  }

  async deleteTask(id: number): Promise<void> {
    await this.client.delete(`/tasks/${id}`);
  }

  // Task Dependency APIs
  async getDependencies(taskId: number): Promise<TaskDependency[]> {
    const response = await this.client.get<ApiResponse<TaskDependency[]>>(
      `/tasks/${taskId}/dependencies`
    );
    return response.data.data;
  }

  async createDependency(taskId: number, data: CreateDependencyRequest): Promise<TaskDependency> {
    const response = await this.client.post<ApiResponse<TaskDependency>>(
      `/tasks/${taskId}/dependencies`,
      data
    );
    return response.data.data;
  }

  async deleteDependency(taskId: number, dependencyId: number): Promise<void> {
    await this.client.delete(`/tasks/${taskId}/dependencies/${dependencyId}`);
  }
}

export const api = new ApiClient();
