import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 เริ่มต้นสร้างเมนูตัวอย่าง...');

  // ล้างข้อมูลเก่าก่อน (เฉพาะ MenuItems)
  await prisma.menuItem.deleteMany({});

  const sampleMenus = [
    {
      label: 'Home',
      url: '/',
      order: 1,
      isVisible: true,
      showInNavbar: true,
      showInSidebar: false,
      showInFooter: false,
    },
    {
      label: 'Team Directory',
      url: '/staff',
      order: 2,
      isVisible: true,
      showInNavbar: true,
      showInSidebar: true, // แสดงทั้งบนและข้างใน
      showInFooter: false,
    },
    {
      label: 'Our Services',
      url: '#services',
      order: 3,
      isVisible: true,
      showInNavbar: false,
      showInSidebar: true, // เฉพาะ Sidebar
      showInFooter: false,
    },
    {
      label: 'About',
      url: '#about',
      order: 4,
      isVisible: true,
      showInNavbar: true,
      showInSidebar: false,
      showInFooter: true, // แสดงบนและล่าง
    },
    {
      label: 'Contact Us',
      url: '#contact',
      order: 5,
      isVisible: true,
      showInNavbar: true,
      showInSidebar: true,
      showInFooter: true, // แสดงทุกที่!
    },
    {
      label: 'Admin Panel',
      url: '/admin',
      order: 6,
      isVisible: true,
      showInNavbar: false,
      showInSidebar: true, // ลิงค์เข้าหลังบ้านใน Sidebar
      showInFooter: false,
    },
    {
      label: 'Privacy Policy',
      url: '/privacy',
      order: 7,
      isVisible: true,
      showInNavbar: false,
      showInSidebar: false,
      showInFooter: true, // เฉพาะ Footer
    },
    {
      label: 'GitHub',
      url: 'https://github.com',
      order: 8,
      isVisible: true,
      isExternal: true, // ลิงค์ภายนอก
      showInNavbar: false,
      showInSidebar: true,
      showInFooter: true,
    },
    {
      label: 'LinkedIn',
      url: 'https://linkedin.com',
      order: 9,
      isVisible: true,
      isExternal: true,
      showInNavbar: false,
      showInSidebar: false,
      showInFooter: true,
    },
  ];

  for (const item of sampleMenus) {
    await prisma.menuItem.create({ data: item });
  }

  console.log('✅ สร้างเมนูตัวอย่างสำเร็จ!');
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาด:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

