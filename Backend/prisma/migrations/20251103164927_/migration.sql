-- CreateTable
CREATE TABLE "ia_paginas" (
    "id" SERIAL NOT NULL,
    "name_archivo" TEXT NOT NULL,
    "archivo_codigo_pagina" TEXT NOT NULL,
    "lenguaje" TEXT NOT NULL,
    "foto_pagina_jpg" BYTEA NOT NULL,

    CONSTRAINT "ia_paginas_pkey" PRIMARY KEY ("id")
);
