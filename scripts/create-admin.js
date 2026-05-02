const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@thoth.local' },
    update: { role: 'admin' },
    create: {
      email: 'admin@thoth.local',
      name: 'Admin User',
      role: 'admin',
      password: hashedPassword,
    },
  });
  
  console.log('✅ Admin user created/updated:');
  console.log('   Email:', user.email);
  console.log('   Password: admin123');
  console.log('   Role:', user.role);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
