#!/bin/bash

# ScaleSim Stop Script
# This script stops all running ScaleSim services

echo "🛑 Stopping ScaleSim Services"
echo "=============================="

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
        print_status "Stopping $service_name on port $port..."
        local pids=$(lsof -ti:$port)
        if [ ! -z "$pids" ]; then
            # First try graceful shutdown
            kill $pids 2>/dev/null || true
            sleep 3
            
            # If still running, force kill
            if check_port $port; then
                print_status "Force killing $service_name on port $port..."
                kill -9 $pids 2>/dev/null || true
                sleep 2
            fi
            
            if check_port $port; then
                print_error "Failed to stop $service_name on port $port"
                return 1
            else
                print_success "Stopped $service_name"
            fi
        fi
    else
        print_status "$service_name is not running on port $port"
    fi
}

# Stop processes by name patterns
print_status "Stopping ScaleSim processes..."

# Stop concurrently processes
if pgrep -f "concurrently.*dev" > /dev/null; then
    print_status "Stopping concurrently processes..."
    pkill -TERM -f "concurrently.*dev" 2>/dev/null || true
    sleep 2
    pkill -9 -f "concurrently.*dev" 2>/dev/null || true
fi

# Stop tsx processes
if pgrep -f "tsx.*watch" > /dev/null; then
    print_status "Stopping tsx processes..."
    pkill -TERM -f "tsx.*watch" 2>/dev/null || true
    sleep 2
    pkill -9 -f "tsx.*watch" 2>/dev/null || true
fi

# Stop vite processes
if pgrep -f "vite" > /dev/null; then
    print_status "Stopping vite processes..."
    pkill -TERM -f "vite" 2>/dev/null || true
    sleep 2
    pkill -9 -f "vite" 2>/dev/null || true
fi

# Stop processes on specific ports
stop_port_processes 3000 "Frontend (Vite)"
stop_port_processes 3001 "Backend (Express)"

# Final check
sleep 2
if check_port 3000 || check_port 3001; then
    print_warning "Some services may still be running. You may need to manually kill remaining processes."
else
    print_success "All ScaleSim services stopped successfully!"
fi

print_status "ScaleSim shutdown complete." 