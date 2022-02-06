ALTER table users
add templogin bigint;
ALTER TABLE users
DROP COLUMN passwordconfirmed;
UPDATE VERSION SET version='1.4';