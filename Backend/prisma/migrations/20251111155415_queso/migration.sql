/*
  Warnings:

  - You are about to drop the column `id_persona` on the `tareas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."archivos" DROP CONSTRAINT "archivos_id_persona_fkey";

-- DropForeignKey
ALTER TABLE "public"."archivos" DROP CONSTRAINT "archivos_id_proyecto_fkey";

-- DropForeignKey
ALTER TABLE "public"."chat" DROP CONSTRAINT "chat_id_proyecto_fkey";

-- DropForeignKey
ALTER TABLE "public"."invitaciones" DROP CONSTRAINT "invitaciones_id_proyecto_fkey";

-- DropForeignKey
ALTER TABLE "public"."personalizaciones" DROP CONSTRAINT "personalizaciones_id_persona_fkey";

-- DropForeignKey
ALTER TABLE "public"."tareas" DROP CONSTRAINT "tareas_id_persona_fkey";

-- DropForeignKey
ALTER TABLE "public"."tareas" DROP CONSTRAINT "tareas_id_proyecto_fkey";

-- DropForeignKey
ALTER TABLE "public"."tiene" DROP CONSTRAINT "tiene_id_persona_fkey";

-- DropForeignKey
ALTER TABLE "public"."tiene" DROP CONSTRAINT "tiene_id_proyecto_fkey";

-- DropForeignKey
ALTER TABLE "public"."tiene_pc" DROP CONSTRAINT "tiene_pc_id_chat_fkey";

-- DropForeignKey
ALTER TABLE "public"."tiene_pc" DROP CONSTRAINT "tiene_pc_id_persona_fkey";

-- DropForeignKey
ALTER TABLE "public"."tiene_rc" DROP CONSTRAINT "tiene_rc_id_chat_fkey";

-- DropForeignKey
ALTER TABLE "public"."tiene_rc" DROP CONSTRAINT "tiene_rc_id_proyecto_fkey";

-- AlterTable
ALTER TABLE "proyecto" ALTER COLUMN "creadorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tareas" DROP COLUMN "id_persona",
ADD COLUMN     "id_asignado" INTEGER,
ADD COLUMN     "id_creador" INTEGER;

-- AddForeignKey
ALTER TABLE "archivos" ADD CONSTRAINT "archivos_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivos" ADD CONSTRAINT "archivos_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_id_creador_fkey" FOREIGN KEY ("id_creador") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_id_asignado_fkey" FOREIGN KEY ("id_asignado") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personalizaciones" ADD CONSTRAINT "personalizaciones_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiene" ADD CONSTRAINT "tiene_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiene" ADD CONSTRAINT "tiene_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyecto" ADD CONSTRAINT "proyecto_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitaciones" ADD CONSTRAINT "invitaciones_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiene_pc" ADD CONSTRAINT "tiene_pc_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiene_pc" ADD CONSTRAINT "tiene_pc_id_chat_fkey" FOREIGN KEY ("id_chat") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiene_rc" ADD CONSTRAINT "tiene_rc_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiene_rc" ADD CONSTRAINT "tiene_rc_id_chat_fkey" FOREIGN KEY ("id_chat") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
