--NOT YET ROLLED OUT TO LIVE

ALTER TABLE dashboard
  DROP COLUMN widgetlist;
  
ALTER TABLE menusetup
  DROP COLUMN menulist;

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

confirmemaillink text,
emailconfirmed Boolean,
resetpasswordlink text,
passwordconfirmed Boolean,

Alter table users
RENAME COLUMN confirmemail to confirmemaillink,
RENAME COLUMN resetpassword to resetpasswordlink,
ADD COLUMN emailconfirmed Boolean DEFAULT false,
ADD COLUMN passwordconfirmed Boolean DEFAULT false

alter table widgets
ADD COLUMN config text

alter table users
ADD Column apialias text UNIQUE

alter table users
ADD column widgetsetup text

-- NOT YET IMPLEMENTED ON LIVE

Alter table widgets
ADD Column showBody Boolean DEFAULT true