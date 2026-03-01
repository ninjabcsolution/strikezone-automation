--
-- PostgreSQL database dump
--

\restrict FB0h95oLqhEsZRUYbzFFWJgEMWwLHCBGHiuhBVFjRi5o4ZE4epTnhUoxxOu428K

-- Dumped from database version 18.1 (Ubuntu 18.1-1.pgdg24.04+2)
-- Dumped by pg_dump version 18.1 (Ubuntu 18.1-1.pgdg24.04+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_log (
    audit_id integer NOT NULL,
    actor character varying(255),
    action character varying(100) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id integer,
    details jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: audit_log_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_log_audit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_log_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_log_audit_id_seq OWNED BY public.audit_log.audit_id;


--
-- Name: customer_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_metrics (
    customer_id character varying(50) NOT NULL,
    total_revenue numeric(15,2) DEFAULT 0,
    total_gross_margin numeric(15,2) DEFAULT 0,
    gross_margin_percent numeric(8,2) DEFAULT 0,
    order_count integer DEFAULT 0,
    avg_order_value numeric(15,2) DEFAULT 0,
    first_order_date date,
    last_order_date date,
    days_as_customer integer DEFAULT 0,
    order_frequency numeric(10,4) DEFAULT 0,
    active_months integer DEFAULT 0,
    product_categories_count integer DEFAULT 0,
    recency_days integer DEFAULT 0,
    consistency_score numeric(8,2) DEFAULT 0,
    percentile_rank integer,
    is_top_20 boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    revenue_year_1 numeric(15,2) DEFAULT 0,
    revenue_year_2 numeric(15,2) DEFAULT 0,
    revenue_year_3 numeric(15,2) DEFAULT 0,
    margin_year_1 numeric(15,2) DEFAULT 0,
    margin_year_2 numeric(15,2) DEFAULT 0,
    margin_year_3 numeric(15,2) DEFAULT 0,
    cagr_3yr numeric(8,4) DEFAULT NULL::numeric,
    margin_cagr_3yr numeric(8,4) DEFAULT NULL::numeric,
    is_consistent_grower boolean DEFAULT false,
    growth_trend character varying(20) DEFAULT NULL::character varying,
    is_top_20_by_cagr boolean DEFAULT false,
    user_id integer
);


--
-- Name: COLUMN customer_metrics.revenue_year_1; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.customer_metrics.revenue_year_1 IS '3 years ago revenue';


--
-- Name: COLUMN customer_metrics.revenue_year_2; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.customer_metrics.revenue_year_2 IS '2 years ago revenue';


--
-- Name: COLUMN customer_metrics.revenue_year_3; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.customer_metrics.revenue_year_3 IS 'Last year revenue (most recent)';


--
-- Name: COLUMN customer_metrics.cagr_3yr; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.customer_metrics.cagr_3yr IS '3-year compound annual growth rate';


--
-- Name: COLUMN customer_metrics.is_consistent_grower; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.customer_metrics.is_consistent_grower IS 'True if Year3 > Year2 > Year1';


--
-- Name: COLUMN customer_metrics.growth_trend; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.customer_metrics.growth_trend IS 'growing, declining, stable, or new';


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    customer_id character varying(50) NOT NULL,
    customer_name character varying(255) NOT NULL,
    industry character varying(100),
    naics character varying(10),
    city character varying(100),
    state character varying(50),
    country character varying(50),
    employee_count integer,
    annual_revenue numeric(15,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer
);


--
-- Name: enriched_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enriched_contacts (
    id integer NOT NULL,
    enrichment_run_id integer,
    target_id integer,
    apollo_id character varying(128),
    first_name character varying(128),
    last_name character varying(128),
    full_name character varying(256),
    email character varying(256),
    email_status character varying(32),
    title character varying(256),
    seniority character varying(64),
    departments text[],
    linkedin_url character varying(512),
    phone character varying(64),
    company_name character varying(256),
    company_domain character varying(256),
    raw_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: enriched_contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.enriched_contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: enriched_contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.enriched_contacts_id_seq OWNED BY public.enriched_contacts.id;


--
-- Name: enrichment_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enrichment_runs (
    id integer NOT NULL,
    status character varying(32) DEFAULT 'pending'::character varying,
    total_contacts integer DEFAULT 0,
    enriched_count integer DEFAULT 0,
    failed_count integer DEFAULT 0,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: enrichment_runs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.enrichment_runs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: enrichment_runs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.enrichment_runs_id_seq OWNED BY public.enrichment_runs.id;


--
-- Name: generated_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.generated_messages (
    id integer NOT NULL,
    contact_id integer,
    template_id integer,
    message_type character varying(32) NOT NULL,
    subject text,
    body text NOT NULL,
    personalization_data jsonb,
    ai_model character varying(64),
    ai_prompt_used text,
    approval_status character varying(32) DEFAULT 'pending'::character varying,
    approved_by character varying(128),
    approved_at timestamp with time zone,
    rejection_reason text,
    edited_body text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: generated_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.generated_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: generated_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.generated_messages_id_seq OWNED BY public.generated_messages.id;


--
-- Name: icp_traits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.icp_traits (
    trait_id integer NOT NULL,
    trait_category character varying(50),
    trait_name character varying(100),
    trait_value text,
    top20_frequency numeric(5,2),
    others_frequency numeric(5,2),
    lift numeric(10,2),
    importance_score numeric(5,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: icp_traits_trait_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.icp_traits_trait_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: icp_traits_trait_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.icp_traits_trait_id_seq OWNED BY public.icp_traits.trait_id;


--
-- Name: ingestion_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ingestion_logs (
    log_id integer NOT NULL,
    file_type character varying(50) NOT NULL,
    file_name character varying(255) NOT NULL,
    rows_processed integer,
    rows_inserted integer,
    rows_failed integer,
    validation_errors jsonb,
    status character varying(50),
    ingested_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer
);


--
-- Name: ingestion_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ingestion_logs_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ingestion_logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ingestion_logs_log_id_seq OWNED BY public.ingestion_logs.log_id;


--
-- Name: lookalike_companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lookalike_companies (
    id integer NOT NULL,
    company_name character varying(256) NOT NULL,
    domain character varying(256),
    industry character varying(128),
    employee_count integer,
    revenue_range character varying(64),
    location character varying(256),
    icp_score numeric(5,2),
    source character varying(64),
    source_id character varying(128),
    raw_data jsonb,
    status character varying(32) DEFAULT 'pending'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: lookalike_companies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lookalike_companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lookalike_companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lookalike_companies_id_seq OWNED BY public.lookalike_companies.id;


--
-- Name: lookalike_targets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lookalike_targets (
    target_id integer NOT NULL,
    company_name character varying(255),
    domain character varying(255),
    industry character varying(100),
    naics character varying(10),
    city character varying(100),
    state character varying(50),
    country character varying(50),
    employee_count integer,
    annual_revenue numeric(15,2),
    similarity_score numeric(5,2),
    opportunity_score numeric(5,2),
    tier character varying(10),
    reason_codes text[],
    source character varying(50),
    status character varying(50) DEFAULT 'pending_review'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    updated_by character varying(255),
    source_external_id character varying(255),
    external_data jsonb,
    segment character varying(50)
);


--
-- Name: lookalike_targets_target_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lookalike_targets_target_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lookalike_targets_target_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lookalike_targets_target_id_seq OWNED BY public.lookalike_targets.target_id;


--
-- Name: message_generation_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_generation_runs (
    id integer NOT NULL,
    status character varying(32) DEFAULT 'pending'::character varying,
    template_id integer,
    message_type character varying(32) NOT NULL,
    total_contacts integer DEFAULT 0,
    generated_count integer DEFAULT 0,
    failed_count integer DEFAULT 0,
    ai_model character varying(64),
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    error_message text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: message_generation_runs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.message_generation_runs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: message_generation_runs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_generation_runs_id_seq OWNED BY public.message_generation_runs.id;


--
-- Name: message_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_templates (
    id integer NOT NULL,
    name character varying(128) NOT NULL,
    type character varying(32) NOT NULL,
    subject_template text,
    body_template text NOT NULL,
    tone character varying(32) DEFAULT 'professional'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: message_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.message_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: message_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_templates_id_seq OWNED BY public.message_templates.id;


--
-- Name: order_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_lines (
    order_line_id character varying(50) NOT NULL,
    order_id character varying(50) NOT NULL,
    customer_id character varying(50) NOT NULL,
    order_date date NOT NULL,
    product_id character varying(50),
    product_category character varying(100),
    quantity integer,
    line_revenue numeric(15,2),
    line_cogs numeric(15,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    order_id character varying(50) NOT NULL,
    order_date date NOT NULL,
    customer_id character varying(50) NOT NULL,
    order_revenue numeric(15,2) NOT NULL,
    order_cogs numeric(15,2),
    gross_margin numeric(15,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    product_id character varying(50) NOT NULL,
    product_name character varying(255) NOT NULL,
    product_category character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer
);


--
-- Name: target_approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.target_approvals (
    approval_id integer NOT NULL,
    target_id integer NOT NULL,
    actor character varying(255) NOT NULL,
    action character varying(50) NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: target_approvals_approval_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.target_approvals_approval_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: target_approvals_approval_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.target_approvals_approval_id_seq OWNED BY public.target_approvals.approval_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    company_name character varying(255),
    role character varying(50) DEFAULT 'user'::character varying,
    status character varying(50) DEFAULT 'pending'::character varying,
    reset_token character varying(255),
    reset_token_expires timestamp without time zone,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'user'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'active'::character varying, 'suspended'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: audit_log audit_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN audit_id SET DEFAULT nextval('public.audit_log_audit_id_seq'::regclass);


--
-- Name: enriched_contacts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enriched_contacts ALTER COLUMN id SET DEFAULT nextval('public.enriched_contacts_id_seq'::regclass);


--
-- Name: enrichment_runs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrichment_runs ALTER COLUMN id SET DEFAULT nextval('public.enrichment_runs_id_seq'::regclass);


--
-- Name: generated_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_messages ALTER COLUMN id SET DEFAULT nextval('public.generated_messages_id_seq'::regclass);


--
-- Name: icp_traits trait_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.icp_traits ALTER COLUMN trait_id SET DEFAULT nextval('public.icp_traits_trait_id_seq'::regclass);


--
-- Name: ingestion_logs log_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingestion_logs ALTER COLUMN log_id SET DEFAULT nextval('public.ingestion_logs_log_id_seq'::regclass);


--
-- Name: lookalike_companies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lookalike_companies ALTER COLUMN id SET DEFAULT nextval('public.lookalike_companies_id_seq'::regclass);


--
-- Name: lookalike_targets target_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lookalike_targets ALTER COLUMN target_id SET DEFAULT nextval('public.lookalike_targets_target_id_seq'::regclass);


--
-- Name: message_generation_runs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_generation_runs ALTER COLUMN id SET DEFAULT nextval('public.message_generation_runs_id_seq'::regclass);


--
-- Name: message_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_templates ALTER COLUMN id SET DEFAULT nextval('public.message_templates_id_seq'::regclass);


--
-- Name: target_approvals approval_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.target_approvals ALTER COLUMN approval_id SET DEFAULT nextval('public.target_approvals_approval_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (audit_id);


--
-- Name: customer_metrics customer_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_metrics
    ADD CONSTRAINT customer_metrics_pkey PRIMARY KEY (customer_id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (customer_id);


--
-- Name: enriched_contacts enriched_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enriched_contacts
    ADD CONSTRAINT enriched_contacts_pkey PRIMARY KEY (id);


--
-- Name: enrichment_runs enrichment_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrichment_runs
    ADD CONSTRAINT enrichment_runs_pkey PRIMARY KEY (id);


--
-- Name: generated_messages generated_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_messages
    ADD CONSTRAINT generated_messages_pkey PRIMARY KEY (id);


--
-- Name: icp_traits icp_traits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.icp_traits
    ADD CONSTRAINT icp_traits_pkey PRIMARY KEY (trait_id);


--
-- Name: ingestion_logs ingestion_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingestion_logs
    ADD CONSTRAINT ingestion_logs_pkey PRIMARY KEY (log_id);


--
-- Name: lookalike_companies lookalike_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lookalike_companies
    ADD CONSTRAINT lookalike_companies_pkey PRIMARY KEY (id);


--
-- Name: lookalike_targets lookalike_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lookalike_targets
    ADD CONSTRAINT lookalike_targets_pkey PRIMARY KEY (target_id);


--
-- Name: message_generation_runs message_generation_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_generation_runs
    ADD CONSTRAINT message_generation_runs_pkey PRIMARY KEY (id);


--
-- Name: message_templates message_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_templates
    ADD CONSTRAINT message_templates_pkey PRIMARY KEY (id);


--
-- Name: order_lines order_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_lines
    ADD CONSTRAINT order_lines_pkey PRIMARY KEY (order_line_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- Name: target_approvals target_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.target_approvals
    ADD CONSTRAINT target_approvals_pkey PRIMARY KEY (approval_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: idx_audit_log_actor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_log_actor ON public.audit_log USING btree (actor);


--
-- Name: idx_audit_log_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_log_created_at ON public.audit_log USING btree (created_at);


--
-- Name: idx_audit_log_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_log_entity ON public.audit_log USING btree (entity_type, entity_id);


--
-- Name: idx_customer_metrics_cagr; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_cagr ON public.customer_metrics USING btree (cagr_3yr DESC NULLS LAST);


--
-- Name: idx_customer_metrics_cagr_top20; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_cagr_top20 ON public.customer_metrics USING btree (is_top_20_by_cagr);


--
-- Name: idx_customer_metrics_margin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_margin ON public.customer_metrics USING btree (total_gross_margin DESC);


--
-- Name: idx_customer_metrics_percentile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_percentile ON public.customer_metrics USING btree (percentile_rank);


--
-- Name: idx_customer_metrics_revenue; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_revenue ON public.customer_metrics USING btree (total_revenue DESC);


--
-- Name: idx_customer_metrics_top20; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_top20 ON public.customer_metrics USING btree (is_top_20);


--
-- Name: idx_customer_metrics_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_metrics_user ON public.customer_metrics USING btree (user_id);


--
-- Name: idx_customers_industry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_industry ON public.customers USING btree (industry);


--
-- Name: idx_customers_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_state ON public.customers USING btree (state);


--
-- Name: idx_customers_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_user ON public.customers USING btree (user_id);


--
-- Name: idx_enriched_contacts_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enriched_contacts_company ON public.enriched_contacts USING btree (target_id);


--
-- Name: idx_enriched_contacts_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enriched_contacts_email ON public.enriched_contacts USING btree (email);


--
-- Name: idx_enriched_contacts_run; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enriched_contacts_run ON public.enriched_contacts USING btree (enrichment_run_id);


--
-- Name: idx_generated_messages_contact; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_generated_messages_contact ON public.generated_messages USING btree (contact_id);


--
-- Name: idx_generated_messages_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_generated_messages_status ON public.generated_messages USING btree (approval_status);


--
-- Name: idx_generated_messages_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_generated_messages_type ON public.generated_messages USING btree (message_type);


--
-- Name: idx_icp_traits_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_icp_traits_category ON public.icp_traits USING btree (trait_category);


--
-- Name: idx_icp_traits_importance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_icp_traits_importance ON public.icp_traits USING btree (importance_score DESC);


--
-- Name: idx_ingestion_logs_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ingestion_logs_date ON public.ingestion_logs USING btree (ingested_at);


--
-- Name: idx_ingestion_logs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ingestion_logs_status ON public.ingestion_logs USING btree (status);


--
-- Name: idx_ingestion_logs_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ingestion_logs_user ON public.ingestion_logs USING btree (user_id);


--
-- Name: idx_lookalike_companies_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lookalike_companies_domain ON public.lookalike_companies USING btree (domain);


--
-- Name: idx_lookalike_companies_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lookalike_companies_status ON public.lookalike_companies USING btree (status);


--
-- Name: idx_lookalike_targets_score; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lookalike_targets_score ON public.lookalike_targets USING btree (similarity_score DESC);


--
-- Name: idx_lookalike_targets_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lookalike_targets_status ON public.lookalike_targets USING btree (status);


--
-- Name: idx_lookalike_targets_tier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lookalike_targets_tier ON public.lookalike_targets USING btree (tier);


--
-- Name: idx_message_generation_runs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_generation_runs_status ON public.message_generation_runs USING btree (status);


--
-- Name: idx_order_lines_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_lines_order ON public.order_lines USING btree (order_id);


--
-- Name: idx_order_lines_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_lines_product ON public.order_lines USING btree (product_id);


--
-- Name: idx_order_lines_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_lines_user ON public.order_lines USING btree (user_id);


--
-- Name: idx_orders_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_customer ON public.orders USING btree (customer_id);


--
-- Name: idx_orders_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_date ON public.orders USING btree (order_date);


--
-- Name: idx_orders_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_user ON public.orders USING btree (user_id);


--
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category ON public.products USING btree (product_category);


--
-- Name: idx_products_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_user ON public.products USING btree (user_id);


--
-- Name: idx_target_approvals_actor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_target_approvals_actor ON public.target_approvals USING btree (actor);


--
-- Name: idx_target_approvals_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_target_approvals_target ON public.target_approvals USING btree (target_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- Name: ux_lookalike_targets_source_external; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ux_lookalike_targets_source_external ON public.lookalike_targets USING btree (source, source_external_id) WHERE (source_external_id IS NOT NULL);


--
-- Name: customer_metrics customer_metrics_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_metrics
    ADD CONSTRAINT customer_metrics_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: customer_metrics customer_metrics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_metrics
    ADD CONSTRAINT customer_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: customers customers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: enriched_contacts enriched_contacts_enrichment_run_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enriched_contacts
    ADD CONSTRAINT enriched_contacts_enrichment_run_id_fkey FOREIGN KEY (enrichment_run_id) REFERENCES public.enrichment_runs(id);


--
-- Name: orders fk_customer; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: order_lines fk_customer_line; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_lines
    ADD CONSTRAINT fk_customer_line FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: order_lines fk_order; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_lines
    ADD CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- Name: generated_messages generated_messages_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_messages
    ADD CONSTRAINT generated_messages_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.enriched_contacts(id);


--
-- Name: generated_messages generated_messages_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generated_messages
    ADD CONSTRAINT generated_messages_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.message_templates(id);


--
-- Name: ingestion_logs ingestion_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingestion_logs
    ADD CONSTRAINT ingestion_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: message_generation_runs message_generation_runs_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_generation_runs
    ADD CONSTRAINT message_generation_runs_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.message_templates(id);


--
-- Name: order_lines order_lines_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_lines
    ADD CONSTRAINT order_lines_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: order_lines order_lines_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_lines
    ADD CONSTRAINT order_lines_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- Name: order_lines order_lines_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_lines
    ADD CONSTRAINT order_lines_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id);


--
-- Name: order_lines order_lines_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_lines
    ADD CONSTRAINT order_lines_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: products products_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: target_approvals target_approvals_target_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.target_approvals
    ADD CONSTRAINT target_approvals_target_id_fkey FOREIGN KEY (target_id) REFERENCES public.lookalike_targets(target_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict FB0h95oLqhEsZRUYbzFFWJgEMWwLHCBGHiuhBVFjRi5o4ZE4epTnhUoxxOu428K

