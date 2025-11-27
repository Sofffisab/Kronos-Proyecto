/*
  Warnings:

  - Added the required column `id_persona` to the `ia_paginas` table without a default value. This is not possible if the table is not empty.

*/
-- Delete existing test data (since we can't assign it to a person)
DELETE FROM "ia_paginas";

-- AlterTable
ALTER TABLE "ia_paginas" ADD COLUMN     "id_persona" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ia_paginas" ADD CONSTRAINT "ia_paginas_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;
