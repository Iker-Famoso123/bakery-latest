import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as readline from 'node:readline';

/**
 * Bootstrap invite-only. Garantiza la fila de Settings y, si NO existe ningún
 * usuario, pide interactivamente los datos del primer admin. Idempotente: si ya
 * hay usuarios, no vuelve a preguntar.
 */
const prisma = new PrismaClient();

// ── Prompt interactivo (con contraseña oculta) ──────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let muted = false;
const rlAny = rl as unknown as { output: NodeJS.WriteStream; _writeToOutput: (s: string) => void };
rlAny._writeToOutput = (str: string) => {
  if (muted) {
    if (str.includes('\n')) rlAny.output.write('\n');
    return; // no eco de los caracteres tecleados
  }
  rlAny.output.write(str);
};

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, (a) => resolve(a.trim())));
}

async function askHidden(question: string): Promise<string> {
  process.stdout.write(question);
  muted = true;
  const answer = await new Promise<string>((resolve) => rl.question('', resolve));
  muted = false;
  return answer;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function bootstrapAdmin(): Promise<void> {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log(`✔ Ya existen ${userCount} usuario(s); se omite el bootstrap del admin.`);
    return;
  }

  console.log('\n── Crear primer administrador ──');
  let email = '';
  while (!EMAIL_RE.test(email)) {
    email = (await ask('Email del admin: ')).toLowerCase();
    if (!EMAIL_RE.test(email)) console.log('  Email inválido, intenta de nuevo.');
  }

  const name = (await ask('Nombre: ')) || 'Administrador';

  let password = '';
  for (;;) {
    password = await askHidden('Contraseña (mín. 8): ');
    if (password.length < 8) {
      console.log('  Muy corta, mínimo 8 caracteres.');
      continue;
    }
    const confirm = await askHidden('Confirmar contraseña: ');
    if (confirm !== password) {
      console.log('  No coinciden, intenta de nuevo.');
      continue;
    }
    break;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email, name, role: 'admin', passwordHash },
  });
  console.log(`✔ Admin creado: ${email}`);
}

async function main(): Promise<void> {
  await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton', redes: [], horarios: [] },
  });
  console.log('✔ Settings singleton listo');

  await bootstrapAdmin();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });
