-- Composite PK (workspace_id, id) untuk semua tabel data:
-- id dari client hanya unik per workspace, bukan global.
-- Drop PK lama dulu, lalu tambah yang baru.
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_pkey";
ALTER TABLE "rab_rows" DROP CONSTRAINT "rab_rows_pkey";
ALTER TABLE "piutangs" DROP CONSTRAINT "piutangs_pkey";
ALTER TABLE "assets" DROP CONSTRAINT "assets_pkey";
ALTER TABLE "deps" DROP CONSTRAINT "deps_pkey";
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_pkey";

ALTER TABLE "transactions" ADD CONSTRAINT "transactions_workspace_id_id_pk" PRIMARY KEY("workspace_id","id");
ALTER TABLE "rab_rows" ADD CONSTRAINT "rab_rows_workspace_id_id_pk" PRIMARY KEY("workspace_id","id");
ALTER TABLE "piutangs" ADD CONSTRAINT "piutangs_workspace_id_id_pk" PRIMARY KEY("workspace_id","id");
ALTER TABLE "assets" ADD CONSTRAINT "assets_workspace_id_id_pk" PRIMARY KEY("workspace_id","id");
ALTER TABLE "deps" ADD CONSTRAINT "deps_workspace_id_id_pk" PRIMARY KEY("workspace_id","id");
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_workspace_id_id_pk" PRIMARY KEY("workspace_id","id");
