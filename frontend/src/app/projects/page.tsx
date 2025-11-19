'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Project } from '@/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('プロジェクトの読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProject(newProject);
      setNewProject({ name: '', startDate: '', endDate: '' });
      setShowCreateForm(false);
      loadProjects();
    } catch (err) {
      setError('プロジェクトの作成に失敗しました');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このプロジェクトを削除しますか？')) return;

    try {
      await api.deleteProject(id);
      loadProjects();
    } catch (err) {
      setError('プロジェクトの削除に失敗しました');
      console.error(err);
    }
  };

  return (
    <div>
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>タスク管理システム</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/import">
              <button className="button button-secondary">データ取込</button>
            </Link>
            <Link href="/settings">
              <button className="button button-secondary">設定</button>
            </Link>
            <Link href="/">
              <button className="button button-secondary">ホーム</button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>プロジェクト一覧</h2>
          <button className="button" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'キャンセル' : '新規プロジェクト'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {showCreateForm && (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>新規プロジェクト作成</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">プロジェクト名 *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">開始日</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">終了日</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
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

        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : projects.length === 0 ? (
          <div className="card">
            <p>プロジェクトがありません。新規プロジェクトを作成してください。</p>
          </div>
        ) : (
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>プロジェクト名</th>
                  <th>開始日</th>
                  <th>終了日</th>
                  <th>ステータス</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <Link href={`/projects/${project.id}`} style={{ color: '#1976d2', fontWeight: 500 }}>
                        {project.name}
                      </Link>
                    </td>
                    <td>{project.startDate || '-'}</td>
                    <td>{project.endDate || '-'}</td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        backgroundColor: project.status === 'active' ? '#e3f2fd' : '#f5f5f5',
                        color: project.status === 'active' ? '#1976d2' : '#757575',
                      }}>
                        {project.status === 'active' ? 'アクティブ' : 'アーカイブ'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link href={`/projects/${project.id}`}>
                          <button className="button" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                            詳細
                          </button>
                        </Link>
                        <button
                          className="button button-danger"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                          onClick={() => handleDelete(project.id)}
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
