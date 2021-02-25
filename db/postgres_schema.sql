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
);

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
    CONSTRAINT fk_dashboard FOREIGN KEY(dashboardkey) REFERENCES dashboard(id) ON DELETE CASCADE,
    CONSTRAINT widgetsid UNIQUE (dashboardkey, widgetid)
);

CREATE TABLE menusetup
(
    id serial NOT NULL,
    userid integer,
    -- menulist text,
    defaultmenu text,
    CONSTRAINT menusetup_pkey PRIMARY KEY (id),
    CONSTRAINT oneperuser UNIQUE (userid)
    --userid should be foreign key
);

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
);

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
    confirmemaillink text,
    emailconfirmed Boolean DEFAULT false,
    resetpasswordlink text,
    passwordconfirmed Boolean DEFAULT false,
    exchangelist text,
    defaultexchange text,
    ratelimit int,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_login_key UNIQUE (loginname),
    CONSTRAINT users_email_key UNIQUE (email)
);

CREATE TABLE newEmail
(
    userID integer NOT NULL,
    newEmail text,
    queryString text,
    CONSTRAINT fk_users FOREIGN KEY(userID) REFERENCES users(id)
);

CREATE TABLE uierror
(
    eid serial NOT NULL,
    errormessage text,
    widget text,
    lastoccured date,
    errorcount integer,
    CONSTRAINT uierror_pkey PRIMARY KEY (eid),
    CONSTRAINT uniqueerror UNIQUE (errormessage, widget)
);



