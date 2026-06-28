


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."cleanliness_level" AS ENUM (
    'very_tidy',
    'tidy',
    'relaxed',
    'messy'
);


ALTER TYPE "public"."cleanliness_level" OWNER TO "postgres";


CREATE TYPE "public"."connection_status" AS ENUM (
    'PENDING_PAYMENT',
    'PAID',
    'ACTIVE',
    'DECLINED',
    'EXPIRED',
    'CANCELLED'
);


ALTER TYPE "public"."connection_status" OWNER TO "postgres";


CREATE TYPE "public"."gender_type" AS ENUM (
    'male',
    'female',
    'non_binary',
    'prefer_not_to_say'
);


ALTER TYPE "public"."gender_type" OWNER TO "postgres";


CREATE TYPE "public"."message_type" AS ENUM (
    'text',
    'image',
    'system',
    'agreement_request',
    'agreement_confirmed',
    'agreement_declined',
    'bill_split'
);


ALTER TYPE "public"."message_type" OWNER TO "postgres";


CREATE TYPE "public"."noise_preference" AS ENUM (
    'very_quiet',
    'quiet',
    'moderate',
    'lively'
);


ALTER TYPE "public"."noise_preference" OWNER TO "postgres";


CREATE TYPE "public"."payment_status" AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED',
    'ABANDONED'
);


ALTER TYPE "public"."payment_status" OWNER TO "postgres";


CREATE TYPE "public"."platform_status" AS ENUM (
    'PENDING_REVIEW',
    'ACTIVE',
    'SUSPENDED',
    'REJECTED'
);


ALTER TYPE "public"."platform_status" OWNER TO "postgres";


CREATE TYPE "public"."sleep_schedule" AS ENUM (
    'early_bird',
    'night_owl',
    'flexible'
);


ALTER TYPE "public"."sleep_schedule" OWNER TO "postgres";


CREATE TYPE "public"."verification_status" AS ENUM (
    'UNVERIFIED',
    'PENDING',
    'VERIFIED',
    'REJECTED'
);


ALTER TYPE "public"."verification_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."dec_post_likes_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."dec_post_likes_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Skip profile creation for non-student accounts
  IF NEW.raw_user_meta_data->>'user_type' IN ('provider', 'admin') THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."inc_post_comments_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."inc_post_comments_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."inc_post_likes_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."inc_post_likes_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_on_new_message"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_other_user_id UUID;
  v_sender_name   TEXT;
  v_body          TEXT;
  v_conn          RECORD;
BEGIN
  -- Only notify for human messages
  IF NEW.message_type NOT IN ('text', 'image') THEN
    RETURN NEW;
  END IF;

  SELECT requester_id, receiver_id
  INTO v_conn
  FROM public.connections
  WHERE id = NEW.connection_id;

  IF NOT FOUND THEN RETURN NEW; END IF;

  v_other_user_id := CASE
    WHEN v_conn.requester_id = NEW.sender_id THEN v_conn.receiver_id
    ELSE v_conn.requester_id
  END;

  SELECT display_name INTO v_sender_name
  FROM public.profiles WHERE id = NEW.sender_id;

  v_body := CASE
    WHEN NEW.message_type = 'image' THEN 'Sent a photo'
    ELSE left(NEW.content, 120)
  END;

  -- Upsert: one pending NEW_MESSAGE notification per connection per recipient.
  -- If one already exists (read_at IS NULL), update the body + timestamp
  -- so only the latest message is shown, not a flood.
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    v_other_user_id,
    'NEW_MESSAGE',
    v_sender_name,
    v_body,
    json_build_object('connection_id', NEW.connection_id)::jsonb
  )
  ON CONFLICT DO NOTHING;

  -- Update any existing unread NEW_MESSAGE for this connection so it stays fresh
  UPDATE public.notifications
  SET title   = v_sender_name,
      body    = v_body,
      data    = json_build_object('connection_id', NEW.connection_id)::jsonb,
      created_at = NOW()
  WHERE user_id  = v_other_user_id
    AND type     = 'NEW_MESSAGE'
    AND data->>'connection_id' = NEW.connection_id::TEXT
    AND read_at IS NULL;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_on_new_message"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'super_admin'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bill_split_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "split_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "description" "text",
    "amount" integer NOT NULL,
    "is_paid" boolean DEFAULT false,
    "paid_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "proof_url" "text",
    "amount_paid" integer,
    "payment_status" "text" DEFAULT 'unpaid'::"text",
    CONSTRAINT "bill_split_items_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['unpaid'::"text", 'partial'::"text", 'full'::"text"])))
);


