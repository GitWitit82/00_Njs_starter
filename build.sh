#!/bin/bash

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

# Function to print colored status messages
print_status() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d 'v' -f 2)
    if [ "$(printf '%s\n' "14.0.0" "$NODE_VERSION" | sort -V | head -n1)" = "14.0.0" ]; then
        print_success "Node.js version $NODE_VERSION is compatible"
    else
        print_error "Node.js version must be 14.0.0 or higher (current: $NODE_VERSION)"
        exit 1
    fi
}

# Clean up function
cleanup() {
    print_status "🧹 Cleaning up previous build artifacts..."
    
    if [ -d ".next" ]; then
        rm -rf .next
        print_success "Removed .next directory"
    fi
    
    if [ -d "node_modules" ]; then
        rm -rf node_modules
        print_success "Removed node_modules directory"
    fi
    
    if [ -f "package-lock.json" ]; then
        rm -f package-lock.json
        print_success "Removed package-lock.json"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "📦 Installing dependencies..."
    
    # Clear npm cache
    print_status "Clearing npm cache..."
    npm cache clean --force
    
    # Install dependencies
    npm install
    
    if [ $? -ne 0 ]; then
        print_error "Failed to install dependencies"
        exit 1
    fi
    print_success "Dependencies installed successfully"
}

# Type checking
run_type_check() {
    print_status "✅ Running type checks..."
    
    if ! npm run type-check; then
        print_error "Type check failed"
        print_warning "Running TypeScript compiler in watch mode..."
        print_warning "Please fix type errors and press Ctrl+C to continue"
        npx tsc --watch
        exit 1
    fi
    print_success "Type check passed"
}

# Linting
run_linting() {
    print_status "🔍 Running linter..."
    
    if ! npm run lint; then
        print_warning "Linting failed. Attempting to fix automatically..."
        if ! npm run lint -- --fix; then
            print_error "Could not automatically fix all linting errors"
            print_warning "Please fix remaining linting errors manually"
            exit 1
        fi
    fi
    print_success "Linting passed"
}

# Testing
run_tests() {
    print_status "🧪 Running tests..."
    
    if ! npm run test; then
        print_error "Tests failed"
        print_warning "Please fix failing tests before building"
        exit 1
    fi
    print_success "All tests passed"
}

# Build
run_build() {
    print_status "🏗️ Running production build..."
    
    # Set production environment
    export NODE_ENV=production
    
    # Increase Node.js memory limit for large builds
    export NODE_OPTIONS="--max-old-space-size=4096"
    
    # Run build
    if ! npm run build; then
        print_error "Build failed"
        exit 1
    fi
    print_success "Build completed successfully"
}

# Analyze bundle
analyze_bundle() {
    print_status "📊 Analyzing bundle size..."
    
    if ! npm run analyze; then
        print_warning "Bundle analysis skipped - analyzer not installed"
        print_warning "To install: npm install @next/bundle-analyzer"
    fi
}

# Validate build
validate_build() {
    print_status "🔍 Validating build output..."
    
    if [ ! -d ".next" ]; then
        print_error "Build validation failed - .next directory not found"
        exit 1
    fi
    
    # Check for critical build files
    if [ ! -f ".next/BUILD_ID" ]; then
        print_error "Build validation failed - BUILD_ID not found"
        exit 1
    fi
    
    # Print build stats
    print_success "Build validation passed"
    echo -e "\n📊 Build stats:"
    du -sh .next
}

# Main execution
main() {
    # Print start time
    print_status "Starting build process at $(date)"
    
    # Run all steps
    check_requirements
    cleanup
    install_dependencies
    run_type_check
    run_linting
    run_tests
    run_build
    analyze_bundle
    validate_build
    
    # Print completion time
    print_success "Build process completed at $(date)"
}

# Run main function
main
