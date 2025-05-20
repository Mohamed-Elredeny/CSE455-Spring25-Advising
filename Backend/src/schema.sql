CREATE TABLE "django_migrations"
(
    "id"      integer      NOT NULL PRIMARY KEY AUTOINCREMENT,
    "app"     varchar(255) NOT NULL,
    "name"    varchar(255) NOT NULL,
    "applied" datetime     NOT NULL
);

CREATE TABLE sqlite_sequence
(
    name,
    seq
);

CREATE TABLE "django_content_type"
(
    "id"        integer      NOT NULL PRIMARY KEY AUTOINCREMENT,
    "app_label" varchar(100) NOT NULL,
    "model"     varchar(100) NOT NULL
);
-- User Permissions
CREATE TABLE "auth_group_permissions"
(
    "id"            integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "group_id"      integer NOT NULL REFERENCES "auth_group" ("id") DEFERRABLE INITIALLY DEFERRED,
    "permission_id" integer NOT NULL REFERENCES "auth_permission" ("id") DEFERRABLE INITIALLY DEFERRED
);
-- Permissions
CREATE TABLE "auth_permission"
(
    "id"              integer      NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content_type_id" integer      NOT NULL REFERENCES "django_content_type" ("id") DEFERRABLE INITIALLY DEFERRED,
    "codename"        varchar(100) NOT NULL,
    "name"            varchar(255) NOT NULL
);
-- Roles
CREATE TABLE "auth_group"
(
    "id"   integer      NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" varchar(150) NOT NULL UNIQUE
);

CREATE TABLE "authentication_user"
(
    "id"           integer      NOT NULL PRIMARY KEY AUTOINCREMENT,
    "password"     varchar(128) NOT NULL,
    "last_login"   datetime NULL,
    "is_superuser" bool         NOT NULL,
    "first_name"   varchar(150) NOT NULL,
    "last_name"    varchar(150) NOT NULL,
    "is_staff"     bool         NOT NULL,
    "is_active"    bool         NOT NULL,
    "date_joined"  datetime     NOT NULL,
    "email"        varchar(254) NOT NULL UNIQUE,
    "phone_number" varchar(15) NULL,
    "username"     varchar(150) NOT NULL
);
-- User Roles
CREATE TABLE "authentication_user_groups"
(
    "id"       integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id"  bigint  NOT NULL REFERENCES "authentication_user" ("id") DEFERRABLE INITIALLY DEFERRED,
    "group_id" integer NOT NULL REFERENCES "auth_group" ("id") DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE "authentication_user_user_permissions"
(
    "id"            integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id"       bigint  NOT NULL REFERENCES "authentication_user" ("id") DEFERRABLE INITIALLY DEFERRED,
    "permission_id" integer NOT NULL REFERENCES "auth_permission" ("id") DEFERRABLE INITIALLY DEFERRED
);


CREATE TABLE "django_session"
(
    "session_key"  varchar(40) NOT NULL PRIMARY KEY,
    "session_data" text        NOT NULL,
    "expire_date"  datetime    NOT NULL
);

CREATE TABLE "django_site"
(
    "id"     integer      NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name"   varchar(50)  NOT NULL,
    "domain" varchar(100) NOT NULL UNIQUE
);



CREATE TABLE "token_blacklist_blacklistedtoken"
(
    "blacklisted_at" datetime NOT NULL,
    "token_id"       bigint   NOT NULL UNIQUE REFERENCES "token_blacklist_outstandingtoken" ("id") DEFERRABLE INITIALLY DEFERRED,
    "id"             integer  NOT NULL PRIMARY KEY AUTOINCREMENT
);

CREATE TABLE "token_blacklist_outstandingtoken"
(
    "token"      text         NOT NULL,
    "created_at" datetime NULL,
    "expires_at" datetime     NOT NULL,
    "user_id"    bigint NULL REFERENCES "authentication_user" ("id") DEFERRABLE INITIALLY DEFERRED,
    "jti"        varchar(255) NOT NULL UNIQUE,
    "id"         integer      NOT NULL PRIMARY KEY AUTOINCREMENT
);

