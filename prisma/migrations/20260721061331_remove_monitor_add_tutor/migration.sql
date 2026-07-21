-- AlterTable
ALTER TABLE "Menor" ADD COLUMN     "tutorEducativoId" TEXT,
ADD COLUMN     "usuarioId" TEXT;

-- AddForeignKey
ALTER TABLE "Menor" ADD CONSTRAINT "Menor_tutorEducativoId_fkey" FOREIGN KEY ("tutorEducativoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menor" ADD CONSTRAINT "Menor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
