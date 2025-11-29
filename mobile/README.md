# Zyvra HR Mobile App 📱

This is the React Native (Expo) codebase for the Zyvra HR mobile application.

## Features
- **Native Experience**: Smooth, native UI for iOS and Android.
- **Geo-fencing**: Check-in only when near the office.
- **Self Service**: Apply for leave, view payslips, and check directory.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    cd mobile
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npx expo start
    ```

3.  **Run on Device**:
    -   Download **Expo Go** app on your phone.
    -   Scan the QR code from the terminal.

## Project Structure
-   `App.js`: Main entry point and navigation setup.
-   `src/screens/`: Individual screen components (Login, Home).
-   `src/components/`: Reusable UI components.
-   `src/api/`: API client for communicating with the backend.
