/*
  Warnings:

  - Added the required column `pagina_id` to the `ia_paginas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ia_paginas" ADD COLUMN     "pagina_id" INTEGER NOT NULL,
ADD COLUMN     "respuesta_ia" TEXT;

-- CreateIndex
CREATE INDEX "ia_paginas_pagina_id_idx" ON "ia_paginas"("pagina_id");
