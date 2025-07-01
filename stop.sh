#!/bin/bash

# ScaleSim Stop Script
# This script stops all ScaleSim development processes

set -e  # Exit on any error

echo "🛑 Stopping ScaleSim Development Server"
echo "========================================"

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

# Function to force stop processes on specific ports
force_stop_port() {
    local port=$1
    local service_name=$2
    
    if check_port $port; then
        print_warning "Stopping $service_name on port $port..."
        local pids=$(lsof -ti:$port 2>/dev/null || true)
        if [ ! -z "$pids" ]; then
            # Force kill immediately
            kill -9 $pids 2>/dev/null || true
            sleep 1
            
            if check_port $port; then
                print_error "Failed to stop $service_name on port $port"
            else
                print_success "Stopped $service_name on port $port"
            fi
        fi
    else
        print_status "Port $port is already free"
    fi
}

print_status "Stopping all ScaleSim processes..."

# Stop processes by pattern matching - comprehensive approach
print_status "Killing process patterns..."
pkill -f "concurrently.*scalesim" 2>/dev/null || true
pkill -f "tsx.*watch.*index.ts" 2>/dev/null || true
pkill -f "vite.*frontend" 2>/dev/null || true
pkill -f "npm.*dev.*scalesim" 2>/dev/null || true

# Stop any node processes in ScaleSim directories
pkill -f "$(pwd)/backend" 2>/dev/null || true
pkill -f "$(pwd)/frontend" 2>/dev/null || true
pkill -f "scalesim.*dev" 2>/dev/null || true

# Force stop processes on specific ports
force_stop_port 3000 "Frontend"
force_stop_port 3001 "Backend"
force_stop_port 3002 "Frontend (alt)"

# Wait for processes to terminate
sleep 3

# Final cleanup - kill any remaining ScaleSim processes
print_status "Final cleanup..."
ps aux | grep -E "(tsx|vite|concurrently)" | grep -v grep | awk '{print $2}' | xargs -r kill -9 2>/dev/null || true

print_success "All ScaleSim processes stopped"
print_status "Ports 3000, 3001, and 3002 should now be available" 