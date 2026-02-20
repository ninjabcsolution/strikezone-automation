-- Phase 4A: Contact Enrichment Schema

-- Enrichment runs track batch enrichment jobs
CREATE TABLE IF NOT EXISTS enrichment_runs (
  id SERIAL PRIMARY KEY,
  status VARCHAR(32) DEFAULT 'pending', -- pending, running, completed, failed
  total_contacts INT DEFAULT 0,
  enriched_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enriched contacts from Apollo People API
CREATE TABLE IF NOT EXISTS enriched_contacts (
  id SERIAL PRIMARY KEY,
  enrichment_run_id INT REFERENCES enrichment_runs(id),
  lookalike_company_id INT REFERENCES lookalike_companies(id),
  apollo_id VARCHAR(128),
  first_name VARCHAR(128),
  last_name VARCHAR(128),
  full_name VARCHAR(256),
  email VARCHAR(256),
  email_status VARCHAR(32),
  title VARCHAR(256),
  seniority VARCHAR(64),
  departments TEXT[], -- ARRAY of departments
  linkedin_url VARCHAR(512),
  phone VARCHAR(64),
  company_name VARCHAR(256),
  company_domain VARCHAR(256),
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enriched_contacts_run ON enriched_contacts(enrichment_run_id);
CREATE INDEX IF NOT EXISTS idx_enriched_contacts_company ON enriched_contacts(lookalike_company_id);
CREATE INDEX IF NOT EXISTS idx_enriched_contacts_email ON enriched_contacts(email);
