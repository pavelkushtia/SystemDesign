#!/bin/bash

# ScaleSim Setup Script
# This script initializes the project for development

set -e  # Exit on any error

echo "🚀 ScaleSim Setup Script"
echo "========================="

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

print_success "npm version: $(npm --version)"

# Clean previous installations
print_status "Cleaning previous installations..."
rm -rf node_modules package-lock.json
rm -rf shared/node_modules shared/package-lock.json
rm -rf backend/node_modules backend/package-lock.json  
rm -rf frontend/node_modules frontend/package-lock.json

# Install root dependencies
print_status "Installing root dependencies..."
npm install

# Install shared package dependencies
print_status "Installing shared package dependencies..."
cd shared
npm install
print_success "Shared package dependencies installed"

# Build shared package
print_status "Building shared package..."
npm run build
print_success "Shared package built successfully"
cd ..

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install
print_success "Backend dependencies installed"
cd ..

# Install frontend dependencies  
print_status "Installing frontend dependencies..."
cd frontend
npm install
print_success "Frontend dependencies installed"
cd ..

print_success "🎉 ScaleSim setup completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Run './start.sh' to start the development server"
echo "  2. Or run 'npm run dev' manually"
echo ""
echo "URLs:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:3001"
echo "  - Health Check: http://localhost:3001/health" 