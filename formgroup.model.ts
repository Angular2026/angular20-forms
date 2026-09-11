-- sur ta base locale, connexion own_crf_back@crf
DELETE FROM flyway_schema_history WHERE version = '1.0.218';
ALTER TABLE currency DROP COLUMN IF EXISTS defaulting_clients;
ALTER TABLE defaulting_clients DROP COLUMN IF EXISTS defaulting_clients;
