#!/bin/bash

# THOTH V2 - Modern Headless CMS Installer
# Works on Linux and macOS

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo "============================================"
    echo "  $1"
    echo "============================================"
    echo ""
}

print_step() {
    echo ""
    echo "[Step $1] $2"
    echo "----------------------------------------"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found!"
    echo "Please run this script from the THOTH V2 project root."
    exit 1
fi

print_header "THOTH V2 - Modern Headless CMS Installer"

# Step 1: Check prerequisites
print_step "1" "Checking Prerequisites"

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi
print_success "Node.js is installed ($(node --version))"

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi
print_success "npm is installed ($(npm --version))"

# Step 2: Environment setup
print_step "2" "Checking Environment"

if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating template..."
    cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/thoth_v2?schema=public"

# Authentication
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# App
NODE_ENV="development"
EOF
    print_success "Created .env file"
    print_warning "IMPORTANT: Please edit .env with your database credentials"
    read -p "Press Enter after editing .env to continue, or Ctrl+C to exit..."
else
    print_success ".env file exists"
fi

# Step 3: Install dependencies
print_step "3" "Installing Dependencies"

npm install
print_success "Dependencies installed"

# Step 4: Database migration
print_step "4" "Database Migration"
print_warning "WARNING: This will reset your database if it exists!"
print_warning "All existing data will be lost."
echo ""

read -p "Continue with database reset and migration? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma migrate reset --force --skip-generate || {
        print_warning "Database migration had issues. You may need to:"
        echo "  1. Ensure PostgreSQL is running"
        echo "  2. Check DATABASE_URL in .env is correct"
        echo "  3. Create the database manually if it doesn't exist"
        read -p "Press Enter to continue..."
    }
else
    echo "Skipping database migration. You can run it later with:"
    echo "  npx prisma migrate dev"
fi

# Step 5: Generate Prisma Client
print_step "5" "Generating Prisma Client"

npx prisma generate || print_warning "Prisma Client generation had issues"

# Step 6: Create admin user (optional)
print_step "6" "Create Admin User (Optional)"

read -p "Create an admin user now? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Admin email: " admin_email
    read -p "Admin name: " admin_name
    read -sp "Admin password: " admin_pass
    echo ""
    
    mkdir -p scripts
    
    cat > scripts/create-admin.js << EOF
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('$admin_pass', 10);
  
  const user = await prisma.user.upsert({
    where: { email: '$admin_email' },
    update: { role: 'admin' },
    create: {
      email: '$admin_email',
      name: '$admin_name',
      role: 'admin',
      password: hashedPassword,
    },
  });
  
  console.log('Admin created:', user.email);
}

main()
  .catch(console.error)
  .finally(async () => await prisma.\$disconnect());
EOF
    
    node scripts/create-admin.js || print_warning "Admin creation had issues"
fi

# Step 7: Build (optional)
print_step "7" "Build Project (Optional)"

read -p "Build for production now? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run build || print_warning "Build had issues"
fi

# Completion
print_header "Installation Complete!"

echo ""
echo -e "${GREEN}🎉 THOTH V2 is ready to use!${NC}"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "Login paths:"
echo "  - Login:  http://localhost:3000/login"
echo "  - Admin:  http://localhost:3000/admin"
echo ""
echo "Useful commands:"
echo "  - Database GUI:  npx prisma studio"
echo "  - Type check:  npx tsc --noEmit"
echo ""

read -p "Start the development server now? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run dev
fi
