#!/bin/bash

# LFG iOS Development Script
# This script handles iOS-specific development tasks

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

# Function to check iOS prerequisites
check_ios_prerequisites() {
    print_status "Checking iOS development prerequisites..."
    
    # Check if we're on macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_error "iOS development is only supported on macOS"
        exit 1
    fi
    
    # Check for Xcode
    if ! command_exists xcodebuild; then
        print_error "Xcode is not installed. Please install Xcode from the App Store."
        exit 1
    fi
    
    # Check Xcode version
    XCODE_VERSION=$(xcodebuild -version | head -n1 | awk '{print $2}')
    print_status "Xcode version: $XCODE_VERSION"
    
    # Check for iOS Simulator
    if ! command_exists xcrun; then
        print_error "xcrun is not available. Please install Xcode Command Line Tools."
        exit 1
    fi
    
    # Check for simulators
    SIMULATORS=$(xcrun simctl list devices available | grep "iPhone" | wc -l)
    if [ "$SIMULATORS" -eq 0 ]; then
        print_warning "No iOS simulators found. Please install iOS simulators from Xcode."
    else
        print_status "Found $SIMULATORS iOS simulators"
    fi
    
    print_success "iOS prerequisites check passed"
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

# Function to start CORS proxy
start_proxy() {
    print_status "Starting CORS proxy server..."
    
    # Check if proxy is already running
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null; then
        print_status "CORS proxy already running on port 3001"
        return
    fi
    
    # Start proxy in background
    npm run proxy &
    PROXY_PID=$!
    sleep 2
    
    # Check if proxy started successfully
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null; then
        print_success "CORS proxy started on port 3001"
    else
        print_error "Failed to start CORS proxy"
        exit 1
    fi
}

# Function to run on iOS simulator
run_ios_simulator() {
    print_status "Running on iOS Simulator..."
    
    # List available simulators
    print_status "Available iOS simulators:"
    xcrun simctl list devices available | grep "iPhone" | head -5
    
    # Run on iOS simulator
    npx expo run:ios --simulator
    print_success "iOS app launched on simulator"
}

# Function to run on physical iOS device
run_ios_device() {
    print_status "Running on physical iOS device..."
    
    # Check if device is connected
    DEVICES=$(xcrun devicectl list devices | grep "iPhone" | wc -l)
    if [ "$DEVICES" -eq 0 ]; then
        print_error "No iOS devices connected. Please connect your iPhone and trust this computer."
        exit 1
    fi
    
    # Run on physical device
    npx expo run:ios --device
    print_success "iOS app launched on device"
}

# Function to build for iOS
build_ios() {
    print_status "Building iOS app..."
    
    # Build for iOS
    npx expo run:ios --configuration Release
    print_success "iOS build completed"
}

# Function to open iOS project in Xcode
open_xcode() {
    print_status "Opening iOS project in Xcode..."
    
    if [ -d "ios" ]; then
        open ios/LFG.xcworkspace
        print_success "iOS project opened in Xcode"
    else
        print_error "iOS project not found. Run 'npx expo run:ios' first to generate the iOS project."
        exit 1
    fi
}

# Function to clean iOS build
clean_ios() {
    print_status "Cleaning iOS build..."
    
    # Clean Expo cache
    npx expo r -c
    
    # Clean iOS build directory
    if [ -d "ios" ]; then
        rm -rf ios/build
        print_success "iOS build cleaned"
    else
        print_status "No iOS project found to clean"
    fi
}

# Function to show iOS simulator logs
show_simulator_logs() {
    print_status "Showing iOS Simulator logs..."
    
    # Get the most recent simulator
    SIMULATOR_ID=$(xcrun simctl list devices | grep "iPhone" | grep "Booted" | head -1 | awk -F'[()]' '{print $2}')
    
    if [ -z "$SIMULATOR_ID" ]; then
        print_error "No booted iOS simulator found"
        exit 1
    fi
    
    print_status "Showing logs for simulator: $SIMULATOR_ID"
    xcrun simctl spawn "$SIMULATOR_ID" log stream --predicate 'processImagePath ENDSWITH "LFG"'
}

# Function to show help
show_help() {
    echo "LFG iOS Development Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev         Start development server and run on iOS simulator"
    echo "  simulator   Run on iOS simulator only"
    echo "  device      Run on physical iOS device"
    echo "  build       Build iOS app for release"
    echo "  xcode       Open iOS project in Xcode"
    echo "  clean       Clean iOS build artifacts"
    echo "  logs        Show iOS simulator logs"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev          # Start dev server and run on simulator"
    echo "  $0 simulator    # Run on iOS simulator"
    echo "  $0 device       # Run on physical device"
    echo "  $0 build        # Build for release"
    echo "  $0 xcode        # Open in Xcode"
    echo "  $0 logs         # Show simulator logs"
}

# Main script logic
main() {
    case "${1:-dev}" in
        "dev")
            check_ios_prerequisites
            install_dependencies
            start_proxy
            run_ios_simulator
            ;;
        "simulator")
            check_ios_prerequisites
            install_dependencies
            start_proxy
            run_ios_simulator
            ;;
        "device")
            check_ios_prerequisites
            install_dependencies
            start_proxy
            run_ios_device
            ;;
        "build")
            check_ios_prerequisites
            install_dependencies
            build_ios
            ;;
        "xcode")
            open_xcode
            ;;
        "clean")
            clean_ios
            ;;
        "logs")
            show_simulator_logs
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
