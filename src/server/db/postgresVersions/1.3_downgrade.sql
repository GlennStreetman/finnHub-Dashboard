ALTER TABLE users 
ADD secretquestion text;
ALTER TABLE users
ADD  secretanswer text;
ALTER TABLE users
ADD  loginname text;
UPDATE VERSION SET version='1.3';