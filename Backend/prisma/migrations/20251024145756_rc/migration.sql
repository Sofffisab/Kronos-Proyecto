/*
  Warnings:

  - A unique constraint covering the columns `[nombrearchivo]` on the table `archivos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creadorId` to the `proyecto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "proyecto" ADD COLUMN     "creadorId" INTEGER NOT NULL,
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "fechaFin" TIMESTAMP(3),
ADD COLUMN     "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "invitaciones" (
    "id" SERIAL NOT NULL,
    "id_proyecto" INTEGER NOT NULL,
    "mail" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "fechaEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaExpiracion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tiene_rc" (
    "id" SERIAL NOT NULL,
    "id_proyecto" INTEGER NOT NULL,
    "id_chat" INTEGER NOT NULL,

    CONSTRAINT "tiene_rc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitaciones_codigo_key" ON "invitaciones"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "archivos_nombrearchivo_key" ON "archivos"("nombrearchivo");

-- AddForeignKey
ALTER TABLE "invitaciones" ADD CONSTRAINT "invitaciones_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiene_rc" ADD CONSTRAINT "tiene_rc_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiene_rc" ADD CONSTRAINT "tiene_rc_id_chat_fkey" FOREIGN KEY ("id_chat") REFERENCES "chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
