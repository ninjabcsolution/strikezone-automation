-- Phase 3 Database Schema (Scoring + Target Approval Portal)

-- Extend look-alike targets for workflow + external integrations
ALTER TABLE IF EXISTS lookalike_targets
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255),
  ADD COLUMN IF NOT EXISTS source_external_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS external_data JSONB,
  ADD COLUMN IF NOT EXISTS segment VARCHAR(50);

-- Treat `status` as the workflow state
-- Draft -> Pending Review -> Approved/Rejected -> (future) Enriching -> Messaged -> Sent
ALTER TABLE lookalike_targets
  ALTER COLUMN status SET DEFAULT 'pending_review';

CREATE INDEX IF NOT EXISTS idx_lookalike_targets_status ON lookalike_targets(status);

-- Dedupe external inserts (Apollo org id)
CREATE UNIQUE INDEX IF NOT EXISTS ux_lookalike_targets_source_external
  ON lookalike_targets (source, source_external_id)
  WHERE source_external_id IS NOT NULL;

-- Approval actions (approve/reject) stored as an explicit event log
CREATE TABLE IF NOT EXISTS target_approvals (
  approval_id SERIAL PRIMARY KEY,
  target_id INTEGER NOT NULL REFERENCES lookalike_targets(target_id) ON DELETE CASCADE,
  actor VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_target_approvals_target ON target_approvals(target_id);
CREATE INDEX IF NOT EXISTS idx_target_approvals_actor ON target_approvals(actor);

-- Generic audit log (edits, generation runs, approvals)
CREATE TABLE IF NOT EXISTS audit_log (
  audit_id SERIAL PRIMARY KEY,
  actor VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
