-- Add notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" varchar(50) NOT NULL, -- 'follow', 'like', 'comment', 'share', etc.
  "sender_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "recipe_id" integer REFERENCES "recipes"("id") ON DELETE SET NULL,
  "message" text NOT NULL,
  "read" boolean NOT NULL DEFAULT false,
  "data" jsonb, -- Additional data specific to notification type
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Add notification preferences table
CREATE TABLE IF NOT EXISTS "notification_preferences" (
  "user_id" integer PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "email_notifications" boolean NOT NULL DEFAULT true,
  "push_notifications" boolean NOT NULL DEFAULT true,
  "sms_notifications" boolean NOT NULL DEFAULT false,
  "follow_notifications" boolean NOT NULL DEFAULT true,
  "like_notifications" boolean NOT NULL DEFAULT true,
  "comment_notifications" boolean NOT NULL DEFAULT true,
  "share_notifications" boolean NOT NULL DEFAULT true,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add user contact information table
CREATE TABLE IF NOT EXISTS "user_contacts" (
  "user_id" integer PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "phone_number" varchar(20),
  "phone_verified" boolean NOT NULL DEFAULT false,
  "email_verified" boolean NOT NULL DEFAULT false,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add shared recipes table
CREATE TABLE IF NOT EXISTS "shared_recipes" (
  "id" serial PRIMARY KEY NOT NULL,
  "recipe_id" integer NOT NULL REFERENCES "recipes"("id") ON DELETE CASCADE,
  "shared_by" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "shared_with" varchar(255) NOT NULL, -- Email or phone number
  "share_type" varchar(20) NOT NULL, -- 'email', 'sms', 'link'
  "share_token" varchar(100), -- For public sharing links
  "message" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "expires_at" timestamp -- NULL means no expiration
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "notifications_read_idx" ON "notifications"("read");
CREATE INDEX IF NOT EXISTS "shared_recipes_recipe_id_idx" ON "shared_recipes"("recipe_id");
CREATE INDEX IF NOT EXISTS "shared_recipes_shared_by_idx" ON "shared_recipes"("shared_by");
CREATE INDEX IF NOT EXISTS "shared_recipes_share_token_idx" ON "shared_recipes"("share_token");
