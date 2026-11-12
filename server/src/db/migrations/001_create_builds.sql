CREATE TABLE IF NOT EXISTS builds (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  champion_id TEXT NOT NULL,
  primary_path TEXT NOT NULL,
  keystone TEXT NOT NULL,
  primary_runes TEXT[] NOT NULL CHECK (cardinality(primary_runes) = 3),
  secondary_path TEXT NOT NULL,
  secondary_runes TEXT[] NOT NULL CHECK (cardinality(secondary_runes) = 2),
  shards TEXT[] NOT NULL CHECK (cardinality(shards) = 3),
  lane TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS builds_created_at_desc_idx ON builds (created_at DESC);
