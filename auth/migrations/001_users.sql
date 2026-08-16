CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'merchant' CHECK (role IN ('user','merchant','operator','manager','tenant_admin','analyst','admin','owner','founder','founder_admin','founder_master','customer')),
  founder BOOLEAN NOT NULL DEFAULT FALSE,
  refresh_token_hash TEXT NOT NULL DEFAULT '',
  refresh_token_id TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);