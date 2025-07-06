#!/usr/bin/env python3
"""
Startup script for FreshGuard frontend server
"""

import os
import subprocess
import sys

def start_frontend():
    """Start the FreshGuard frontend development server"""
    print("🚀 Starting FreshGuard Frontend Development Server...")
    
    # Get the frontend directory
    frontend_dir = os.path.join(os.path.dirname(__file__), 'frontend')
    
    print(f"📁 Frontend directory: {frontend_dir}")
    
    # Check if package.json exists
    package_file = os.path.join(frontend_dir, 'package.json')
    if not os.path.exists(package_file):
        print(f"❌ Error: {package_file} not found!")
        return False
    
    # Change to the frontend directory
    os.chdir(frontend_dir)
    print(f"📂 Changed to directory: {os.getcwd()}")
    
    # Install dependencies if node_modules doesn't exist
    node_modules = os.path.join(frontend_dir, 'node_modules')
    if not os.path.exists(node_modules):
        print("📦 Installing dependencies...")
        try:
            subprocess.run(['npm', 'install'], check=True)
            print("✅ Dependencies installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error installing dependencies: {e}")
            return False
    
    # Try to start the development server
    try:
        print("🌐 Starting React development server...")
        print("   Server will be available at: http://localhost:3000")
        print("   Press Ctrl+C to stop the server")
        print("-" * 50)
        
        # Start the React development server
        subprocess.run(['npm', 'start'], check=True)
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting development server: {e}")
        return False
    except KeyboardInterrupt:
        print("\n🛑 Frontend server stopped by user")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    start_frontend()
