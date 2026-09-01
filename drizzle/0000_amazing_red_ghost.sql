CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"jenis" text DEFAULT 'PROPERTY' NOT NULL,
	"nama" text NOT NULL,
	"atas_nama" text DEFAULT '' NOT NULL,
	"tgl" text NOT NULL,
	"nilai" numeric(19, 2) DEFAULT '0' NOT NULL,
	"dp" numeric(19, 2) DEFAULT '0' NOT NULL,
	"bunga" numeric(6, 4) DEFAULT '0.0800' NOT NULL,
	"tenor" integer DEFAULT 120 NOT NULL,
	"nilai_pasar" numeric(19, 2) DEFAULT '0' NOT NULL,
	"tambah" numeric(19, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deps" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"nama" text NOT NULL,
	"tgl" text NOT NULL,
	"nilai" numeric(19, 2) DEFAULT '0' NOT NULL,
	"umur" integer DEFAULT 60 NOT NULL,
	"nilai_taksir" numeric(19, 2) DEFAULT '0' NOT NULL,
	"kat" text DEFAULT 'KENDARAAN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "piutangs" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"tgl" text NOT NULL,
	"nsb" text NOT NULL,
	"uraian" text NOT NULL,
	"terbit" numeric(19, 2) DEFAULT '0' NOT NULL,
	"lunas" numeric(19, 2) DEFAULT '0' NOT NULL,
	"keterangan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rab_rows" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"target" text NOT NULL,
	"group" text NOT NULL,
	"uraian" text NOT NULL,
	"sat" text DEFAULT 'bln' NOT NULL,
	"vol" integer DEFAULT 1 NOT NULL,
	"hs" numeric(19, 2) DEFAULT '0' NOT NULL,
	"w" jsonb NOT NULL,
	"months" jsonb NOT NULL,
	"total" numeric(19, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"nama" text NOT NULL,
	"hs" numeric(19, 2) DEFAULT '0' NOT NULL,
	"months" jsonb NOT NULL,
	"kat" text DEFAULT 'service' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"workspace_id" text PRIMARY KEY NOT NULL,
	"year" integer DEFAULT 2026 NOT NULL,
	"saldo_awal" numeric(19, 2) DEFAULT '0' NOT NULL,
	"demo_mode" boolean DEFAULT false NOT NULL,
	"master_data" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"tanggal" text NOT NULL,
	"nsb" text DEFAULT '' NOT NULL,
	"pos" text DEFAULT '' NOT NULL,
	"uraian" text NOT NULL,
	"penerimaan" numeric(19, 2) DEFAULT '0' NOT NULL,
	"pengeluaran" numeric(19, 2) DEFAULT '0' NOT NULL,
	"ledger" text NOT NULL,
	"kategori" text,
	"transfer_id" text,
	"receivable_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text DEFAULT 'Pengguna' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text DEFAULT 'Keuangan Personal' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deps" ADD CONSTRAINT "deps_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "piutangs" ADD CONSTRAINT "piutangs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rab_rows" ADD CONSTRAINT "rab_rows_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_workspace_idx" ON "assets" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "dep_workspace_idx" ON "deps" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "piutang_workspace_idx" ON "piutangs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "rab_workspace_idx" ON "rab_rows" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "sched_workspace_idx" ON "schedules" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "tx_workspace_idx" ON "transactions" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "tx_workspace_tanggal_idx" ON "transactions" USING btree ("workspace_id","tanggal");--> statement-breakpoint
CREATE INDEX "workspace_user_idx" ON "workspaces" USING btree ("user_id");