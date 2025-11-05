/*
  Warnings:

  - A unique constraint covering the columns `[nombrearchivo,id_proyecto]` on the table `archivos` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."tareas" DROP CONSTRAINT "tareas_nombre_responsable_fkey";

-- DropIndex
DROP INDEX "public"."archivos_nombrearchivo_key";

-- AlterTable
ALTER TABLE "tareas" ADD COLUMN     "id_responsable" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "archivos_nombrearchivo_id_proyecto_key" ON "archivos"("nombrearchivo", "id_proyecto");

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_id_responsable_fkey" FOREIGN KEY ("id_responsable") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;
