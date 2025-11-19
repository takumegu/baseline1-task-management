'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Task, TaskDependency } from '@/types';

interface TaskDetailModalProps {
  task: Task;
  allTasks: Task[];
  onClose: () => void;
  onUpdate: () => void;
}

export default function TaskDetailModal({
  task,
  allTasks,
  onClose,
  onUpdate,
}: TaskDetailModalProps) {
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddDependency, setShowAddDependency] = useState(false);
  const [selectedPredecessorId, setSelectedPredecessorId] = useState<string>('');

  useEffect(() => {
    loadDependencies();
  }, [task.id]);

  const loadDependencies = async () => {
    try {
      setLoading(true);
      const deps = await api.getDependencies(task.id);
      setDependencies(deps);
      setError(null);
    } catch (err) {
      setError('依存関係の読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDependency = async () => {
    if (!selectedPredecessorId) return;

    try {
      await api.createDependency(task.id, {
        predecessorTaskId: parseInt(selectedPredecessorId),
        type: 'FS',
      });
      setSelectedPredecessorId('');
      setShowAddDependency(false);
      loadDependencies();
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.message || '依存関係の追加に失敗しました');
      console.error(err);
    }
  };

  const handleDeleteDependency = async (dependencyId: number) => {
    if (!confirm('この依存関係を削除しますか？')) return;

    try {
      await api.deleteDependency(task.id, dependencyId);
      loadDependencies();
      onUpdate();
    } catch (err) {
      setError('依存関係の削除に失敗しました');
      console.error(err);
    }
  };

  const getPredecessorTask = (predecessorId: number): Task | undefined => {
    return allTasks.find((t) => t.id === predecessorId);
  };

  const availablePredecessors = allTasks.filter(
    (t) =>
      t.id !== task.id &&
      !dependencies.some((d) => d.predecessorTaskId === t.id)
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>タスク詳細</h2>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#757575',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>{task.name}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', color: '#757575', fontSize: '0.875rem' }}>
            <div>
              <strong>開始日:</strong> {task.startDate}
            </div>
            <div>
              <strong>終了日:</strong> {task.endDate}
            </div>
            <div>
              <strong>進捗:</strong> {task.progress}%
            </div>
            <div>
              <strong>ステータス:</strong> {task.status}
            </div>
            {task.assignee && (
              <div>
                <strong>担当者:</strong> {task.assignee}
              </div>
            )}
            {task.isMilestone && (
              <div>
                <strong>マイルストーン</strong>
              </div>
            )}
          </div>
          {task.notes && (
            <div style={{ marginTop: '1rem' }}>
              <strong>メモ:</strong>
              <p style={{ marginTop: '0.5rem', color: '#757575' }}>{task.notes}</p>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>依存関係 (Finish-to-Start)</h3>
            <button
              className="button"
              onClick={() => setShowAddDependency(!showAddDependency)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {showAddDependency ? 'キャンセル' : '追加'}
            </button>
          </div>

          {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}

          {showAddDependency && (
            <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
              <div className="form-group">
                <label className="form-label">先行タスクを選択</label>
                <select
                  className="form-select"
                  value={selectedPredecessorId}
                  onChange={(e) => setSelectedPredecessorId(e.target.value)}
                >
                  <option value="">タスクを選択...</option>
                  {availablePredecessors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.startDate} - {t.endDate})
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="button"
                onClick={handleAddDependency}
                disabled={!selectedPredecessorId}
                style={{ marginTop: '0.5rem' }}
              >
                追加
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#757575' }}>読み込み中...</div>
          ) : dependencies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#757575' }}>
              依存関係がありません
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {dependencies.map((dep) => {
                const predecessor = getPredecessorTask(dep.predecessorTaskId);
                return (
                  <div
                    key={dep.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {predecessor?.name || `タスク #${dep.predecessorTaskId}`}
                      </div>
                      {predecessor && (
                        <div style={{ fontSize: '0.875rem', color: '#757575', marginTop: '0.25rem' }}>
                          {predecessor.startDate} - {predecessor.endDate}
                        </div>
                      )}
                    </div>
                    <button
                      className="button button-danger"
                      onClick={() => handleDeleteDependency(dep.id)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      削除
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
          <button className="button button-secondary" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
