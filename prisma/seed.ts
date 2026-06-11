import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.info('🌱  Starting database seed...');

  // ─── Seed Admin User ───────────────────────────────────────────────────────
  const adminEmail = 'admin@silly.dev';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    const hashed = await bcrypt.hash('Admin@1234', 12);
    const admin = await prisma.user.create({
      data: {
        fullName: 'Super Admin',
        email: adminEmail,
        password: hashed,
        role: Role.ADMIN,
        verified: true,
      },
    });
    console.info(`✅  Admin created → ${admin.email}`);
  } else {
    console.info(`ℹ️   Admin already exists → ${existing.email}`);
  }

  // ─── Seed Demo User ────────────────────────────────────────────────────────
  const demoEmail = 'demo@silly.dev';
  const existingDemo = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!existingDemo) {
    const hashed = await bcrypt.hash('Demo@1234', 12);
    const demo = await prisma.user.create({
      data: {
        fullName: 'Demo User',
        email: demoEmail,
        password: hashed,
        role: Role.USER,
        verified: true,
      },
    });
    console.info(`✅  Demo user created → ${demo.email}`);
  } else {
    console.info(`ℹ️   Demo user already exists → ${existingDemo.email}`);
  }

  console.info('✅  Seed complete.');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
