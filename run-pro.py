#!/usr/bin/env python3
"""
Production Server Runner
Starts PostgreSQL database, builds and runs production server
"""

import subprocess
import sys
import time
import os

# Database config
DB_CONTAINER_NAME = "thoth_dev_db"
DB_IMAGE = "postgres:15"
DB_PORT = "5433"
DB_USER = "postgres"
DB_PASSWORD = "postgres"
DB_NAME = "thoth_dev"

def check_and_kill_existing_processes():
    """Check for existing Node.js processes and kill them"""
    try:
        result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq node.exe'], 
                              capture_output=True, text=True)
        
        if 'node.exe' in result.stdout:
            print("Found existing Node.js processes, stopping them...")
            subprocess.run(['taskkill', '/F', '/IM', 'node.exe'], 
                          capture_output=True)
            time.sleep(2)
            print("Existing processes stopped.")
            return True
        else:
            print("No existing Node.js processes found.")
            return False
    except Exception as e:
        print(f"Error checking processes: {e}")
        return False

def build_project():
    """Build the project for production"""
    print("Building project for production...")
    try:
        result = subprocess.run(['pnpm', 'run', 'build'], 
                              cwd=os.getcwd(),
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Build completed successfully!")
            return True
        else:
            print("❌ Build failed:")
            print(result.stdout)
            print(result.stderr)
            return False
    except Exception as e:
        print(f"Error during build: {e}")
        return False

def start_production_server():
    """Start the production server"""
    print("Starting production server...")
    try:
        process = subprocess.Popen(['pnpm', 'start'], 
                                 cwd=os.getcwd(),
                                 creationflags=subprocess.CREATE_NEW_CONSOLE)
        
        print(f"Production server started with PID: {process.pid}")
        print("Server will be available at: http://localhost:3000")
        print("Press Ctrl+C to stop the server")
        
        # Wait for the process
        process.wait()
        
    except KeyboardInterrupt:
        print("\nStopping production server...")
        process.terminate()
        sys.exit(0)
    except Exception as e:
        print(f"Error starting production server: {e}")
        sys.exit(1)

def check_docker():
    """Check if Docker is available"""
    try:
        result = subprocess.run(['docker', '--version'], capture_output=True, text=True, shell=True)
        return result.returncode == 0
    except:
        return False

def check_existing_db_container():
    """Check if PostgreSQL container exists and running"""
    try:
        result = subprocess.run(['docker', 'ps', '-a', '--filter', f'name={DB_CONTAINER_NAME}', '--format', '{{.Names}}'], 
                              capture_output=True, text=True, shell=True)
        if DB_CONTAINER_NAME in result.stdout:
            running = subprocess.run(['docker', 'ps', '--filter', f'name={DB_CONTAINER_NAME}', '--format', '{{.Names}}'], 
                                   capture_output=True, text=True, shell=True)
            if DB_CONTAINER_NAME in running.stdout:
                print(f"✅ PostgreSQL container '{DB_CONTAINER_NAME}' is already running")
                return True
            else:
                print(f"🔄 Starting existing PostgreSQL container...")
                subprocess.run(['docker', 'start', DB_CONTAINER_NAME], capture_output=True, shell=True)
                return True
        return False
    except:
        return False

def create_db_container():
    """Create new PostgreSQL container"""
    print(f"🆕 Creating PostgreSQL container '{DB_CONTAINER_NAME}'...")
    cmd = ['docker', 'run', '--name', DB_CONTAINER_NAME,
           '-e', f'POSTGRES_USER={DB_USER}',
           '-e', f'POSTGRES_PASSWORD={DB_PASSWORD}',
           '-e', f'POSTGRES_DB={DB_NAME}',
           '-p', f'{DB_PORT}:5432', '-d', DB_IMAGE]
    result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
    return result.returncode == 0

def wait_for_db():
    """Wait for database to be ready"""
    print("⏳ Waiting for PostgreSQL to be ready...")
    for i in range(30):
        try:
            result = subprocess.run(['docker', 'exec', DB_CONTAINER_NAME, 'pg_isready', '-U', DB_USER],
                                  capture_output=True, text=True, shell=True)
            if result.returncode == 0:
                print("✅ PostgreSQL is ready!")
                return True
        except:
            pass
        time.sleep(1)
    return False

def start_database():
    """Start PostgreSQL database"""
    print("=== Database Startup ===\n")
    
    if not check_docker():
        print("⚠️  Docker not available - assuming database is already running")
        return True
    
    if not check_existing_db_container():
        if not create_db_container():
            print("❌ Failed to create database container")
            return False
    
    if not wait_for_db():
        print("⚠️  Database may still be starting...")
    
    print("\n📊 Database: postgresql://{DB_USER}:{DB_PASSWORD}@localhost:{DB_PORT}/{DB_NAME}\n")
    return True

def main():
    """Main function"""
    print("=== Production Server Runner ===\n")
    
    # Check if we're in the right directory
    if not os.path.exists('package.json'):
        print("Error: package.json not found. Please run this script from the project root.")
        sys.exit(1)
    
    # Start database first
    start_database()
    
    # Check and kill existing processes
    check_and_kill_existing_processes()
    
    # Build the project
    if not build_project():
        print("Build failed. Exiting.")
        sys.exit(1)
    
    # Start production server
    start_production_server()

if __name__ == "__main__":
    main()
