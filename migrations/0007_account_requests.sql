CREATE TABLE "account_requests" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "token" text NOT NULL UNIQUE,
  "status" text NOT NULL DEFAULT 'pending',
  "created_at" integer NOT NULL
);
