#!/usr/bin/env python3
"""
Server Stopper
Stops all Node.js processes and PostgreSQL database
"""

import subprocess
import sys
import time

DB_CONTAINER_NAME = "thoth_dev_db"  # uses postgres/postgres credentials

def stop_all_processes():
    """Stop all Node.js processes"""
    print("=== Server Stopper ===")
    
    try:
        # Check for existing Node.js processes
        result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq node.exe'], 
                              capture_output=True, text=True)
        
        if 'node.exe' in result.stdout:
            print("Found Node.js processes, stopping them...")
            
            # Kill all Node.js processes
            stop_result = subprocess.run(['taskkill', '/F', '/IM', 'node.exe'], 
                                       capture_output=True, text=True)
            
            if stop_result.returncode == 0:
                print("✅ Successfully stopped all Node.js processes")
                
                # Wait a moment and verify
                time.sleep(2)
                verify_result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq node.exe'], 
                                             capture_output=True, text=True)
                
                if 'node.exe' not in verify_result.stdout:
                    print("✅ Verification: All processes stopped successfully")
                else:
                    print("⚠️  Warning: Some processes may still be running")
                    
            else:
                print("❌ Error stopping processes:")
                print(stop_result.stderr)
                
        else:
            print("✅ No Node.js processes found - nothing to stop")
            
    except Exception as e:
        print(f"Error stopping processes: {e}")
        sys.exit(1)

def stop_database():
    """Stop PostgreSQL Docker container"""
    try:
        print("\nChecking for PostgreSQL container...")
        
        result = subprocess.run(['docker', 'ps', '--filter', f'name={DB_CONTAINER_NAME}', 
                               '--format', '{{.Names}}'], 
                              capture_output=True, text=True, shell=True)
        
        if DB_CONTAINER_NAME in result.stdout:
            print(f"🛑 Stopping PostgreSQL container '{DB_CONTAINER_NAME}'...")
            subprocess.run(['docker', 'stop', DB_CONTAINER_NAME], 
                          capture_output=True, shell=True)
            print("✅ PostgreSQL container stopped")
        else:
            print("✅ No PostgreSQL container running")
            
    except Exception as e:
        print(f"Note: Could not stop database (Docker may not be running): {e}")

def main():
    """Main function"""
    stop_all_processes()
    stop_database()
    print("\n✅ All servers and database stopped successfully!")

if __name__ == "__main__":
    main()