ALTER TABLE "public"."bill_split_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bill_splits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "connection_id" "uuid" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "total_amount" integer NOT NULL,
    "currency" "text" DEFAULT 'NGN'::"text",
    "is_settled" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bill_splits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blocks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "blocker_id" "uuid" NOT NULL,
    "blocked_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."blocks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."connections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "requester_id" "uuid" NOT NULL,
    "receiver_id" "uuid" NOT NULL,
    "status" "public"."connection_status" DEFAULT 'PENDING_PAYMENT'::"public"."connection_status" NOT NULL,
    "payment_reference" "text",
    "amount_paid" integer,
    "paid_at" timestamp with time zone,
    "connected_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "no_self_connection" CHECK (("requester_id" <> "receiver_id"))
);


ALTER TABLE "public"."connections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."housing_listings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "platform_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "address" "text" NOT NULL,
    "city" "text" NOT NULL,
    "state" "text",
    "price_per_month" integer NOT NULL,
    "property_type" "text" DEFAULT 'room'::"text" NOT NULL,
    "bedrooms" integer DEFAULT 1 NOT NULL,
    "bathrooms" integer DEFAULT 1 NOT NULL,
    "amenities" "text"[] DEFAULT '{}'::"text"[],
    "images" "text"[] DEFAULT '{}'::"text"[],
    "campus_tags" "text"[] DEFAULT '{}'::"text"[],
    "contact_phone" "text",
    "contact_whatsapp" "text",
    "is_available" boolean DEFAULT true NOT NULL,
    "status" "text" DEFAULT 'published'::"text" NOT NULL,
    "total_views" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."housing_listings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."housing_platforms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "url" "text" NOT NULL,
    "logo_url" "text",
    "cities" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "campus_tags" "text"[] DEFAULT '{}'::"text"[],
    "contact_name" "text",
    "contact_email" "text" NOT NULL,
    "contact_phone" "text",
    "status" "public"."platform_status" DEFAULT 'PENDING_REVIEW'::"public"."platform_status",
    "is_featured" boolean DEFAULT false,
    "registered_by" "uuid",
    "total_clicks" integer DEFAULT 0,
    "total_referrals" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."housing_platforms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "connection_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "message_type" "public"."message_type" DEFAULT 'text'::"public"."message_type",
    "image_url" "text",
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text",
    "data" "jsonb" DEFAULT '{}'::"jsonb",
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "connection_id" "uuid",
    "reference" "text" NOT NULL,
    "amount" integer NOT NULL,
    "status" "public"."payment_status" DEFAULT 'PENDING'::"public"."payment_status",
    "payment_channel" "text",
    "gateway_response" "text",
    "paid_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."platform_clicks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "platform_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "connection_id" "uuid",
    "clicked_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."platform_clicks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "post_comments_content_check" CHECK ((("char_length"("content") >= 1) AND ("char_length"("content") <= 300)))
);


