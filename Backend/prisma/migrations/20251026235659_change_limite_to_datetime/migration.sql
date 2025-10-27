/*
  Warnings:

  - A unique constraint covering the columns `[id_persona,id_proyecto]` on the table `tiene` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_persona,id_chat]` on the table `tiene_pc` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `limite` on the `proyecto` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `limite` on the `tareas` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "proyecto" DROP COLUMN "limite",
ADD COLUMN     "limite" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "tareas" DROP COLUMN "limite",
ADD COLUMN     "limite" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tiene_id_persona_id_proyecto_key" ON "tiene"("id_persona", "id_proyecto");

-- CreateIndex
CREATE UNIQUE INDEX "tiene_pc_id_persona_id_chat_key" ON "tiene_pc"("id_persona", "id_chat");
