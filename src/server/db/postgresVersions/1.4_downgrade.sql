ALTER table users
DROP COLUMN templogin;
ALTER table users
ADD passwordconfirmed boolean;
UPDATE VERSION SET version='1.3';