ALTER TABLE "public"."post_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."post_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "city" "text",
    "budget_min" integer,
    "budget_max" integer,
    "move_in_date" "date",
    "likes_count" integer DEFAULT 0,
    "comments_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "posts_content_check" CHECK ((("char_length"("content") >= 1) AND ("char_length"("content") <= 500)))
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "display_name" "text" DEFAULT ''::"text" NOT NULL,
    "avatar_url" "text",
    "bio" "text",
    "age" smallint,
    "gender" "public"."gender_type",
    "phone" "text",
    "city" "text",
    "state" "text",
    "university" "text",
    "faculty" "text",
    "course" "text",
    "year_of_study" smallint,
    "min_budget" integer,
    "max_budget" integer,
    "move_in_date" "date",
    "lifestyle_tags" "text"[] DEFAULT '{}'::"text"[],
    "sleep_schedule" "public"."sleep_schedule" DEFAULT 'flexible'::"public"."sleep_schedule",
    "cleanliness" "public"."cleanliness_level" DEFAULT 'tidy'::"public"."cleanliness_level",
    "noise_pref" "public"."noise_preference" DEFAULT 'moderate'::"public"."noise_preference",
    "allows_smoking" boolean DEFAULT false,
    "allows_pets" boolean DEFAULT false,
    "allows_guests" boolean DEFAULT true,
    "roommate_gender_pref" "public"."gender_type",
    "student_verified" boolean DEFAULT false,
    "student_id_front_url" "text",
    "student_id_back_url" "text",
    "verification_status" "public"."verification_status" DEFAULT 'UNVERIFIED'::"public"."verification_status",
    "verified_at" timestamp with time zone,
    "onboarding_step" smallint DEFAULT 0,
    "onboarding_complete" boolean DEFAULT false,
    "last_seen_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_age_check" CHECK ((("age" >= 16) AND ("age" <= 35))),
    CONSTRAINT "profiles_year_of_study_check" CHECK ((("year_of_study" >= 1) AND ("year_of_study" <= 7)))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."push_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "endpoint" "text" NOT NULL,
    "p256dh" "text" NOT NULL,
    "auth" "text" NOT NULL,
    "expiration_time" bigint,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."push_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roommate_agreements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "connection_id" "uuid" NOT NULL,
    "initiator_id" "uuid" NOT NULL,
    "acceptor_id" "uuid",
    "status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "payment_reference" "text",
    "payment_channel" "text",
    "amount" integer DEFAULT 200000,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "accepted_at" timestamp with time zone,
    "paid_at" timestamp with time zone,
    CONSTRAINT "initiator_not_acceptor" CHECK (("initiator_id" <> "acceptor_id")),
    CONSTRAINT "roommate_agreements_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'CONFIRMED'::"text", 'DECLINED'::"text"])))
);


ALTER TABLE "public"."roommate_agreements" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bill_split_items"
    ADD CONSTRAINT "bill_split_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bill_splits"
    ADD CONSTRAINT "bill_splits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blocks"
    ADD CONSTRAINT "blocks_blocker_id_blocked_id_key" UNIQUE ("blocker_id", "blocked_id");



ALTER TABLE ONLY "public"."blocks"
    ADD CONSTRAINT "blocks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."connections"
    ADD CONSTRAINT "connections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."housing_listings"
    ADD CONSTRAINT "housing_listings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."housing_platforms"
    ADD CONSTRAINT "housing_platforms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_reference_key" UNIQUE ("reference");



ALTER TABLE ONLY "public"."platform_clicks"
    ADD CONSTRAINT "platform_clicks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_comments"
    ADD CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_post_id_user_id_key" UNIQUE ("post_id", "user_id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_endpoint_key" UNIQUE ("endpoint");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roommate_agreements"
    ADD CONSTRAINT "roommate_agreements_connection_id_key" UNIQUE ("connection_id");



ALTER TABLE ONLY "public"."roommate_agreements"
    ADD CONSTRAINT "roommate_agreements_payment_reference_key" UNIQUE ("payment_reference");



ALTER TABLE ONLY "public"."roommate_agreements"
    ADD CONSTRAINT "roommate_agreements_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_agreements_connection" ON "public"."roommate_agreements" USING "btree" ("connection_id");



CREATE INDEX "idx_agreements_status" ON "public"."roommate_agreements" USING "btree" ("status");



CREATE INDEX "idx_messages_connection_id" ON "public"."messages" USING "btree" ("connection_id", "created_at" DESC);



CREATE INDEX "idx_post_comments_post_id" ON "public"."post_comments" USING "btree" ("post_id", "created_at");



CREATE INDEX "idx_posts_created_at" ON "public"."posts" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_posts_user_id" ON "public"."posts" USING "btree" ("user_id");



CREATE UNIQUE INDEX "unique_connection" ON "public"."connections" USING "btree" (LEAST(("requester_id")::"text", ("receiver_id")::"text"), GREATEST(("requester_id")::"text", ("receiver_id")::"text"));



CREATE OR REPLACE TRIGGER "bill_splits_updated_at" BEFORE UPDATE ON "public"."bill_splits" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "connections_updated_at" BEFORE UPDATE ON "public"."connections" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "on_new_message" AFTER INSERT ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."notify_on_new_message"();



CREATE OR REPLACE TRIGGER "post_comments_inserted" AFTER INSERT ON "public"."post_comments" FOR EACH ROW EXECUTE FUNCTION "public"."inc_post_comments_count"();



