#!/bin/bash

# LFG App Setup Script
# This script helps set up the development environment

set -e  # Exit on any error

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
        
        if [ "$MAJOR_VERSION" -ge 18 ]; then
            print_success "Node.js version $NODE_VERSION is compatible"
            return 0
        else
            print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18 or later."
            return 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18 or later."
        return 1
    fi
}

# Function to check iOS prerequisites
check_ios_prerequisites() {
    print_status "Checking iOS development prerequisites..."
    
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_warning "iOS development is only supported on macOS"
        return 1
    fi
    
    if ! command_exists xcodebuild; then
        print_error "Xcode is not installed. Please install Xcode from the App Store."
        return 1
    fi
    
    XCODE_VERSION=$(xcodebuild -version | head -n1 | awk '{print $2}')
    print_success "Xcode version $XCODE_VERSION found"
    
    if ! command_exists xcrun; then
        print_error "Xcode Command Line Tools not installed. Please run: xcode-select --install"
        return 1
    fi
    
    print_success "iOS prerequisites check passed"
    return 0
}

# Function to check Android prerequisites
check_android_prerequisites() {
    print_status "Checking Android development prerequisites..."
    
    if [ -z "$ANDROID_HOME" ]; then
        print_warning "ANDROID_HOME not set. Please set it to your Android SDK path."
        print_status "Example: export ANDROID_HOME=\$HOME/Library/Android/sdk"
        return 1
    fi
    
    if [ ! -d "$ANDROID_HOME" ]; then
        print_error "Android SDK not found at $ANDROID_HOME"
        return 1
    fi
    
    print_success "Android SDK found at: $ANDROID_HOME"
    
    # Check for required tools
    if [ ! -d "$ANDROID_HOME/platform-tools" ]; then
        print_error "Android platform-tools not found. Please install Android SDK Platform-Tools."
        return 1
    fi
    
    if [ ! -d "$ANDROID_HOME/build-tools" ]; then
        print_error "Android build-tools not found. Please install Android SDK Build-Tools."
        return 1
    fi
    
    print_success "Android prerequisites check passed"
    return 0
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the LFG app root directory."
        exit 1
    fi
    
    npm install
    print_success "Dependencies installed"
}

# Function to set up environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# LFG App Environment Variables
# Development API URL (with CORS proxy)
API_BASE_URL=http://localhost:3001/api

# Production API URL
# API_BASE_URL=https://lookingforgroup.cloud/api

# Expo development
EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
EOF
        print_success "Created .env file"
    else
        print_status ".env file already exists"
    fi
    
    # Check if Android environment variables are set
    if [ -z "$ANDROID_HOME" ]; then
        print_warning "ANDROID_HOME not set. Add this to your shell profile:"
        echo "export ANDROID_HOME=\$HOME/Library/Android/sdk"
        echo "export PATH=\$PATH:\$ANDROID_HOME/emulator"
        echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
    fi
}

# Function to create development scripts
create_dev_scripts() {
    print_status "Creating development scripts..."
    
    # Make scripts executable
    chmod +x build.sh iosdev.sh android.sh release.sh
    
    print_success "Development scripts are ready"
}

# Function to run initial build
run_initial_build() {
    print_status "Running initial build..."
    
    # Clean and install
    npm run clean 2>/dev/null || true
    npm install
    
    print_success "Initial build completed"
}

# Function to show next steps
show_next_steps() {
    print_success "Setup completed! Here are your next steps:"
    echo ""
    echo "1. Start development:"
    echo "   ./build.sh dev"
    echo ""
    echo "2. iOS development:"
    echo "   ./iosdev.sh dev"
    echo ""
    echo "3. Android development:"
    echo "   ./android.sh dev"
    echo ""
    echo "4. Build for release:"
    echo "   ./release.sh all"
    echo ""
    echo "5. View documentation:"
    echo "   cat README.md"
    echo ""
    print_status "Happy coding! 🚀"
}

# Main setup function
main() {
    print_status "Setting up LFG app development environment..."
    echo ""
    
    # Check Node.js
    if ! check_node_version; then
        exit 1
    fi
    
    # Install dependencies
    install_dependencies
    
    # Set up environment
    setup_environment
    
    # Create development scripts
    create_dev_scripts
    
    # Run initial build
    run_initial_build
    
    # Check platform-specific prerequisites
    IOS_OK=false
    ANDROID_OK=false
    
    if check_ios_prerequisites; then
        IOS_OK=true
    fi
    
    if check_android_prerequisites; then
        ANDROID_OK=true
    fi
    
    echo ""
    print_status "Prerequisites Summary:"
    echo "  Node.js: ✅"
    echo "  iOS: $([ "$IOS_OK" = true ] && echo "✅" || echo "❌")"
    echo "  Android: $([ "$ANDROID_OK" = true ] && echo "✅" || echo "❌")"
    echo ""
    
    if [ "$IOS_OK" = false ] && [ "$ANDROID_OK" = false ]; then
        print_warning "Neither iOS nor Android prerequisites are met."
        print_status "You can still develop using the web version or set up the missing prerequisites."
    fi
    
    show_next_steps
}

# Run main function
main "$@"
