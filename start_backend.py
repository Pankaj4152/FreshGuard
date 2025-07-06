#!/usr/bin/env python3
"""
Startup script for FreshGuard backend server
"""

import os
import sys
import subprocess

def start_backend():
    """Start the FreshGuard backend server"""
    print("🚀 Starting FreshGuard Backend Server...")
    
    # Get the backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    api_dir = os.path.join(backend_dir, 'api')
    
    print(f"📁 Backend directory: {backend_dir}")
    print(f"📁 API directory: {api_dir}")
    
    # Check if app.py exists
    app_file = os.path.join(api_dir, 'app.py')
    if not os.path.exists(app_file):
        print(f"❌ Error: {app_file} not found!")
        return False
    
    # Change to the API directory and run the app
    os.chdir(api_dir)
    print(f"📂 Changed to directory: {os.getcwd()}")
    
    # Try to start the Flask app
    try:
        print("🌐 Starting Flask server...")
        print("   Server will be available at: http://localhost:5000")
        print("   Press Ctrl+C to stop the server")
        print("-" * 50)
        
        # Import and run the Flask app
        sys.path.insert(0, os.path.join(backend_dir, 'scripts'))
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("   Make sure all dependencies are installed:")
        print("   pip install -r requirements.txt")
        return False
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return False
    
    return True

if __name__ == "__main__":
    start_backend()
