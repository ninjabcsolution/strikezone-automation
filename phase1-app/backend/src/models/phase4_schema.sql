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

-- =====================================================
-- Phase 4B: AI Messaging Generation & Approval Portal
-- =====================================================

-- Message templates for different outreach types
CREATE TABLE IF NOT EXISTS message_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  type VARCHAR(32) NOT NULL, -- email, linkedin, call_script
  subject_template TEXT, -- for emails
  body_template TEXT NOT NULL, -- with {{placeholders}}
  tone VARCHAR(32) DEFAULT 'professional', -- professional, friendly, formal, casual
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated messages for contacts (AI-powered)
CREATE TABLE IF NOT EXISTS generated_messages (
  id SERIAL PRIMARY KEY,
  contact_id INT REFERENCES enriched_contacts(id),
  template_id INT REFERENCES message_templates(id),
  message_type VARCHAR(32) NOT NULL, -- email, linkedin, call_script
  subject TEXT,
  body TEXT NOT NULL,
  personalization_data JSONB, -- data used for personalization
  ai_model VARCHAR(64), -- gpt-4, gpt-3.5-turbo, etc.
  ai_prompt_used TEXT, -- the actual prompt sent to AI
  approval_status VARCHAR(32) DEFAULT 'pending', -- pending, approved, rejected, edited
  approved_by VARCHAR(128),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  edited_body TEXT, -- if edited before approval
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message generation runs (batch generation tracking)
CREATE TABLE IF NOT EXISTS message_generation_runs (
  id SERIAL PRIMARY KEY,
  status VARCHAR(32) DEFAULT 'pending', -- pending, running, completed, failed
  template_id INT REFERENCES message_templates(id),
  message_type VARCHAR(32) NOT NULL,
  total_contacts INT DEFAULT 0,
  generated_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  ai_model VARCHAR(64),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for messaging tables
CREATE INDEX IF NOT EXISTS idx_generated_messages_contact ON generated_messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_generated_messages_status ON generated_messages(approval_status);
CREATE INDEX IF NOT EXISTS idx_generated_messages_type ON generated_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_message_generation_runs_status ON message_generation_runs(status);

-- Insert default message templates
INSERT INTO message_templates (name, type, subject_template, body_template, tone) VALUES
('Initial Outreach Email', 'email', 
 'Quick question about {{company_name}}''s {{industry}} operations',
 'Hi {{first_name}},

I noticed {{company_name}} is doing impressive work in the {{industry}} space. Given your role as {{title}}, I thought you might be interested in how we''ve helped similar companies streamline their operations.

Would you be open to a brief 15-minute call to explore if there''s a fit?

Best regards',
 'professional'),

('LinkedIn Connection Request', 'linkedin', 
 NULL,
 'Hi {{first_name}}, I came across your profile and was impressed by your work at {{company_name}}. I''d love to connect and share some insights about {{industry}} trends that might be valuable for your team.',
 'friendly'),

('Follow-up Email', 'email',
 'Following up: {{company_name}} + our solution',
 'Hi {{first_name}},

I wanted to follow up on my previous message. I understand you''re busy, but I believe we could provide significant value to {{company_name}} based on what we''ve done for other {{industry}} companies.

Would next week work for a quick call?

Best regards',
 'professional'),

('Cold Call Script', 'call_script',
 NULL,
 'Introduction: "Hi {{first_name}}, this is [Your Name] from [Company]. I''m reaching out because I noticed {{company_name}} has been growing in the {{industry}} space."

Value Prop: "We''ve helped companies like yours achieve [specific result]. Given your role as {{title}}, I thought this might be relevant."

Ask: "Do you have 2 minutes to hear how we might help {{company_name}}?"

Objection Handling: [Prepare responses based on common objections]',
 'professional')
ON CONFLICT DO NOTHING;