CREATE OR REPLACE TRIGGER "post_likes_deleted" AFTER DELETE ON "public"."post_likes" FOR EACH ROW EXECUTE FUNCTION "public"."dec_post_likes_count"();



CREATE OR REPLACE TRIGGER "post_likes_inserted" AFTER INSERT ON "public"."post_likes" FOR EACH ROW EXECUTE FUNCTION "public"."inc_post_likes_count"();



CREATE OR REPLACE TRIGGER "posts_updated_at" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."bill_split_items"
    ADD CONSTRAINT "bill_split_items_split_id_fkey" FOREIGN KEY ("split_id") REFERENCES "public"."bill_splits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bill_split_items"
    ADD CONSTRAINT "bill_split_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."bill_splits"
    ADD CONSTRAINT "bill_splits_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "public"."connections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bill_splits"
    ADD CONSTRAINT "bill_splits_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."blocks"
    ADD CONSTRAINT "blocks_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."blocks"
    ADD CONSTRAINT "blocks_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."connections"
    ADD CONSTRAINT "connections_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."connections"
    ADD CONSTRAINT "connections_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."housing_listings"
    ADD CONSTRAINT "housing_listings_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."housing_platforms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."housing_platforms"
    ADD CONSTRAINT "housing_platforms_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "public"."connections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "public"."connections"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."platform_clicks"
    ADD CONSTRAINT "platform_clicks_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "public"."connections"("id");



ALTER TABLE ONLY "public"."platform_clicks"
    ADD CONSTRAINT "platform_clicks_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."housing_platforms"("id");



ALTER TABLE ONLY "public"."platform_clicks"
    ADD CONSTRAINT "platform_clicks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."post_comments"
    ADD CONSTRAINT "post_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_comments"
    ADD CONSTRAINT "post_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roommate_agreements"
    ADD CONSTRAINT "roommate_agreements_acceptor_id_fkey" FOREIGN KEY ("acceptor_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."roommate_agreements"
    ADD CONSTRAINT "roommate_agreements_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "public"."connections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."roommate_agreements"
    ADD CONSTRAINT "roommate_agreements_initiator_id_fkey" FOREIGN KEY ("initiator_id") REFERENCES "public"."profiles"("id");



CREATE POLICY "agreements_connection_members" ON "public"."roommate_agreements" USING ((EXISTS ( SELECT 1
   FROM "public"."connections" "c"
  WHERE (("c"."id" = "roommate_agreements"."connection_id") AND (("c"."requester_id" = "auth"."uid"()) OR ("c"."receiver_id" = "auth"."uid"()))))));



ALTER TABLE "public"."bill_split_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "bill_split_items_connection_members" ON "public"."bill_split_items" USING ((EXISTS ( SELECT 1
   FROM ("public"."bill_splits" "bs"
     JOIN "public"."connections" "c" ON (("c"."id" = "bs"."connection_id")))
  WHERE (("bs"."id" = "bill_split_items"."split_id") AND (("c"."requester_id" = "auth"."uid"()) OR ("c"."receiver_id" = "auth"."uid"()))))));



ALTER TABLE "public"."bill_splits" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "bill_splits_connection_members" ON "public"."bill_splits" USING ((EXISTS ( SELECT 1
   FROM "public"."connections" "c"
  WHERE (("c"."id" = "bill_splits"."connection_id") AND (("c"."requester_id" = "auth"."uid"()) OR ("c"."receiver_id" = "auth"."uid"()))))));



ALTER TABLE "public"."blocks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "blocks_own" ON "public"."blocks" USING (("auth"."uid"() = "blocker_id"));



ALTER TABLE "public"."connections" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "connections_own" ON "public"."connections" USING ((("auth"."uid"() = "requester_id") OR ("auth"."uid"() = "receiver_id")));



CREATE POLICY "connections_super_admin_read" ON "public"."connections" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."housing_listings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "listings_platform_owner" ON "public"."housing_listings" USING ((EXISTS ( SELECT 1
   FROM "public"."housing_platforms" "hp"
  WHERE (("hp"."id" = "housing_listings"."platform_id") AND ("hp"."contact_email" = ("auth"."jwt"() ->> 'email'::"text")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."housing_platforms" "hp"
  WHERE (("hp"."id" = "housing_listings"."platform_id") AND ("hp"."contact_email" = ("auth"."jwt"() ->> 'email'::"text"))))));



