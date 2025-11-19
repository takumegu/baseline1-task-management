'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ViewMode } from 'gantt-task-react';
import { api } from '@/lib/api';
import type { Project, Task } from '@/types';
import GanttChart from '@/components/GanttChart';
import TaskDetailModal from '@/components/TaskDetailModal';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewType, setViewType] = useState<'table' | 'gantt'>('gantt');
  const [ganttViewMode, setGanttViewMode] = useState<ViewMode>(ViewMode.Day);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    name: '',
    startDate: '',
    endDate: '',
    assignee: '',
    status: 'planned',
    progress: 0,
  });

  useEffect(() => {
    loadProjectAndTasks();
  }, [projectId]);

  const loadProjectAndTasks = async () => {
    try {
      setLoading(true);
      const [projectData, tasksData] = await Promise.all([
        api.getProject(projectId),
        api.getTasks(projectId),
      ]);
      setProject(projectData);
      setTasks(tasksData);
      setError(null);
    } catch (err) {
      setError('データの読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTask(projectId, {
        ...newTask,
        isMilestone: false,
      });
      setNewTask({
        name: '',
        startDate: '',
        endDate: '',
        assignee: '',
        status: 'planned',
        progress: 0,
      });
      setShowCreateForm(false);
      loadProjectAndTasks();
    } catch (err) {
      setError('タスクの作成に失敗しました');
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('このタスクを削除しますか？')) return;

    try {
      await api.deleteTask(taskId);
      loadProjectAndTasks();
    } catch (err) {
      setError('タスクの削除に失敗しました');
      console.error(err);
    }
  };

  const handleUpdateProgress = async (taskId: number, progress: number) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      await api.updateTask(taskId, {
        projectId: task.projectId,
        name: task.name,
        startDate: task.startDate,
        endDate: task.endDate,
        progress,
        status: task.status,
      });
      loadProjectAndTasks();
    } catch (err) {
      setError('進捗の更新に失敗しました');
      console.error(err);
    }
  };

  const handleUpdateStatus = async (taskId: number, status: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      await api.updateTask(taskId, {
        projectId: task.projectId,
        name: task.name,
        startDate: task.startDate,
        endDate: task.endDate,
        progress: task.progress,
        status,
      });
      loadProjectAndTasks();
    } catch (err) {
      setError('ステータスの更新に失敗しました');
      console.error(err);
    }
  };

  const handleGanttTaskChange = async (task: Task) => {
    try {
      await api.updateTask(task.id, {
        projectId: task.projectId,
        name: task.name,
        startDate: task.startDate,
        endDate: task.endDate,
        progress: task.progress,
        status: task.status,
      });
      loadProjectAndTasks();
    } catch (err) {
      setError('タスクの更新に失敗しました');
      console.error(err);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    const styles: Record<string, any> = {
      planned: { backgroundColor: '#e3f2fd', color: '#1976d2' },
      in_progress: { backgroundColor: '#fff3e0', color: '#f57c00' },
      done: { backgroundColor: '#e8f5e9', color: '#388e3c' },
      blocked: { backgroundColor: '#ffebee', color: '#d32f2f' },
      on_hold: { backgroundColor: '#f5f5f5', color: '#757575' },
    };
    return styles[status] || styles.planned;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      planned: '計画中',
      in_progress: '進行中',
      done: '完了',
      blocked: 'ブロック',
      on_hold: '保留',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div>
        <header className="header">
          <h1>タスク管理システム</h1>
        </header>
        <div className="container">
          <div className="loading">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div>
        <header className="header">
          <h1>タスク管理システム</h1>
        </header>
        <div className="container">
          <div className="error">プロジェクトが見つかりません</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>タスク管理システム</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/projects">
              <button className="button button-secondary">プロジェクト一覧</button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>{project.name}</h2>
          <div style={{ color: '#757575' }}>
            {project.startDate && project.endDate && (
              <p>期間: {project.startDate} 〜 {project.endDate}</p>
            )}
            <p>ステータス: {project.status === 'active' ? 'アクティブ' : 'アーカイブ'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3>タスク ({tasks.length})</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
              <button
                onClick={() => setViewType('gantt')}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  backgroundColor: viewType === 'gantt' ? '#1976d2' : 'white',
                  color: viewType === 'gantt' ? 'white' : '#333',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                ガントチャート
              </button>
              <button
                onClick={() => setViewType('table')}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderLeft: '1px solid #ddd',
                  backgroundColor: viewType === 'table' ? '#1976d2' : 'white',
                  color: viewType === 'table' ? 'white' : '#333',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                一覧表示
              </button>
            </div>
            {viewType === 'gantt' && (
              <div style={{ display: 'flex', gap: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                <button
                  onClick={() => setGanttViewMode(ViewMode.Day)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: 'none',
                    backgroundColor: ganttViewMode === ViewMode.Day ? '#1976d2' : 'white',
                    color: ganttViewMode === ViewMode.Day ? 'white' : '#333',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  日
                </button>
                <button
                  onClick={() => setGanttViewMode(ViewMode.Week)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: 'none',
                    borderLeft: '1px solid #ddd',
                    backgroundColor: ganttViewMode === ViewMode.Week ? '#1976d2' : 'white',
                    color: ganttViewMode === ViewMode.Week ? 'white' : '#333',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  週
                </button>
                <button
                  onClick={() => setGanttViewMode(ViewMode.Month)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: 'none',
                    borderLeft: '1px solid #ddd',
                    backgroundColor: ganttViewMode === ViewMode.Month ? '#1976d2' : 'white',
                    color: ganttViewMode === ViewMode.Month ? 'white' : '#333',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  月
                </button>
              </div>
            )}
            <button className="button" onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? 'キャンセル' : '新規タスク'}
            </button>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        {showCreateForm && (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>新規タスク作成</h4>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">タスク名 *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">開始日 *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newTask.startDate}
                    onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">終了日 *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newTask.endDate}
                    onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">担当者</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">ステータス</label>
                  <select
                    className="form-select"
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  >
                    <option value="planned">計画中</option>
                    <option value="in_progress">進行中</option>
                    <option value="done">完了</option>
                    <option value="blocked">ブロック</option>
                    <option value="on_hold">保留</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">進捗 (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    max="100"
                    value={newTask.progress}
                    onChange={(e) => setNewTask({ ...newTask, progress: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="button">作成</button>
                <button type="button" className="button button-secondary" onClick={() => setShowCreateForm(false)}>
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {viewType === 'gantt' ? (
          tasks.length === 0 ? (
            <div className="card">
              <p>タスクがありません。新規タスクを作成してください。</p>
            </div>
          ) : (
            <GanttChart
              tasks={tasks}
              onTaskChange={handleGanttTaskChange}
              onTaskDelete={handleDeleteTask}
              viewMode={ganttViewMode}
            />
          )
        ) : tasks.length === 0 ? (
          <div className="card">
            <p>タスクがありません。新規タスクを作成してください。</p>
          </div>
        ) : (
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>タスク名</th>
                  <th>担当者</th>
                  <th>開始日</th>
                  <th>終了日</th>
                  <th>ステータス</th>
                  <th>進捗</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td
                      style={{
                        fontWeight: 500,
                        cursor: 'pointer',
                        color: '#1976d2',
                      }}
                      onClick={() => setSelectedTask(task)}
                    >
                      {task.name}
                    </td>
                    <td>{task.assignee || '-'}</td>
                    <td>{task.startDate}</td>
                    <td>{task.endDate}</td>
                    <td>
                      <select
                        className="form-select"
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.875rem',
                          ...getStatusBadgeStyle(task.status),
                          border: 'none',
                          borderRadius: '12px',
                        }}
                      >
                        <option value="planned">計画中</option>
                        <option value="in_progress">進行中</option>
                        <option value="done">完了</option>
                        <option value="blocked">ブロック</option>
                        <option value="on_hold">保留</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={task.progress}
                        onChange={(e) => handleUpdateProgress(task.id, parseInt(e.target.value) || 0)}
                        style={{
                          width: '60px',
                          padding: '0.25rem 0.5rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                        }}
                      />
                      <span style={{ marginLeft: '0.25rem' }}>%</span>
                    </td>
                    <td>
                      <button
                        className="button button-danger"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            allTasks={tasks}
            onClose={() => setSelectedTask(null)}
            onUpdate={loadProjectAndTasks}
          />
        )}
      </div>
    </div>
  );
}
