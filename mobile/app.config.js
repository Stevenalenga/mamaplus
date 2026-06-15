export default {
  expo: {
    name: 'MamaPlus Mobile',
    slug: 'mamaplus-mobile',
    scheme: 'mamaplus',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.mamaplus.mobile'
    },
    android: {
      package: 'com.mamaplus.mobile',
      predictiveBackGestureEnabled: false,
      adaptiveIcon: {
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
        backgroundColor: '#E6F4FE'
      }
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: [
      'expo-secure-store',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#ffffff',
          image: './assets/splash-icon.png',
          resizeMode: 'contain',
          imageWidth: 200
        }
      ]
    ],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
      expoGoogleClientId:
        process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
        process.env.EXPO_GOOGLE_CLIENT_ID ||
        process.env.GOOGLE_CLIENT_ID ||
        '',
      expoGoogleWebClientId:
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
        process.env.EXPO_GOOGLE_WEB_CLIENT_ID ||
        process.env.GOOGLE_CLIENT_ID ||
        '',
      expoGoogleIosClientId:
        process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
        process.env.EXPO_GOOGLE_IOS_CLIENT_ID ||
        '',
      expoGoogleAndroidClientId:
        process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
        process.env.EXPO_GOOGLE_ANDROID_CLIENT_ID ||
        '',
      expoMicrosoftClientId:
        process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID ||
        process.env.EXPO_MICROSOFT_CLIENT_ID ||
        process.env.AZURE_AD_CLIENT_ID ||
        ''
    }
  }
}
