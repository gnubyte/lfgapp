#!/bin/bash

# LFG Android Development Script
# This script handles Android-specific development tasks

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

# Function to check Android prerequisites
check_android_prerequisites() {
    print_status "Checking Android development prerequisites..."
    
    # Check for Java
    if ! command_exists java; then
        print_error "Java is not installed. Please install Java JDK 17 or later."
        exit 1
    fi
    
    # Check Java version
    JAVA_VERSION=$(java -version 2>&1 | head -n1 | awk -F '"' '{print $2}')
    print_status "Java version: $JAVA_VERSION"
    
    # Check for Android SDK
    if [ -z "$ANDROID_HOME" ]; then
        print_error "ANDROID_HOME environment variable is not set."
        print_status "Please set ANDROID_HOME to your Android SDK path."
        print_status "Example: export ANDROID_HOME=/Users/$(whoami)/Library/Android/sdk"
        exit 1
    fi
    
    if [ ! -d "$ANDROID_HOME" ]; then
        print_error "Android SDK not found at $ANDROID_HOME"
        exit 1
    fi
    
    print_status "Android SDK found at: $ANDROID_HOME"
    
    # Check for Android SDK tools
    if [ ! -d "$ANDROID_HOME/platform-tools" ]; then
        print_error "Android platform-tools not found. Please install Android SDK Platform-Tools."
        exit 1
    fi
    
    # Check for Android build tools
    if [ ! -d "$ANDROID_HOME/build-tools" ]; then
        print_error "Android build-tools not found. Please install Android SDK Build-Tools."
        exit 1
    fi
    
    # Check for Android platforms
    if [ ! -d "$ANDROID_HOME/platforms" ]; then
        print_error "Android platforms not found. Please install Android SDK Platform."
        exit 1
    fi
    
    # Add Android tools to PATH
    export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH"
    
    # Check for adb
    if ! command_exists adb; then
        print_error "adb not found. Please install Android SDK Platform-Tools."
        exit 1
    fi
    
    # Check for Android emulator
    if ! command_exists emulator; then
        print_warning "Android emulator not found. You may need to install Android SDK Emulator."
    fi
    
    print_success "Android prerequisites check passed"
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

# Function to list Android devices
list_devices() {
    print_status "Listing Android devices..."
    
    # List connected devices
    adb devices
    
    # List available emulators
    if command_exists emulator; then
        print_status "Available Android emulators:"
        emulator -list-avds
    fi
}

# Function to start Android emulator
start_emulator() {
    print_status "Starting Android emulator..."
    
    if ! command_exists emulator; then
        print_error "Android emulator not found. Please install Android SDK Emulator."
        exit 1
    fi
    
    # List available AVDs
    AVD_LIST=$(emulator -list-avds)
    if [ -z "$AVD_LIST" ]; then
        print_error "No Android Virtual Devices found. Please create an AVD first."
        print_status "You can create an AVD using Android Studio or the command line."
        exit 1
    fi
    
    # Get the first available AVD
    AVD_NAME=$(echo "$AVD_LIST" | head -n1)
    print_status "Starting emulator: $AVD_NAME"
    
    # Start emulator in background
    emulator -avd "$AVD_NAME" &
    EMULATOR_PID=$!
    
    # Wait for emulator to boot
    print_status "Waiting for emulator to boot..."
    adb wait-for-device
    
    # Wait for emulator to be ready
    print_status "Waiting for emulator to be ready..."
    adb shell 'while [[ -z $(getprop sys.boot_completed) ]]; do sleep 1; done'
    
    print_success "Android emulator started and ready"
}

# Function to run on Android emulator
run_android_emulator() {
    print_status "Running on Android emulator..."
    
    # Check if emulator is running
    if ! adb devices | grep -q "emulator"; then
        print_status "No emulator running, starting one..."
        start_emulator
    fi
    
    # Run on Android
    npx expo run:android
    print_success "Android app launched on emulator"
}

# Function to run on physical Android device
run_android_device() {
    print_status "Running on physical Android device..."
    
    # Check if device is connected
    if ! adb devices | grep -q "device$"; then
        print_error "No Android devices connected. Please connect your device and enable USB debugging."
        print_status "Make sure USB debugging is enabled in Developer Options."
        exit 1
    fi
    
    # Run on Android device
    npx expo run:android --device
    print_success "Android app launched on device"
}

# Function to build for Android
build_android() {
    print_status "Building Android app..."
    
    # Build for Android
    npx expo run:android --variant release
    print_success "Android build completed"
}

# Function to open Android project in Android Studio
open_android_studio() {
    print_status "Opening Android project in Android Studio..."
    
    if [ -d "android" ]; then
        if command_exists studio; then
            studio android
            print_success "Android project opened in Android Studio"
        else
            print_warning "Android Studio command not found. Please open Android Studio manually and open the 'android' folder."
        fi
    else
        print_error "Android project not found. Run 'npx expo run:android' first to generate the Android project."
        exit 1
    fi
}

# Function to clean Android build
clean_android() {
    print_status "Cleaning Android build..."
    
    # Clean Expo cache
    npx expo r -c
    
    # Clean Android build directory
    if [ -d "android" ]; then
        cd android
        ./gradlew clean
        cd ..
        print_success "Android build cleaned"
    else
        print_status "No Android project found to clean"
    fi
}

# Function to show Android logs
show_android_logs() {
    print_status "Showing Android logs..."
    
    # Check if device is connected
    if ! adb devices | grep -q "device$"; then
        print_error "No Android devices connected"
        exit 1
    fi
    
    # Show logs for the app
    adb logcat | grep -E "(LFG|ReactNative|Expo)"
}

# Function to install APK on device
install_apk() {
    print_status "Installing APK on device..."
    
    # Find the APK file
    APK_FILE=$(find android -name "*.apk" -type f | head -1)
    
    if [ -z "$APK_FILE" ]; then
        print_error "No APK file found. Please build the app first."
        exit 1
    fi
    
    # Install APK
    adb install -r "$APK_FILE"
    print_success "APK installed on device"
}

# Function to show help
show_help() {
    echo "LFG Android Development Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev         Start development server and run on Android emulator"
    echo "  emulator    Run on Android emulator only"
    echo "  device      Run on physical Android device"
    echo "  build       Build Android app for release"
    echo "  studio      Open Android project in Android Studio"
    echo "  clean       Clean Android build artifacts"
    echo "  logs        Show Android device logs"
    echo "  install     Install APK on connected device"
    echo "  list        List connected devices and emulators"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev          # Start dev server and run on emulator"
    echo "  $0 emulator     # Run on Android emulator"
    echo "  $0 device       # Run on physical device"
    echo "  $0 build        # Build for release"
    echo "  $0 studio       # Open in Android Studio"
    echo "  $0 logs         # Show device logs"
    echo "  $0 install      # Install APK on device"
}

# Main script logic
main() {
    case "${1:-dev}" in
        "dev")
            check_android_prerequisites
            install_dependencies
            start_proxy
            run_android_emulator
            ;;
        "emulator")
            check_android_prerequisites
            install_dependencies
            start_proxy
            run_android_emulator
            ;;
        "device")
            check_android_prerequisites
            install_dependencies
            start_proxy
            run_android_device
            ;;
        "build")
            check_android_prerequisites
            install_dependencies
            build_android
            ;;
        "studio")
            open_android_studio
            ;;
        "clean")
            clean_android
            ;;
        "logs")
            show_android_logs
            ;;
        "install")
            install_apk
            ;;
        "list")
            list_devices
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
trap 'if [ ! -z "$EMULATOR_PID" ]; then kill $EMULATOR_PID 2>/dev/null; fi' EXIT

# Run main function with all arguments
main "$@"
