ALTER TABLE user ADD COLUMN beta_key_mode TEXT;
ALTER TABLE account_requests ADD COLUMN beta_api_key TEXT;
ALTER TABLE account_requests ADD COLUMN beta_key_mode TEXT NOT NULL DEFAULT 'trial';
