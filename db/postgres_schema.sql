//serial for auto increment

CREATE TABLE dashboard
(
    id serial NOT NULL,
    userid integer,
    dashboardname text,
    globalstocklist text, --serialized data
    -- widgetlist text,
    CONSTRAINT dashboard_pkey PRIMARY KEY (id),
    CONSTRAINT dashboardid UNIQUE (userid, dashboardname)
    --userid should be foreign key
),

CREATE TABLE widgets
(
    wid serial NOT NULL,
    dashboardkey integer NOT NULL,
    columnid integer NOT NULL,
    columnorder integer NOT NULL,
    filters text, --serialized data
    trackedstocks text, --serialized data
    widgetconfig text,
    widgetheader text,
    widgetid text,
    widgettype text,
    xaxis text,
    yaxis text,
    CONSTRAINT widgets_pkey PRIMARY KEY (wid),
    CONSTRAINT fk_dashboard FOREIGN KEY(dashboardkey) REFERENCES dashboard(id),
    CONSTRAINT widgetsid UNIQUE (dashboardkey, widgetid)
),

CREATE TABLE menusetup
(
    id serial NOT NULL,
    userid integer,
    -- menulist text,
    defaultmenu text,
    CONSTRAINT menusetup_pkey PRIMARY KEY (id),
    CONSTRAINT oneperuser UNIQUE (userid)
    --userid should be foreign key
),

CREATE TABLE menus
(
    mid serial NOT NULL,
    menukey integer NOT NULL,
    columnid integer NOT NULL,
    columnorder integer NOT NULL,
    widgetconfig text,
    widgetheader text,
    widgetid text,
    widgettype text,
    xaxis text,
    yaxis text,
    CONSTRAINT menus_pkey PRIMARY KEY (mid),
    CONSTRAINT fk_menusetup FOREIGN KEY(menukey) REFERENCES menusetup(id),
    CONSTRAINT menusid UNIQUE (menukey, widgetid)
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



