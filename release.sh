#!/bin/bash

# LFG Release Build Script
# This script creates production-ready builds for distribution

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
    print_status "Checking release build prerequisites..."
    
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
    
    npm install
    print_success "Dependencies installed"
}

# Function to update version
update_version() {
    print_status "Updating app version..."
    
    # Get current version
    CURRENT_VERSION=$(node -p "require('./package.json').version")
    print_status "Current version: $CURRENT_VERSION"
    
    # Ask for new version
    read -p "Enter new version (current: $CURRENT_VERSION): " NEW_VERSION
    
    if [ -z "$NEW_VERSION" ]; then
        NEW_VERSION=$CURRENT_VERSION
    fi
    
    # Update package.json
    npm version "$NEW_VERSION" --no-git-tag-version
    
    # Update app.json
    node -e "
    const fs = require('fs');
    const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    appJson.expo.version = '$NEW_VERSION';
    fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2));
    "
    
    print_success "Version updated to $NEW_VERSION"
}

# Function to build for iOS
build_ios_release() {
    print_status "Building iOS release..."
    
    # Check if we're on macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_error "iOS builds are only supported on macOS"
        return 1
    fi
    
    # Check for Xcode
    if ! command_exists xcodebuild; then
        print_error "Xcode is not installed. Please install Xcode from the App Store."
        return 1
    fi
    
    # Build for iOS
    npx expo run:ios --configuration Release
    print_success "iOS release build completed"
    
    # Create archive
    print_status "Creating iOS archive..."
    cd ios
    xcodebuild -workspace LFG.xcworkspace -scheme LFG -configuration Release -archivePath LFG.xcarchive archive
    print_success "iOS archive created: ios/LFG.xcarchive"
    cd ..
}

# Function to build for Android
build_android_release() {
    print_status "Building Android release..."
    
    # Check for Android SDK
    if [ -z "$ANDROID_HOME" ]; then
        print_warning "ANDROID_HOME not set. Make sure Android SDK is installed."
    fi
    
    # Build for Android
    npx expo run:android --variant release
    print_success "Android release build completed"
    
    # Find APK
    APK_FILE=$(find android -name "*.apk" -type f | head -1)
    if [ -n "$APK_FILE" ]; then
        print_success "Android APK created: $APK_FILE"
    fi
}

# Function to create EAS build
create_eas_build() {
    print_status "Creating EAS build..."
    
    # Check if EAS CLI is installed
    if ! command_exists eas; then
        print_status "Installing EAS CLI..."
        npm install -g @expo/eas-cli
    fi
    
    # Check if logged in
    if ! eas whoami >/dev/null 2>&1; then
        print_status "Please log in to EAS..."
        eas login
    fi
    
    # Create build
    print_status "Creating EAS build for both platforms..."
    eas build --platform all --non-interactive
    
    print_success "EAS build completed"
}

# Function to create standalone builds
create_standalone_builds() {
    print_status "Creating standalone builds..."
    
    # Build for iOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        print_status "Building standalone iOS app..."
        npx expo build:ios --type archive
        print_success "Standalone iOS build completed"
    fi
    
    # Build for Android
    print_status "Building standalone Android app..."
    npx expo build:android --type apk
    print_success "Standalone Android build completed"
}

# Function to create web build
create_web_build() {
    print_status "Creating web build..."
    
    # Build for web
    npx expo export --platform web
    print_success "Web build completed: dist/"
}

# Function to create all builds
create_all_builds() {
    print_status "Creating all builds..."
    
    # Create web build
    create_web_build
    
    # Create standalone builds
    create_standalone_builds
    
    print_success "All builds completed"
}

# Function to clean release artifacts
clean_release() {
    print_status "Cleaning release artifacts..."
    
    # Clean Expo cache
    npx expo r -c
    
    # Clean build directories
    rm -rf dist/
    rm -rf ios/build
    rm -rf android/app/build
    
    # Clean node modules
    rm -rf node_modules
    npm install
    
    print_success "Release artifacts cleaned"
}

# Function to show build info
show_build_info() {
    print_status "Build Information:"
    echo "  App Name: $(node -p "require('./app.json').expo.name")"
    echo "  Version: $(node -p "require('./app.json').expo.version")"
    echo "  Bundle ID: $(node -p "require('./app.json').expo.ios?.bundleIdentifier || 'Not set'")"
    echo "  Package Name: $(node -p "require('./app.json').expo.android?.package || 'Not set'")"
    echo "  Expo SDK: $(node -p "require('./package.json').dependencies.expo")"
    echo "  React Native: $(node -p "require('./package.json').dependencies['react-native']")"
}

# Function to show help
show_help() {
    echo "LFG Release Build Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  ios         Build iOS release"
    echo "  android     Build Android release"
    echo "  web         Build web release"
    echo "  standalone  Create standalone builds for both platforms"
    echo "  eas         Create EAS build (requires EAS CLI)"
    echo "  all         Create all builds (web + standalone)"
    echo "  version     Update app version"
    echo "  info        Show build information"
    echo "  clean       Clean all build artifacts"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 ios          # Build iOS release"
    echo "  $0 android      # Build Android release"
    echo "  $0 web          # Build web release"
    echo "  $0 standalone   # Create standalone builds"
    echo "  $0 eas          # Create EAS build"
    echo "  $0 all          # Create all builds"
    echo "  $0 version      # Update version"
    echo "  $0 info         # Show build info"
}

# Main script logic
main() {
    case "${1:-help}" in
        "ios")
            check_prerequisites
            install_dependencies
            build_ios_release
            ;;
        "android")
            check_prerequisites
            install_dependencies
            build_android_release
            ;;
        "web")
            check_prerequisites
            install_dependencies
            create_web_build
            ;;
        "standalone")
            check_prerequisites
            install_dependencies
            create_standalone_builds
            ;;
        "eas")
            check_prerequisites
            install_dependencies
            create_eas_build
            ;;
        "all")
            check_prerequisites
            install_dependencies
            create_all_builds
            ;;
        "version")
            update_version
            ;;
        "info")
            show_build_info
            ;;
        "clean")
            clean_release
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

# Run main function with all arguments
main "$@"
