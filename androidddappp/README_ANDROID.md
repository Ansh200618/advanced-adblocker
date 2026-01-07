# Android Ad Blocker - Build Instructions

## 📱 Complete Android Studio Project

This is a fully functional Android ad blocker app with WebView-based content blocking.

### ✅ Features

- **201+ Filter Rules** (EasyList, EasyPrivacy, Annoyances, Social, Security)
- **WebView Integration** with ad request interception
- **Material Design 3 UI** with dark/light theme support
- **Real-time Statistics** tracking blocked ads and trackers
- **Custom Filter Support** for user-defined rules
- **Settings Page** with preferences
- **Production Ready** with ProGuard rules for release builds

### 🏗️ Build Instructions

#### Prerequisites
- **Android Studio**: Latest version (Hedgehog 2023.1.1 or newer)
- **JDK**: Version 11 or higher
- **Minimum SDK**: Android 7.0 (API 24)
- **Target SDK**: Android 14 (API 34)

#### Step-by-Step Build Process

1. **Install Android Studio**
   ```
   Download from: https://developer.android.com/studio
   Run installer and choose "Standard" installation
   ```

2. **Open Project**
   ```
   - Launch Android Studio
   - Click "Open" button
   - Navigate to this folder (androidddappp)
   - Click "OK"
   ```

3. **Wait for Gradle Sync**
   ```
   - First sync takes 5-10 minutes (downloads dependencies)
   - Status bar shows "Syncing..." → "Ready" when complete
   - If sync fails, click "Try Again" in the notification
   ```

4. **Build APK**
   ```
   Menu: Build → Build Bundle(s) / APK(s) → Build APK(s)
   Wait 2-3 minutes for build to complete
   Notification appears: "BUILD SUCCESSFUL"
   ```

5. **Locate APK**
   ```
   APK Location: androidddappp/app/build/outputs/apk/debug/app-debug.apk
   Click "locate" link in build notification to open folder
   ```

6. **Install on Android Device**
   
   **Option A - Direct Install (Recommended)**
   ```
   - Connect Android device via USB
   - Enable USB debugging on device (Settings → Developer Options)
   - In Android Studio, click Run button (green play icon)
   - Select your device from the list
   - App installs and launches automatically
   ```

   **Option B - Manual Install**
   ```
   - Copy app-debug.apk to your Android device
   - Open file browser on device
   - Tap on app-debug.apk
   - Enable "Install from unknown sources" if prompted
   - Tap "Install"
   ```

### 🔧 Build Variants

**Debug Build** (for testing)
```
Build → Build APK
Output: app/build/outputs/apk/debug/app-debug.apk
Size: ~4 MB
```

**Release Build** (for distribution)
```
Build → Generate Signed Bundle / APK
Select "APK"
Create keystore (first time only)
Output: app/build/outputs/apk/release/app-release.apk
Size: ~2 MB (with ProGuard optimization)
```

### 📦 Project Structure

```
androidddappp/
├── app/
│   ├── src/main/
│   │   ├── java/com/adblocker/app/
│   │   │   ├── MainActivity.kt           (Main WebView activity)
│   │   │   ├── SettingsActivity.kt       (Settings UI)
│   │   │   ├── FilterActivity.kt         (Custom filters)
│   │   │   ├── FilterManager.kt          (Ad blocking logic)
│   │   │   └── StatsManager.kt           (Statistics tracking)
│   │   ├── res/
│   │   │   ├── layout/                   (UI layouts)
│   │   │   ├── values/                   (Strings, colors, themes)
│   │   │   ├── menu/                     (Action bar menu)
│   │   │   └── xml/                      (Preferences)
│   │   ├── assets/filters/               (Filter rule files)
│   │   └── AndroidManifest.xml           (App configuration)
│   ├── build.gradle                      (App build config)
│   └── proguard-rules.pro                (Code optimization)
├── gradle/                               (Gradle wrapper)
├── build.gradle                          (Project build config)
├── settings.gradle                       (Project settings)
└── gradle.properties                     (Gradle properties)
```

### 🔍 Troubleshooting

**Gradle Sync Failed**
```
- Check internet connection (Gradle needs to download dependencies)
- File → Invalidate Caches → Invalidate and Restart
- Update Gradle version in gradle/wrapper/gradle-wrapper.properties
```

**Build Failed**
```
- Clean project: Build → Clean Project
- Rebuild: Build → Rebuild Project
- Check Gradle Console for specific errors
```

**APK Install Failed on Device**
```
- Enable "Unknown sources" in device settings
- Uninstall previous version if exists
- Check device has enough storage space
- Ensure USB debugging is enabled
```

**App Crashes on Launch**
```
- Check Logcat in Android Studio for error messages
- Ensure device runs Android 7.0 (API 24) or higher
- Clear app data: Settings → Apps → Ad Blocker → Clear Data
```

### 📱 Supported Android Versions

- **Minimum**: Android 7.0 (Nougat, API 24) - 94% device coverage
- **Target**: Android 14 (API 34) - Latest features
- **Recommended**: Android 9.0+ for best performance

### 🚀 Usage After Install

1. **Launch App**: Tap "Ad Blocker" icon
2. **Browse Web**: Use built-in WebView browser
3. **View Stats**: Tap floating info button (bottom-right)
4. **Adjust Settings**: Menu → Settings
5. **Add Custom Filters**: Menu → Custom Filters
6. **Toggle Blocking**: Menu → Toggle Ad Blocking

### 📊 Features Overview

**Ad Blocking**
- Intercepts HTTP requests in WebView
- Checks against 201+ filter rules
- Blocks ads, trackers, malware, annoyances
- Real-time statistics tracking

**Custom Filters**
- Add your own blocking rules
- Supports filter list syntax
- Example: `||ads.example.com^`
- Persistent across app restarts

**Settings**
- Enable/Disable ad blocking
- Block trackers toggle
- Block annoyances toggle
- Reset statistics
- Dark/Light theme (follows system)

### 🔒 Permissions

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

**Why these permissions?**
- `INTERNET`: Required for WebView to load websites
- `ACCESS_NETWORK_STATE`: Check network connectivity

**Privacy**: App does NOT collect or transmit any user data. All blocking happens locally on device.

### 📝 License

Same as parent project. See LICENSE file in root directory.

### 🆘 Support

If you encounter issues:
1. Check this README's Troubleshooting section
2. Clean and rebuild the project
3. Update Android Studio to latest version
4. Check Android Studio's Logcat for error messages

### ✅ Build Checklist

- [x] Android Studio installed
- [x] JDK 11+ installed
- [x] Project opened in Android Studio
- [x] Gradle sync completed successfully
- [x] Build completed without errors
- [x] APK file generated
- [x] APK installed on Android device
- [x] App launches successfully
- [x] Ad blocking works in WebView

**Congratulations! You've successfully built the Android Ad Blocker app!** 🎉
