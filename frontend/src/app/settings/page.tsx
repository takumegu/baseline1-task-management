'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Settings {
  workingDays: string[];
  holidays: string[];
  ganttViewMode: string;
}

const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: '月曜日' },
  { value: 'TUESDAY', label: '火曜日' },
  { value: 'WEDNESDAY', label: '水曜日' },
  { value: 'THURSDAY', label: '木曜日' },
  { value: 'FRIDAY', label: '金曜日' },
  { value: 'SATURDAY', label: '土曜日' },
  { value: 'SUNDAY', label: '日曜日' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    holidays: [],
    ganttViewMode: 'Day',
  });
  const [newHoliday, setNewHoliday] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('taskManagementSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleWorkingDayToggle = (day: string) => {
    setSettings((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const handleAddHoliday = () => {
    if (!newHoliday) return;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(newHoliday)) {
      alert('日付はYYYY-MM-DD形式で入力してください');
      return;
    }

    if (settings.holidays.includes(newHoliday)) {
      alert('この日付はすでに登録されています');
      return;
    }

    setSettings((prev) => ({
      ...prev,
      holidays: [...prev.holidays, newHoliday].sort(),
    }));
    setNewHoliday('');
  };

  const handleRemoveHoliday = (holiday: string) => {
    setSettings((prev) => ({
      ...prev,
      holidays: prev.holidays.filter((h) => h !== holiday),
    }));
  };

  const handleSave = () => {
    setSaving(true);

    // Save to localStorage
    localStorage.setItem('taskManagementSettings', JSON.stringify(settings));

    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 500);
  };

  const handleImportHolidays = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const dates: string[] = [];

        lines.forEach((line) => {
          const date = line.trim().split(',')[0];
          if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            dates.push(date);
          }
        });

        setSettings((prev) => ({
          ...prev,
          holidays: Array.from(new Set([...prev.holidays, ...dates])).sort(),
        }));

        alert(`${dates.length}件の休日をインポートしました`);
      } catch (error: any) {
        alert(`ファイルの読み込みに失敗しました: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>タスク管理システム</h1>
          <Link href="/projects">
            <button className="button button-secondary">プロジェクト一覧</button>
          </Link>
        </div>
      </header>

      <div className="container">
        <h2>設定</h2>

        {success && (
          <div className="card" style={{ backgroundColor: '#e8f5e9', border: '1px solid #4caf50', marginBottom: '1.5rem' }}>
            <p style={{ color: '#2e7d32', margin: 0 }}>設定を保存しました</p>
          </div>
        )}

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>稼働曜日</h3>
          <p style={{ color: '#757575', marginBottom: '1rem', fontSize: '0.875rem' }}>
            タスクの期間計算に使用する稼働曜日を選択してください
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
            {DAYS_OF_WEEK.map((day) => (
              <label
                key={day.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: settings.workingDays.includes(day.value) ? '#e3f2fd' : 'white',
                }}
              >
                <input
                  type="checkbox"
                  checked={settings.workingDays.includes(day.value)}
                  onChange={() => handleWorkingDayToggle(day.value)}
                  style={{ marginRight: '0.5rem' }}
                />
                <span>{day.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>休日設定</h3>
          <p style={{ color: '#757575', marginBottom: '1rem', fontSize: '0.875rem' }}>
            祝日やその他の休日を個別に登録できます
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="date"
              value={newHoliday}
              onChange={(e) => setNewHoliday(e.target.value)}
              className="form-input"
              style={{ flex: 1 }}
            />
            <button className="button" onClick={handleAddHoliday}>
              追加
            </button>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="button button-secondary" style={{ cursor: 'pointer' }}>
              CSVから一括インポート
              <input
                type="file"
                accept=".csv"
                onChange={handleImportHolidays}
                style={{ display: 'none' }}
              />
            </label>
            <p style={{ color: '#757575', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              CSV形式: 1行目に日付（YYYY-MM-DD形式）、2列目以降は無視されます
            </p>
          </div>

          {settings.holidays.length > 0 ? (
            <div style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '0.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                {settings.holidays.map((holiday) => (
                  <div
                    key={holiday}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px',
                    }}
                  >
                    <span style={{ fontSize: '0.875rem' }}>{holiday}</span>
                    <button
                      onClick={() => handleRemoveHoliday(holiday)}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: '#d32f2f',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '0 0.25rem',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#757575', border: '1px solid #ddd', borderRadius: '4px' }}>
              登録されている休日はありません
            </div>
          )}
          {settings.holidays.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#757575' }}>
              {settings.holidays.length}件の休日が登録されています
            </div>
          )}
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>ガントチャート表示設定</h3>
          <div className="form-group">
            <label className="form-label">既定の表示粒度</label>
            <select
              className="form-select"
              value={settings.ganttViewMode}
              onChange={(e) => setSettings((prev) => ({ ...prev, ganttViewMode: e.target.value }))}
            >
              <option value="Day">日</option>
              <option value="Week">週</option>
              <option value="Month">月</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="button" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '設定を保存'}
          </button>
          <Link href="/projects">
            <button className="button button-secondary">キャンセル</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
