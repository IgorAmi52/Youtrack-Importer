CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY,
  github_repo TEXT NOT NULL,           
  github_issue_id INTEGER NOT NULL,
  youtrack_issue_id TEXT NOT NULL,
  content_hash TEXT,
  last_seen_updated_at TEXT,
  UNIQUE(github_repo, github_issue_id)
);

CREATE TABLE IF NOT EXISTS users_map (
  github_login TEXT PRIMARY KEY,
  youtrack_username TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
