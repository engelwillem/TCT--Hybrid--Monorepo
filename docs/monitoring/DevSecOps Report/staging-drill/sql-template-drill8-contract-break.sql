-- Drill 8 Contract-Break Template (staging only)
-- Scope: isolated drill table only

DROP TABLE IF EXISTS drill8_contract_edge;

CREATE TABLE drill8_contract_edge (
  id INT AUTO_INCREMENT PRIMARY KEY,
  legacy_title VARCHAR(100) NOT NULL,
  canonical_title VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO drill8_contract_edge (legacy_title, canonical_title)
VALUES ('legacy-ok', 'legacy-ok');

-- Old contract probe before break (expected PASS):
-- SELECT legacy_title FROM drill8_contract_edge LIMIT 1;

-- Contract-breaking action:
-- ALTER TABLE drill8_contract_edge DROP COLUMN legacy_title;

-- Old contract probe after break / after image rollback (expected FAIL):
-- SELECT legacy_title FROM drill8_contract_edge LIMIT 1;

