DROP INDEX "asset_workspace_idx";--> statement-breakpoint
DROP INDEX "dep_workspace_idx";--> statement-breakpoint
DROP INDEX "piutang_workspace_idx";--> statement-breakpoint
DROP INDEX "rab_workspace_idx";--> statement-breakpoint
DROP INDEX "sched_workspace_idx";--> statement-breakpoint
DROP INDEX "tx_workspace_idx";--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_workspace_id_id_pk" PRIMARY KEY("workspace_id","id");--> statement-breakpoint
ALTER TABLE "deps" ADD CONSTRAINT "deps_workspace_id_id_pk" PRIMARY KEY("workspace_id","id");--> statement-breakpoint
ALTER TABLE "piutangs" ADD CONSTRAINT "piutangs_workspace_id_id_pk" PRIMARY KEY("workspace_id","id");--> statement-breakpoint
ALTER TABLE "rab_rows" ADD CONSTRAINT "rab_rows_workspace_id_id_pk" PRIMARY KEY("workspace_id","id");--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_workspace_id_id_pk" PRIMARY KEY("workspace_id","id");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_workspace_id_id_pk" PRIMARY KEY("workspace_id","id");