CREATE POLICY "listings_read_published" ON "public"."housing_listings" FOR SELECT USING ((("status" = 'published'::"text") AND ("is_available" = true) AND (EXISTS ( SELECT 1
   FROM "public"."housing_platforms" "hp"
  WHERE (("hp"."id" = "housing_listings"."platform_id") AND ("hp"."status" = 'ACTIVE'::"public"."platform_status"))))));



CREATE POLICY "listings_super_admin" ON "public"."housing_listings" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "messages_connection_members" ON "public"."messages" USING ((EXISTS ( SELECT 1
   FROM "public"."connections" "c"
  WHERE (("c"."id" = "messages"."connection_id") AND (("c"."requester_id" = "auth"."uid"()) OR ("c"."receiver_id" = "auth"."uid"())) AND ("c"."status" = 'ACTIVE'::"public"."connection_status")))));



ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notifications_own" ON "public"."notifications" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "payments_read_own" ON "public"."payments" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."post_comments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "post_comments_delete_own" ON "public"."post_comments" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "post_comments_insert_own" ON "public"."post_comments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "post_comments_read_all" ON "public"."post_comments" FOR SELECT USING (true);



ALTER TABLE "public"."post_likes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "post_likes_delete_own" ON "public"."post_likes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "post_likes_insert_own" ON "public"."post_likes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "post_likes_read_all" ON "public"."post_likes" FOR SELECT USING (true);



ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "posts_delete_own" ON "public"."posts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "posts_insert_own" ON "public"."posts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "posts_read_all" ON "public"."posts" FOR SELECT USING (true);



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_read_all" ON "public"."profiles" FOR SELECT USING (("is_active" = true));



CREATE POLICY "profiles_super_admin_all" ON "public"."profiles" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"())))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "profiles_write_own" ON "public"."profiles" USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."push_subscriptions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "push_subscriptions_own" ON "public"."push_subscriptions" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."roommate_agreements" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."dec_post_likes_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."dec_post_likes_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."dec_post_likes_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."inc_post_comments_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."inc_post_comments_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."inc_post_comments_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."inc_post_likes_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."inc_post_likes_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."inc_post_likes_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_on_new_message"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_on_new_message"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_on_new_message"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."bill_split_items" TO "anon";
GRANT ALL ON TABLE "public"."bill_split_items" TO "authenticated";
GRANT ALL ON TABLE "public"."bill_split_items" TO "service_role";



GRANT ALL ON TABLE "public"."bill_splits" TO "anon";
GRANT ALL ON TABLE "public"."bill_splits" TO "authenticated";
GRANT ALL ON TABLE "public"."bill_splits" TO "service_role";



GRANT ALL ON TABLE "public"."blocks" TO "anon";
GRANT ALL ON TABLE "public"."blocks" TO "authenticated";
GRANT ALL ON TABLE "public"."blocks" TO "service_role";



GRANT ALL ON TABLE "public"."connections" TO "anon";
GRANT ALL ON TABLE "public"."connections" TO "authenticated";
GRANT ALL ON TABLE "public"."connections" TO "service_role";



GRANT ALL ON TABLE "public"."housing_listings" TO "anon";
GRANT ALL ON TABLE "public"."housing_listings" TO "authenticated";
GRANT ALL ON TABLE "public"."housing_listings" TO "service_role";



GRANT ALL ON TABLE "public"."housing_platforms" TO "anon";
GRANT ALL ON TABLE "public"."housing_platforms" TO "authenticated";
GRANT ALL ON TABLE "public"."housing_platforms" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."platform_clicks" TO "anon";
GRANT ALL ON TABLE "public"."platform_clicks" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_clicks" TO "service_role";



GRANT ALL ON TABLE "public"."post_comments" TO "anon";
GRANT ALL ON TABLE "public"."post_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."post_comments" TO "service_role";



GRANT ALL ON TABLE "public"."post_likes" TO "anon";
GRANT ALL ON TABLE "public"."post_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."post_likes" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."push_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."roommate_agreements" TO "anon";
GRANT ALL ON TABLE "public"."roommate_agreements" TO "authenticated";
GRANT ALL ON TABLE "public"."roommate_agreements" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







