'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface ImportRow {
  project_name?: string;
  task_code?: string;
  task_name: string;
  start_date: string;
  end_date: string;
  progress?: string;
  status?: string;
  assignee?: string;
  is_milestone?: string;
  notes?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [data, setData] = useState<ImportRow[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [success, setSuccess] = useState(false);
  const [stats, setStats] = useState<{ created: number; updated: number; failed: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setData([]);
    setErrors([]);
    setSuccess(false);
    setStats(null);

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      parseCSV(selectedFile);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      parseExcel(selectedFile);
    } else {
      alert('サポートされていないファイル形式です。CSV または Excel ファイルを選択してください。');
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data as ImportRow[]);
        validateData(results.data as ImportRow[]);
      },
      error: (error) => {
        alert(`CSVファイルの解析に失敗しました: ${error.message}`);
      },
    });
  };

  const parseExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as ImportRow[];
        setData(jsonData);
        validateData(jsonData);
      } catch (error: any) {
        alert(`Excelファイルの解析に失敗しました: ${error.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const validateData = (rows: ImportRow[]) => {
    const validationErrors: ValidationError[] = [];

    rows.forEach((row, index) => {
      const rowNum = index + 2; // Header is row 1, data starts at row 2

      if (!row.task_name || row.task_name.trim() === '') {
        validationErrors.push({
          row: rowNum,
          field: 'task_name',
          message: 'タスク名は必須です',
        });
      }

      if (!row.start_date || row.start_date.trim() === '') {
        validationErrors.push({
          row: rowNum,
          field: 'start_date',
          message: '開始日は必須です',
        });
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(row.start_date)) {
        validationErrors.push({
          row: rowNum,
          field: 'start_date',
          message: '開始日はYYYY-MM-DD形式で入力してください',
        });
      }

      if (!row.end_date || row.end_date.trim() === '') {
        validationErrors.push({
          row: rowNum,
          field: 'end_date',
          message: '終了日は必須です',
        });
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(row.end_date)) {
        validationErrors.push({
          row: rowNum,
          field: 'end_date',
          message: '終了日はYYYY-MM-DD形式で入力してください',
        });
      }

      if (row.progress) {
        const progress = parseInt(row.progress);
        if (isNaN(progress) || progress < 0 || progress > 100) {
          validationErrors.push({
            row: rowNum,
            field: 'progress',
            message: '進捗は0〜100の数値で入力してください',
          });
        }
      }
    });

    setErrors(validationErrors);
  };

  const handleImport = async () => {
    if (errors.length > 0) {
      alert('エラーがあるため、インポートできません。エラーを修正してください。');
      return;
    }

    if (data.length === 0) {
      alert('インポートするデータがありません。');
      return;
    }

    setImporting(true);

    try {
      // Simulate import (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setStats({
        created: data.length,
        updated: 0,
        failed: 0,
      });
      setSuccess(true);
    } catch (error: any) {
      alert(`インポートに失敗しました: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        project_name: 'サンプルプロジェクト',
        task_code: 'TASK-001',
        task_name: 'サンプルタスク',
        start_date: '2025-11-01',
        end_date: '2025-11-10',
        progress: '0',
        status: 'planned',
        assignee: '山田太郎',
        is_milestone: 'FALSE',
        notes: 'これはサンプルです',
      },
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'task_import_template.csv';
    link.click();
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
        <h2>データ取込</h2>

        {success && stats && (
          <div className="card" style={{ backgroundColor: '#e8f5e9', border: '1px solid #4caf50', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>インポート完了</h3>
            <p style={{ margin: 0 }}>
              作成: {stats.created}件、更新: {stats.updated}件、失敗: {stats.failed}件
            </p>
          </div>
        )}

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>1. テンプレートダウンロード</h3>
          <p style={{ color: '#757575', marginBottom: '1rem' }}>
            CSVテンプレートをダウンロードして、タスク情報を入力してください。
          </p>
          <button className="button button-secondary" onClick={downloadTemplate}>
            テンプレートダウンロード
          </button>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>2. ファイル選択</h3>
          <p style={{ color: '#757575', marginBottom: '1rem' }}>
            CSV または Excel ファイルを選択してください（最大10MB）
          </p>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '100%',
            }}
          />
          {file && (
            <div style={{ marginTop: '0.5rem', color: '#757575', fontSize: '0.875rem' }}>
              選択されたファイル: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </div>

        {data.length > 0 && (
          <>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>3. データプレビュー</h3>
              <p style={{ color: '#757575', marginBottom: '1rem' }}>
                {data.length}件のタスクが見つかりました
              </p>

              {errors.length > 0 && (
                <div className="error" style={{ marginBottom: '1rem' }}>
                  <strong>{errors.length}件のエラーがあります:</strong>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                    {errors.slice(0, 10).map((error, index) => (
                      <li key={index}>
                        行{error.row} - {error.field}: {error.message}
                      </li>
                    ))}
                    {errors.length > 10 && <li>...他 {errors.length - 10}件</li>}
                  </ul>
                </div>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>プロジェクト名</th>
                      <th>タスクコード</th>
                      <th>タスク名</th>
                      <th>開始日</th>
                      <th>終了日</th>
                      <th>進捗</th>
                      <th>ステータス</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 10).map((row, index) => (
                      <tr key={index}>
                        <td>{row.project_name || '-'}</td>
                        <td>{row.task_code || '-'}</td>
                        <td>{row.task_name}</td>
                        <td>{row.start_date}</td>
                        <td>{row.end_date}</td>
                        <td>{row.progress || '0'}%</td>
                        <td>{row.status || 'planned'}</td>
                      </tr>
                    ))}
                    {data.length > 10 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', color: '#757575' }}>
                          ...他 {data.length - 10}件
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>4. インポート実行</h3>
              <p style={{ color: '#757575', marginBottom: '1rem' }}>
                データを確認して、インポートを実行してください。
              </p>
              <button
                className="button"
                onClick={handleImport}
                disabled={importing || errors.length > 0}
              >
                {importing ? 'インポート中...' : 'インポート実行'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
