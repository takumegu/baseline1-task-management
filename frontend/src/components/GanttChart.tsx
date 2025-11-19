'use client';

import { useMemo } from 'react';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import type { Task } from '@/types';

interface GanttChartProps {
  tasks: Task[];
  onTaskChange?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
  viewMode?: ViewMode;
}

export default function GanttChart({
  tasks,
  onTaskChange,
  onTaskDelete,
  viewMode = ViewMode.Day,
}: GanttChartProps) {
  const ganttTasks: GanttTask[] = useMemo(() => {
    return tasks.map((task) => {
      const start = new Date(task.startDate);
      const end = new Date(task.endDate);

      // Ensure end date is at least 1 day after start for proper display
      if (task.isMilestone) {
        end.setHours(23, 59, 59, 999);
      } else if (start.getTime() >= end.getTime()) {
        end.setDate(start.getDate() + 1);
      }

      return {
        id: task.id.toString(),
        name: task.name,
        start,
        end,
        progress: task.progress,
        type: task.isMilestone ? 'milestone' : 'task',
        isDisabled: false,
        styles: {
          backgroundColor: getTaskColor(task.status),
          backgroundSelectedColor: getTaskColor(task.status, true),
          progressColor: getProgressColor(task.status),
          progressSelectedColor: getProgressColor(task.status, true),
        },
      } as GanttTask;
    });
  }, [tasks]);

  const handleTaskChange = (task: GanttTask) => {
    if (!onTaskChange) return;

    const originalTask = tasks.find((t) => t.id.toString() === task.id);
    if (!originalTask) return;

    const updatedTask: Task = {
      ...originalTask,
      startDate: task.start.toISOString().split('T')[0],
      endDate: task.end.toISOString().split('T')[0],
      progress: task.progress,
    };

    onTaskChange(updatedTask);
  };

  const handleTaskDelete = (task: GanttTask) => {
    if (!onTaskDelete) return;
    const taskId = parseInt(task.id);
    if (confirm(`タスク「${task.name}」を削除しますか？`)) {
      onTaskDelete(taskId);
    }
  };

  if (ganttTasks.length === 0) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <p style={{ color: '#757575', margin: 0 }}>
          タスクがありません。タスクを作成してガントチャートを表示してください。
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      overflow: 'hidden'
    }}>
      <Gantt
        tasks={ganttTasks}
        viewMode={viewMode}
        onDateChange={handleTaskChange}
        onProgressChange={handleTaskChange}
        onDelete={handleTaskDelete}
        listCellWidth=""
        columnWidth={viewMode === ViewMode.Month ? 300 : viewMode === ViewMode.Week ? 250 : 60}
        barFill={60}
        arrowIndent={20}
        fontSize="14"
        fontFamily="system-ui, -apple-system, sans-serif"
        locale="ja"
        todayColor="rgba(25, 118, 210, 0.15)"
      />
    </div>
  );
}

function getTaskColor(status: string, selected: boolean = false): string {
  const colors: Record<string, { normal: string; selected: string }> = {
    planned: { normal: '#90caf9', selected: '#64b5f6' },
    in_progress: { normal: '#ffb74d', selected: '#ffa726' },
    done: { normal: '#81c784', selected: '#66bb6a' },
    blocked: { normal: '#e57373', selected: '#ef5350' },
    on_hold: { normal: '#bdbdbd', selected: '#9e9e9e' },
  };
  const color = colors[status] || colors.planned;
  return selected ? color.selected : color.normal;
}

function getProgressColor(status: string, selected: boolean = false): string {
  const colors: Record<string, { normal: string; selected: string }> = {
    planned: { normal: '#1976d2', selected: '#1565c0' },
    in_progress: { normal: '#f57c00', selected: '#ef6c00' },
    done: { normal: '#388e3c', selected: '#2e7d32' },
    blocked: { normal: '#d32f2f', selected: '#c62828' },
    on_hold: { normal: '#757575', selected: '#616161' },
  };
  const color = colors[status] || colors.planned;
  return selected ? color.selected : color.normal;
}
