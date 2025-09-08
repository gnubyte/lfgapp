#!/bin/bash

# LFG App Build Script
# This script handles the complete build process for the LFG React Native app

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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -f "app.json" ]; then
        print_error "Please run this script from the LFG app root directory"
        exit 1
    fi
    
    # Check for Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check for npm
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check for Expo CLI
    if ! command_exists npx; then
        print_error "npx is not available. Please install npm first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        npm install
        print_success "Dependencies installed"
    else
        print_status "Dependencies already up to date"
    fi
}

# Function to start the development server
start_dev_server() {
    print_status "Starting development server..."
    
    # Check if proxy server is running
    if ! lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null; then
        print_status "Starting CORS proxy server..."
        npm run proxy &
        PROXY_PID=$!
        sleep 2
    fi
    
    # Start Expo development server
    print_status "Starting Expo development server..."
    npx expo start --clear
}

# Function to build for iOS
build_ios() {
    print_status "Building for iOS..."
    
    # Check if we're on macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_error "iOS builds are only supported on macOS"
        exit 1
    fi
    
    # Check for Xcode
    if ! command_exists xcodebuild; then
        print_error "Xcode is not installed. Please install Xcode from the App Store."
        exit 1
    fi
    
    # Build for iOS
    npx expo run:ios --configuration Release
    print_success "iOS build completed"
}

# Function to build for Android
build_android() {
    print_status "Building for Android..."
    
    # Check for Android SDK
    if [ -z "$ANDROID_HOME" ]; then
        print_warning "ANDROID_HOME not set. Make sure Android SDK is installed."
    fi
    
    # Build for Android
    npx expo run:android --variant release
    print_success "Android build completed"
}

# Function to create production build
build_production() {
    print_status "Creating production build..."
    
    # Build for both platforms
    build_ios
    build_android
    
    print_success "Production build completed for both platforms"
}

# Function to clean build artifacts
clean_build() {
    print_status "Cleaning build artifacts..."
    
    # Clean Expo cache
    npx expo r -c
    
    # Clean node modules
    rm -rf node_modules
    npm install
    
    # Clean iOS build
    if [[ "$OSTYPE" == "darwin"* ]]; then
        rm -rf ios/build
    fi
    
    # Clean Android build
    rm -rf android/app/build
    
    print_success "Build artifacts cleaned"
}

# Function to show help
show_help() {
    echo "LFG App Build Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev         Start development server with hot reload"
    echo "  ios         Build and run on iOS simulator/device"
    echo "  android     Build and run on Android emulator/device"
    echo "  production  Create production builds for both platforms"
    echo "  clean       Clean all build artifacts and reinstall dependencies"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev          # Start development server"
    echo "  $0 ios          # Build and run on iOS"
    echo "  $0 android      # Build and run on Android"
    echo "  $0 production   # Create production builds"
    echo "  $0 clean        # Clean everything and reinstall"
}

# Main script logic
main() {
    case "${1:-dev}" in
        "dev")
            check_prerequisites
            install_dependencies
            start_dev_server
            ;;
        "ios")
            check_prerequisites
            install_dependencies
            build_ios
            ;;
        "android")
            check_prerequisites
            install_dependencies
            build_android
            ;;
        "production")
            check_prerequisites
            install_dependencies
            build_production
            ;;
        "clean")
            clean_build
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Trap to kill background processes on exit
trap 'if [ ! -z "$PROXY_PID" ]; then kill $PROXY_PID 2>/dev/null; fi' EXIT

# Run main function with all arguments
main "$@"
