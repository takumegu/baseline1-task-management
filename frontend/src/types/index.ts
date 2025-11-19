export interface Project {
  id: number;
  name: string;
  startDate?: string;
  endDate?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  projectId: number;
  taskCode?: string;
  name: string;
  assignee?: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: string;
  parentTaskId?: number;
  isMilestone: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDependency {
  id: number;
  taskId: number;
  predecessorTaskId: number;
  type: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    requestId?: string;
    timestamp: string;
  };
  errors: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
}

export interface CreateProjectRequest {
  name: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface CreateTaskRequest {
  projectId?: number;
  taskCode?: string;
  name: string;
  assignee?: string;
  startDate: string;
  endDate: string;
  progress?: number;
  status?: string;
  parentTaskId?: number;
  isMilestone?: boolean;
  notes?: string;
}

export interface UpdateTaskRequest {
  projectId?: number;
  name?: string;
  assignee?: string;
  startDate?: string;
  endDate?: string;
  progress?: number;
  status?: string;
  parentTaskId?: number;
  isMilestone?: boolean;
  notes?: string;
}

export interface CreateDependencyRequest {
  predecessorTaskId: number;
  type?: string;
}
