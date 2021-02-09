//serial for auto increment

CREATE TABLE dashboard
(
    id serial NOT NULL,
    userid integer,
    dashboardname text,
    globalstocklist text,
    widgetlist text,
    CONSTRAINT dashboard_pkey PRIMARY KEY (id),
    CONSTRAINT dashboardid UNIQUE (userid, dashboardname)
),

CREATE TABLE menusetup
(
    id serial NOT NULL,
    userid integer,
    menulist text,
    defaultmenu text,
    CONSTRAINT menusetup_pkey PRIMARY KEY (id),
    CONSTRAINT oneperuser UNIQUE (userid)
),

CREATE TABLE users
(
    id serial NOT NULL,
    loginname text,
    email text,
    password text,
    secretquestion text,
    secretanswer text,
    apikey text,
    webhook text,
    confirmemail text,
    resetpassword text,
    exchangelist text,
    defaultexchange text,
    ratelimit int,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_loginname_key UNIQUE (loginname)
),

CREATE TABLE public.newEmail
(
    userID integer NOT NULL,
    newEmail text,
    queryString text,
    CONSTRAINT fk_users FOREIGN KEY(userID) REFERENCES users(id)
)



