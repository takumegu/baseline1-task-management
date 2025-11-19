-- Task Management System - Initial Schema
-- PostgreSQL 16

-- Project table
CREATE TABLE project (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_project_status CHECK (status IN ('active', 'archived')),
    CONSTRAINT chk_project_dates CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
);

CREATE INDEX idx_project_name ON project(name);
CREATE INDEX idx_project_status ON project(status);

-- Task table
CREATE TABLE task (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    task_code VARCHAR(64),
    name VARCHAR(255) NOT NULL,
    assignee VARCHAR(120),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    progress SMALLINT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'planned',
    parent_task_id BIGINT,
    is_milestone BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_task_project FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_parent FOREIGN KEY (parent_task_id) REFERENCES task(id) ON DELETE SET NULL,
    CONSTRAINT chk_task_progress CHECK (progress BETWEEN 0 AND 100),
    CONSTRAINT chk_task_status CHECK (status IN ('planned', 'in_progress', 'done', 'blocked', 'on_hold')),
    CONSTRAINT chk_task_dates CHECK (start_date <= end_date),
    CONSTRAINT uq_task_code UNIQUE (project_id, task_code)
);

CREATE INDEX idx_task_project ON task(project_id);
CREATE INDEX idx_task_parent ON task(parent_task_id);
CREATE INDEX idx_task_dates ON task(start_date, end_date);
CREATE INDEX idx_task_status ON task(status);
CREATE INDEX idx_task_code ON task(task_code);

-- Task dependency table
CREATE TABLE task_dependency (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL,
    predecessor_task_id BIGINT NOT NULL,
    type VARCHAR(8) NOT NULL DEFAULT 'FS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT fk_dependency_task FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE,
    CONSTRAINT fk_dependency_predecessor FOREIGN KEY (predecessor_task_id) REFERENCES task(id) ON DELETE CASCADE,
    CONSTRAINT chk_dependency_type CHECK (type IN ('FS', 'SS', 'FF', 'SF')),
    CONSTRAINT chk_dependency_self CHECK (task_id <> predecessor_task_id),
    CONSTRAINT uq_dependency UNIQUE (task_id, predecessor_task_id)
);

CREATE INDEX idx_dependency_task ON task_dependency(task_id);
CREATE INDEX idx_dependency_predecessor ON task_dependency(predecessor_task_id);

-- Import job table
CREATE TABLE import_job (
    id BIGSERIAL PRIMARY KEY,
    source_type VARCHAR(16) NOT NULL,
    status VARCHAR(16) NOT NULL,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    summary JSONB NOT NULL DEFAULT '{}',
    error_report_path TEXT,
    CONSTRAINT chk_import_source_type CHECK (source_type IN ('CSV', 'EXCEL')),
    CONSTRAINT chk_import_status CHECK (status IN ('PENDING', 'DRY_RUN', 'SUCCESS', 'PARTIAL', 'FAILED'))
);

CREATE INDEX idx_import_job_status ON import_job(status);
CREATE INDEX idx_import_job_executed_at ON import_job(executed_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic updated_at management
CREATE TRIGGER trigger_project_updated_at
    BEFORE UPDATE ON project
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_task_updated_at
    BEFORE UPDATE ON task
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE project IS 'Projects containing tasks';
COMMENT ON TABLE task IS 'Individual tasks within projects';
COMMENT ON TABLE task_dependency IS 'Dependencies between tasks (FS=Finish-Start, SS=Start-Start, FF=Finish-Finish, SF=Start-Finish)';
COMMENT ON TABLE import_job IS 'Import job history for CSV/Excel uploads';

COMMENT ON COLUMN task.task_code IS 'Stable identifier for task, used for imports and updates';
COMMENT ON COLUMN task.progress IS 'Task completion percentage (0-100)';
COMMENT ON COLUMN task.is_milestone IS 'Whether task is a milestone (zero-duration checkpoint)';
COMMENT ON COLUMN import_job.summary IS 'JSON summary of import results (counts, warnings, etc.)';
