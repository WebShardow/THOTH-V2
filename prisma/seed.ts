import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10)
  const editorPassword = await bcrypt.hash('editor123', 10)

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@thoth.local' },
    update: { role: 'admin' },
    create: {
      email: 'admin@thoth.local',
      name: 'Admin User',
      role: 'admin',
      password: adminPassword,
    },
  })
  console.log('✅ Admin created:', admin.email, '(password: admin123)')

  // Create editor user
  const editor = await prisma.user.upsert({
    where: { email: 'editor@thoth.local' },
    update: { role: 'editor' },
    create: {
      email: 'editor@thoth.local',
      name: 'Editor User',
      role: 'editor',
      password: editorPassword,
    },
  })
  console.log('✅ Editor created:', editor.email, '(password: editor123)')

  // Create sample categories
  const category1 = await prisma.category.upsert({
    where: { slug: 'web-development' },
    update: {},
    create: {
      name: 'Web Development',
      slug: 'web-development',
      description: 'Web projects and applications',
    },
  })
  console.log('✅ Category created:', category1.name)

  const category2 = await prisma.category.upsert({
    where: { slug: 'mobile-apps' },
    update: {},
    create: {
      name: 'Mobile Apps',
      slug: 'mobile-apps',
      description: 'Mobile application projects',
    },
  })
  console.log('✅ Category created:', category2.name)

  // Create sample page
  const page = await prisma.page.upsert({
    where: { slug: 'about' },
    update: {},
    create: {
      title: 'About Us',
      slug: 'about',
      content: '<h1>About THOTH V2</h1><p>Modern Headless CMS</p>',
      excerpt: 'Learn more about our CMS',
      isPublished: true,
      featured: true,
    },
  })
  console.log('✅ Page created:', page.title)

  // Create sample project
  const project = await prisma.project.create({
    data: {
      title: 'Sample Project',
      description: 'A sample project for demonstration',
      categoryId: category1.id,
      thumbnail: 'https://via.placeholder.com/800x600',
      isPublished: true,
      featured: true,
      date: new Date(),
    },
  })
  console.log('✅ Project created:', project.title)

  console.log('\n🎉 Seed completed!')
  console.log('\nTest Accounts:')
  console.log('  Admin:  admin@thoth.local / admin123')
  console.log('  Editor: editor@thoth.local / editor123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
