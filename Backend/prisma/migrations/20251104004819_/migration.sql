-- AlterTable
ALTER TABLE "persona" ADD COLUMN     "foto_perfil" BYTEA,
ADD COLUMN     "horario_fin" TIME,
ADD COLUMN     "horario_inicio" TIME;

-- AlterTable
ALTER TABLE "proyecto" ADD COLUMN     "foto_perfil" BYTEA,
ADD COLUMN     "oficio" TEXT;

-- AlterTable
ALTER TABLE "tareas" ADD COLUMN     "importancia" TEXT,
ADD COLUMN     "nombre_responsable" TEXT,
ADD COLUMN     "orden" INTEGER;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_nombre_responsable_fkey" FOREIGN KEY ("nombre_responsable") REFERENCES "persona"("usuario") ON DELETE SET NULL ON UPDATE CASCADE;
