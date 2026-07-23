import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Super Admin
  const adminPassword = await bcrypt.hash('Admin@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@wheelswap.in' },
    update: {},
    create: {
      email: 'admin@wheelswap.in',
      name: 'WheelSwap Admin',
      password: adminPassword,
      role: UserRole.SUPER_ADMIN,
      isEmailVerified: true,
      isKycVerified: true,
      isActive: true,
      city: 'Mumbai',
      state: 'Maharashtra',
    },
  });

  console.log(`✅ Super Admin created: ${admin.email}`);
  console.log('📧 Email: admin@wheelswap.in');
  console.log('🔑 Password: Admin@123');
  console.log('\n⚠️  CHANGE THE ADMIN PASSWORD IN PRODUCTION!');
  console.log('\n✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
