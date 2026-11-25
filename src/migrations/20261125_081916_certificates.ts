import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "certificates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar,
  	"user_id" integer NOT NULL,
  	"department_name" varchar,
  	"department_ou" varchar,
  	"test_result_id" integer,
  	"percent" numeric,
  	"topic_count" numeric,
  	"question_count" numeric,
  	"issued_at" timestamp(3) with time zone NOT NULL,
  	"valid_until" timestamp(3) with time zone NOT NULL,
  	"issued_day" varchar,
  	"revoked" boolean DEFAULT false,
  	"revoked_reason" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "certificates_id" integer;
  ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "certificates" ADD CONSTRAINT "certificates_test_result_id_test_results_id_fk" FOREIGN KEY ("test_result_id") REFERENCES "public"."test_results"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "certificates_number_idx" ON "certificates" USING btree ("number");
  CREATE INDEX "certificates_user_idx" ON "certificates" USING btree ("user_id");
  CREATE INDEX "certificates_test_result_idx" ON "certificates" USING btree ("test_result_id");
  CREATE INDEX "certificates_valid_until_idx" ON "certificates" USING btree ("valid_until");
  CREATE INDEX "certificates_issued_day_idx" ON "certificates" USING btree ("issued_day");
  CREATE INDEX "certificates_updated_at_idx" ON "certificates" USING btree ("updated_at");
  CREATE INDEX "certificates_created_at_idx" ON "certificates" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_certificates_fk" FOREIGN KEY ("certificates_id") REFERENCES "public"."certificates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_certificates_id_idx" ON "payload_locked_documents_rels" USING btree ("certificates_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "certificates" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "certificates" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_certificates_fk";
  
  DROP INDEX "payload_locked_documents_rels_certificates_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "certificates_id";`)
}
