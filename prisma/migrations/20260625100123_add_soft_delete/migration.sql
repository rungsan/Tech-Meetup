-- AlterTable
ALTER TABLE "inspection_jobs" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "inspection_jobs_deleted_at_idx" ON "inspection_jobs"("deleted_at");
