-- Drill 8 Recovery Template (staging only)
-- Restores backward compatibility for old contract probe.

ALTER TABLE drill8_contract_edge
  ADD COLUMN legacy_title VARCHAR(100) NULL;

UPDATE drill8_contract_edge
SET legacy_title = canonical_title
WHERE legacy_title IS NULL;

-- Old contract probe after recovery (expected PASS):
-- SELECT legacy_title FROM drill8_contract_edge LIMIT 1;

