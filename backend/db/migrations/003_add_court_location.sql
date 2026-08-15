-- ─── COURT LOCATION ──────────────────────────────────────────────────────────

ALTER TABLE courts
  ADD COLUMN address    TEXT,
  ADD COLUMN map_url    VARCHAR,
  ADD COLUMN created_by UUID REFERENCES coaches(user_id) ON DELETE SET NULL;