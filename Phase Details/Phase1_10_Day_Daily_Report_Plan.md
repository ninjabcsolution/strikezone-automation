# Phase 1 — 10-Day Daily Report Plan (Checklist)

**Goal (Phase 1):** Deliver an ERP-neutral ingestion foundation (CSV → validation/QA → PostgreSQL → usable UI) that you can demo, run end-to-end, and hand off.

> Use this file as your *daily standup report*: check items as you complete them.

---

## Day 1 — Kickoff + Environment + Baseline Run
- [ ] Confirm Phase 1 scope + success criteria (what “done” means)
- [ ] Set up prerequisites (Node 18+, PostgreSQL) and verify versions
- [ ] Run the app end-to-end locally (backend + frontend)
- [ ] Create/verify `.env` values (DB creds, ports) and confirm `/api/health`
- [ ] Upload **one** sample CSV and confirm it inserts into DB

## Day 2 — Data Model + CSV Contracts (ERP-Neutral)
- [ ] Review `schema.sql` tables + indexes (customers/orders/order_lines/products/ingestion_logs)
- [ ] Validate primary keys + foreign keys align with real ERP exports (Dynamics 365)
- [ ] Define **CSV contract** for each file (required columns, types, allowed nulls)
- [ ] Create/confirm CSV templates folder + “export instructions” notes
- [ ] Document the mapping assumptions (e.g., revenue vs margin vs cogs)

## Day 3 — Backend Upload Pipeline Hardening
- [ ] Verify upload endpoint behavior for all 4 file types (customers/orders/order_lines/products)
- [ ] Confirm validation failures return useful row-level errors + QA report
- [ ] Add guardrails (recommended): CORS restriction, request limits, basic rate limiting
- [ ] Confirm uploaded files are always cleaned up (success + error paths)
- [ ] Verify ingestion logs are written for both success and validation-failed cases

## Day 4 — Validation Rules + QA Reporting Quality
- [ ] Tighten Joi schemas (dates, numbers, optional fields) to match your real exports
- [ ] Confirm QA report covers missing values + duplicates reliably
- [ ] Add “friendly messages” for common issues (wrong headers, empty file, bad dates)
- [ ] Decide the canonical date format (ISO) and enforce consistently
- [ ] Create a short “How to fix upload errors” guide for yourself/client

## Day 5 — Frontend Upload UI (Usability)
- [ ] Ensure the upload UI supports drag/drop + browse
- [ ] Display: detected file type, rows processed, rows inserted, rows failed
- [ ] Display: validation errors (first 10 + “X more…”) and QA missing-values summary
- [ ] Add “Upload another file” / reset flow
- [ ] Confirm UI works for all 4 CSVs in order (Customers → Products → Orders → OrderLines)

## Day 6 — Frontend Polish + Operator Workflow
- [ ] Add ingestion logs view (latest 50 uploads) and basic filtering by file type/status
- [ ] Add clear “system status” (backend reachable / database ok)
- [ ] Improve UX for large files (loading state + progress indicator)
- [ ] Add download links for CSV templates (optional but helpful)
- [ ] Finalize consistent styling (colors, spacing, typography)

## Day 7 — End-to-End Test Pass (Repeatable)
- [ ] Fresh DB run: re-create schema, then upload all 4 sample CSVs
- [ ] Verify row counts in DB match expected (no silent drops)
- [ ] Negative tests: wrong headers, wrong data types, duplicates, empty file
- [ ] Test a “bigger file” scenario (or duplicate sample rows) for performance
- [ ] Record test evidence (screenshots + commands) for your Phase 1 completion proof

## Day 8 — Operationalization (Runbooks + Setup)
- [ ] Validate `setup.sh` works from scratch (or simulate a clean run)
- [ ] Ensure README has a true “copy/paste” quick start (DB → backend → frontend)
- [ ] Add a “known issues” + “next fixes” section
- [ ] Add a lightweight deployment approach (optional): Docker Compose or simple VM steps
- [ ] Confirm `.gitignore` excludes `node_modules`, `.env`, uploads, and build artifacts

## Day 9 — Client-Ready Demo Package
- [ ] Prepare a demo script (5–10 minutes): upload → validate → QA → DB proof
- [ ] Create 2–3 short demo datasets (good / bad / edge-case)
- [ ] Build a one-page architecture diagram + flow (frontend → backend → DB)
- [ ] Write “Assumptions + constraints” clearly (ERP export constraints, field meanings)
- [ ] Create Phase 1 handoff checklist (what the client must provide next)

## Day 10 — Final QA + Buffer + Signoff Artifacts
- [ ] Fix all high-priority bugs found during demo rehearsal
- [ ] Security sanity pass (CORS, request limits, error sanitization for production)
- [ ] Confirm analytics endpoints work (optional/bonus, if enabled): `/api/analytics/*`
- [ ] Final documentation sweep (README + troubleshooting)
- [ ] Tag Phase 1 complete: deliverables folder + final recap notes

---

## Definition of Done (Phase 1)
- [ ] A new user can run setup and start backend + frontend successfully
- [ ] All 4 CSVs upload successfully and insert into PostgreSQL with logs
- [ ] Validation errors are understandable and actionable
- [ ] QA report highlights missing values/duplicates
- [ ] You have a repeatable demo script and handoff notes

---

If you want, I can also generate a **daily status report template** (Done / Blockers / Risks / Next) for each of the 10 days.
