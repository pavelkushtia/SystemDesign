#!/bin/bash

# ScaleSim Start Script
# This script stops any running instances and starts the development server

set -e  # Exit on any error

echo "🚀 ScaleSim Development Server"
echo "==============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a process is running on a port
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to stop processes on specific ports
stop_port_processes() {
    local port=$1
    local service_name=$2
    
    if check_port $port; then
        print_warning "$service_name is running on port $port. Stopping..."
        local pids=$(lsof -ti:$port)
        if [ ! -z "$pids" ]; then
            kill -9 $pids 2>/dev/null || true
            sleep 2
            if check_port $port; then
                print_error "Failed to stop $service_name on port $port"
                return 1
            else
                print_success "Stopped $service_name on port $port"
            fi
        fi
    else
        print_status "Port $port is free"
    fi
}

# Stop any existing ScaleSim processes
print_status "Stopping any existing ScaleSim processes..."

# Stop processes by name
pkill -f "concurrently.*dev" 2>/dev/null || true
pkill -f "tsx.*watch" 2>/dev/null || true  
pkill -f "vite" 2>/dev/null || true

# Stop processes on specific ports
stop_port_processes 3000 "Frontend (Vite)"
stop_port_processes 3001 "Backend (Express)"

# Wait a moment for processes to fully stop
sleep 3

# Check if shared package is built
if [ ! -d "shared/dist" ] || [ ! -f "shared/dist/index.js" ]; then
    print_warning "Shared package not built. Building now..."
    cd shared
    npm run build
    cd ..
    print_success "Shared package built"
fi

# Check if all dependencies are installed
if [ ! -d "node_modules" ] || [ ! -d "shared/node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    print_warning "Dependencies not installed. Run './setup.sh' first."
    print_status "Running setup automatically..."
    ./setup.sh
fi

print_status "Starting ScaleSim development server..."
print_status "Frontend will be available at: http://localhost:3000"
print_status "Backend API will be available at: http://localhost:3001"
print_status "Press Ctrl+C to stop the servers"
echo ""

# Start the development server
npm run dev 