/*
  Warnings:

  - You are about to drop the column `archivo_codigo_pagina` on the `ia_paginas` table. All the data in the column will be lost.
  - You are about to drop the column `foto_pagina_jpg` on the `ia_paginas` table. All the data in the column will be lost.
  - You are about to drop the column `lenguaje` on the `ia_paginas` table. All the data in the column will be lost.
  - You are about to drop the column `name_archivo` on the `ia_paginas` table. All the data in the column will be lost.
  - Added the required column `codigo_json` to the `ia_paginas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imagen_jpg` to the `ia_paginas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language_map` to the `ia_paginas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tema` to the `ia_paginas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."leido" DROP CONSTRAINT "leido_id_mensaje_fkey";

-- DropForeignKey
ALTER TABLE "public"."leido" DROP CONSTRAINT "leido_id_persona_fkey";

-- DropForeignKey
ALTER TABLE "public"."mensajes" DROP CONSTRAINT "mensajes_id_chat_fkey";

-- DropForeignKey
ALTER TABLE "public"."mensajes" DROP CONSTRAINT "mensajes_id_persona_fkey";

-- AlterTable
ALTER TABLE "ia_paginas" DROP COLUMN "archivo_codigo_pagina",
DROP COLUMN "foto_pagina_jpg",
DROP COLUMN "lenguaje",
DROP COLUMN "name_archivo",
ADD COLUMN     "codigo_json" JSONB NOT NULL,
ADD COLUMN     "imagen_jpg" BYTEA NOT NULL,
ADD COLUMN     "language_map" JSONB NOT NULL,
ADD COLUMN     "tema" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "leido" ALTER COLUMN "id_persona" DROP NOT NULL;

-- AlterTable
ALTER TABLE "mensajes" ALTER COLUMN "id_persona" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_id_chat_fkey" FOREIGN KEY ("id_chat") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leido" ADD CONSTRAINT "leido_id_mensaje_fkey" FOREIGN KEY ("id_mensaje") REFERENCES "mensajes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leido" ADD CONSTRAINT "leido_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "persona"("id") ON DELETE SET NULL ON UPDATE CASCADE;
