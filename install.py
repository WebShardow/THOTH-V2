#!/usr/bin/env python3
"""
THOTH V2 Installation Script
Automates setup for the modern headless CMS
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def print_step(step_num, text):
    print(f"\n[Step {step_num}] {text}")
    print("-" * 50)

def run_command(cmd, description, cwd=None):
    """Run a command and handle errors"""
    print(f"Running: {description}...")
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            print(f"⚠️  Warning: {result.stderr}")
            return False
        print(f"✅ {description} completed")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_prerequisites():
    """Check if required tools are installed"""
    print_step(0, "Checking Prerequisites")
    
    checks = [
        ("node", "Node.js is required. Please install from https://nodejs.org/"),
        ("npm", "npm is required"),
        ("npx", "npx is required"),
    ]
    
    all_good = True
    for cmd, error_msg in checks:
        if shutil.which(cmd):
            version = subprocess.run([cmd, "--version"], capture_output=True, text=True)
            print(f"✅ {cmd}: {version.stdout.strip()}")
        else:
            print(f"❌ {cmd}: Not found - {error_msg}")
            all_good = False
    
    return all_good

def setup_database():
    """Check database connection and setup"""
    print_step(1, "Database Setup")
    
    env_file = Path(".env")
    if not env_file.exists():
        print("⚠️  .env file not found")
        print("Creating .env template...")
        
        env_content = """# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/thoth_v2?schema=public"

# Authentication
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# App
NODE_ENV="development"
"""
        
        with open(".env", "w") as f:
            f.write(env_content)
        print("✅ Created .env file - PLEASE EDIT IT with your database credentials")
        return False
    else:
        print("✅ .env file exists")
        
        # Read DATABASE_URL
        with open(".env", "r") as f:
            for line in f:
                if line.startswith("DATABASE_URL"):
                    db_url = line.split("=", 1)[1].strip().strip('"')
                    print(f"   Database URL: {db_url}")
                    break
    
    return True

def install_dependencies():
    """Install npm dependencies"""
    print_step(2, "Installing Dependencies")
    return run_command("npm install", "npm install")

def setup_prisma():
    """Setup Prisma database"""
    print_step(3, "Database Migration")
    print("This will create database tables based on the schema.")
    print("⚠️  WARNING: If database exists, data will be reset!")
    
    response = input("\nContinue? (y/N): ").lower()
    if response != 'y':
        print("Skipping database migration. You can run it later with:")
        print("  npx prisma migrate dev")
        return False
    
    # Reset and migrate
    print("\nResetting database and applying migrations...")
    return run_command("npx prisma migrate reset --force --skip-generate", "Database reset and migration")

def generate_prisma_client():
    """Generate Prisma Client"""
    print_step(4, "Generating Prisma Client")
    return run_command("npx prisma generate", "Prisma Client generation")

def create_admin_user():
    """Create initial admin user"""
    print_step(5, "Create Admin User (Optional)")
    
    response = input("Create an admin user now? (y/N): ").lower()
    if response != 'y':
        print("Skipping admin creation. You can create users via:")
        print("  - Sign up through the web interface")
        print("  - Use Prisma Studio: npx prisma studio")
        return True
    
    email = input("Admin email: ").strip()
    password = input("Admin password: ").strip()
    name = input("Admin name: ").strip()
    
    if not all([email, password, name]):
        print("❌ All fields are required")
        return False
    
    # Create a temporary script to insert admin
    admin_script = f"""
const {{ PrismaClient }} = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {{
  const hashedPassword = await bcrypt.hash('{password}', 10);
  
  const user = await prisma.user.upsert({{
    where: {{ email: '{email}' }},
    update: {{ role: 'admin' }},
    create: {{
      email: '{email}',
      name: '{name}',
      role: 'admin',
      password: hashedPassword,
    }},
  }});
  
  console.log('Admin user created:', user.email);
}}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
"""
    
    with open("scripts/create-admin.js", "w") as f:
        f.write(admin_script)
    
    print("Creating admin user...")
    return run_command("node scripts/create-admin.js", "Admin user creation", cwd=None)

def build_project():
    """Build the Next.js project"""
    print_step(6, "Building Project (Optional)")
    
    response = input("Build the project for production? (y/N): ").lower()
    if response != 'y':
        print("Skipping build. For development, use: npm run dev")
        return True
    
    return run_command("npm run build", "Next.js build")

def show_completion():
    """Show completion message"""
    print_header("Installation Complete!")
    
    print("""
🎉 THOTH V2 is ready to use!

📁 Project location: {}

🚀 To start the development server:
   npm run dev

🌐 Then open: http://localhost:3000

🔐 Default login paths:
   - Login:    http://localhost:3000/login
   - Admin:    http://localhost:3000/admin

🛠️  Useful commands:
   - Database GUI:    npx prisma studio
   - Create seed:     npx prisma db seed
   - Check types:     npx tsc --noEmit

📖 For more info, see README.md
""".format(os.getcwd()))

def main():
    print_header("THOTH V2 - Modern Headless CMS Installer")
    
    # Check if we're in the right directory
    if not Path("package.json").exists():
        print("❌ Error: package.json not found!")
        print("Please run this script from the THOTH V2 project root.")
        sys.exit(1)
    
    # Create scripts directory if needed
    Path("scripts").mkdir(exist_ok=True)
    
    # Run installation steps
    if not check_prerequisites():
        print("\n❌ Prerequisites check failed. Please install required tools.")
        sys.exit(1)
    
    has_db = setup_database()
    if not has_db:
        print("\n⚠️  Please edit .env file with your database credentials, then run this script again.")
        sys.exit(0)
    
    if not install_dependencies():
        print("\n❌ Failed to install dependencies")
        sys.exit(1)
    
    if not setup_prisma():
        print("\n⚠️  Database setup skipped or failed")
    else:
        generate_prisma_client()
        create_admin_user()
    
    build_project()
    show_completion()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Installation cancelled by user")
        sys.exit(1)
