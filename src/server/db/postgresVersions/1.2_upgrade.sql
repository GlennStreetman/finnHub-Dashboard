ALTER TABLE users 
DROP COLUMN secretquestion;
ALTER TABLE users
DROP COLUMN secretanswer;
ALTER TABLE users
DROP COLUMN loginname;
UPDATE VERSION SET version='1.3';