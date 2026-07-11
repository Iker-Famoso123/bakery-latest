import { PrismaClient } from '@prisma/client';

/**
 * Seed de Fase 1: garantiza la fila única de Settings (About).
 * El bootstrap del primer admin (con bcrypt) llega en la Fase 2.
 */
const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton', redes: [], horarios: [] },
  });
  console.log('✔ Settings singleton listo');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
