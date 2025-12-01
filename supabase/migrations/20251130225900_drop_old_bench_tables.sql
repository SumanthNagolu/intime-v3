/**
 * Drop old bench sales tables before applying new schema
 * Created: 2025-11-30
 */

-- Drop old tables in reverse dependency order
DROP TABLE IF EXISTS bench_submissions CASCADE;
DROP TABLE IF EXISTS hotlists CASCADE;
DROP TABLE IF EXISTS immigration_cases CASCADE;
DROP TABLE IF EXISTS external_jobs CASCADE;
DROP TABLE IF EXISTS job_sources CASCADE;
DROP TABLE IF EXISTS bench_metadata CASCADE;
