'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <header className="header">
        <h1>タスク管理システム</h1>
      </header>

      <div className="container">
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>ようこそ</h2>
          <p style={{ marginBottom: '2rem' }}>
            タスク管理ツールへようこそ。プロジェクトとタスクを効率的に管理できます。
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/projects">
              <button className="button">プロジェクト管理</button>
            </Link>
            <Link href="/import">
              <button className="button button-secondary">データ取込</button>
            </Link>
            <Link href="/settings">
              <button className="button button-secondary">設定</button>
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>主な機能（Phase 1）</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>✓ ガントチャート表示（日/週/月表示切替）</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ プロジェクト・タスク管理</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ タスク依存関係管理（Finish-to-Start）</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ 進捗・ステータス管理</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ CSV/Excelデータ取込</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ 稼働日・休日設定</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
