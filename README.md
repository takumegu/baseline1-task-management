# タスク管理ツール（Task Management System）

ガントチャート機能を備えたタスク管理ツールです。プロジェクトとタスクを管理し、依存関係を可視化できます。

## 技術スタック

- **Backend**: Spring Boot 3.2.0, Java 17, PostgreSQL 16
- **Frontend**: Next.js 14, TypeScript
- **実行環境**: Docker Compose

## 前提条件

以下のツールがインストールされていることを確認してください：

- Docker Desktop
- Git

**ローカルのJavaやMaven環境は不要です。** すべてDocker環境内で動作します。

## クイックスタート

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd baseline1-task-management
```

### 2. アプリケーションの起動

```bash
make up
```

このコマンドで以下が実行されます：
- PostgreSQLデータベースの起動
- バックエンドAPIのビルドと起動
- フロントエンドアプリケーションの起動

### 3. アクセス

アプリケーションが起動したら、以下のURLでアクセスできます：

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8080
- **APIヘルスチェック**: http://localhost:8080/actuator/health

## 利用可能なコマンド

```bash
make help          # ヘルプを表示
make up            # すべてのサービスを起動
make down          # すべてのサービスを停止
make build         # すべてのサービスをビルド
make rebuild       # すべてのサービスを再ビルドして起動
make logs          # すべてのログを表示
make logs-backend  # バックエンドのログを表示
make logs-frontend # フロントエンドのログを表示
make logs-db       # データベースのログを表示
make test          # バックエンドのテストを実行
make db-reset      # データベースをリセット（注意：すべてのデータが削除されます）
make clean         # すべてのコンテナ、ボリューム、イメージを削除
make restart       # すべてのサービスを再起動
make status        # すべてのサービスの状態を表示
```

## プロジェクト構成

```
.
├── backend/                # Spring Boot バックエンド
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/taskmanagement/
│   │   │   │   ├── model/           # エンティティクラス
│   │   │   │   ├── repository/      # データアクセス層
│   │   │   │   ├── service/         # ビジネスロジック層
│   │   │   │   ├── controller/      # REST APIコントローラー
│   │   │   │   ├── dto/             # データ転送オブジェクト
│   │   │   │   ├── config/          # 設定クラス
│   │   │   │   └── exception/       # 例外ハンドラー
│   │   │   └── resources/
│   │   │       ├── db/migration/    # Flywayマイグレーション
│   │   │       └── application.yml  # アプリケーション設定
│   │   └── test/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/               # Next.js フロントエンド
│   └── (Next.js structure)
├── docker-compose.yml      # Docker Compose設定
├── Makefile               # 便利なコマンド集
└── README.md
```

## API エンドポイント

### プロジェクト管理

- `GET /api/projects` - すべてのプロジェクトを取得
- `GET /api/projects/{id}` - 特定のプロジェクトを取得
- `POST /api/projects` - 新しいプロジェクトを作成
- `PATCH /api/projects/{id}` - プロジェクトを更新
- `DELETE /api/projects/{id}` - プロジェクトを削除

### タスク管理

- `GET /api/projects/{projectId}/tasks` - プロジェクトのタスク一覧を取得
- `GET /api/tasks/{id}` - 特定のタスクを取得
- `POST /api/projects/{projectId}/tasks` - 新しいタスクを作成
- `PATCH /api/tasks/{id}` - タスクを更新
- `DELETE /api/tasks/{id}` - タスクを削除

### タスク依存関係

- `GET /api/tasks/{taskId}/dependencies` - タスクの依存関係を取得
- `POST /api/tasks/{taskId}/dependencies` - 依存関係を作成
- `DELETE /api/tasks/{taskId}/dependencies/{dependencyId}` - 依存関係を削除

## データベース

### スキーマ

アプリケーションは以下のテーブルを使用します：

- `project` - プロジェクト情報
- `task` - タスク情報
- `task_dependency` - タスク間の依存関係
- `import_job` - CSV/Excelインポート履歴

### マイグレーション

データベーススキーマはFlywayによって自動的に管理されます。マイグレーションファイルは `backend/src/main/resources/db/migration/` にあります。

### データのリセット

開発中にデータベースをリセットする必要がある場合：

```bash
make db-reset
```

**注意**: このコマンドはすべてのデータを削除します。

## 開発ガイド

### バックエンドのみを再ビルド

```bash
docker-compose build backend
docker-compose up -d backend
```

### フロントエンドのみを再ビルド

```bash
docker-compose build frontend
docker-compose up -d frontend
```

### ログの確認

```bash
# すべてのログ
make logs

# バックエンドのみ
make logs-backend

# データベースのみ
make logs-db
```

## トラブルシューティング

### ポートが既に使用されている

別のアプリケーションがポート3000、8080、または5432を使用している場合、docker-compose.ymlでポート番号を変更してください。

### データベース接続エラー

データベースが完全に起動するまで待つ必要がある場合があります。以下のコマンドでログを確認してください：

```bash
make logs-db
```

### ビルドエラー

クリーンビルドを試してください：

```bash
make clean
make build
make up
```

## Phase1 機能

Phase1では以下の機能が実装されています：

- プロジェクト管理（作成、編集、削除）
- タスク管理（作成、編集、削除）
- タスク依存関係の管理
- 基本的なRESTful API

## 今後の予定（Phase2+）

- ガントチャートUI
- CSV/Excelインポート機能
- エクスポート機能
- ユーザー認証・認可
- 複数ユーザー対応
- カレンダー表示

## ライセンス

This project is proprietary software.
