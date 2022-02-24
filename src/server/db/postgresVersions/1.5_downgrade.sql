CREATE TABLE newEmail
(
    userID integer NOT NULL,
    newEmail text,
    queryString text,
    CONSTRAINT fk_users FOREIGN KEY(userID) REFERENCES users(id)
);

create TABLE test (
    test float
);

UPDATE VERSION SET version='1.4';

