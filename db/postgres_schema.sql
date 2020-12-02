CREATE TABLE public.dashboard
(
    id integer NOT NULL DEFAULT nextval('dashboard_id_seq'::regclass),
    userid integer,
    dashboardname text COLLATE pg_catalog."default",
    globalstocklist text COLLATE pg_catalog."default",
    widgetlist text COLLATE pg_catalog."default",
    CONSTRAINT dashboard_pkey PRIMARY KEY (id),
    CONSTRAINT dashboardid UNIQUE (userid, dashboardname)
),

CREATE TABLE public.menusetup
(
    id integer NOT NULL DEFAULT nextval('menusetup_id_seq'::regclass),
    userid integer,
    menulist text COLLATE pg_catalog."default",
    defaultmenu text COLLATE pg_catalog."default",
    CONSTRAINT menusetup_pkey PRIMARY KEY (id),
    CONSTRAINT oneperuser UNIQUE (userid)
),

CREATE TABLE public.users
(
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    loginname text COLLATE pg_catalog."default",
    email text COLLATE pg_catalog."default",
    password text COLLATE pg_catalog."default",
    secretquestion text COLLATE pg_catalog."default",
    secretanswer text COLLATE pg_catalog."default",
    apikey text COLLATE pg_catalog."default",
    webhook text COLLATE pg_catalog."default",
    confirmemail text COLLATE pg_catalog."default",
    resetpassword text COLLATE pg_catalog."default",
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



