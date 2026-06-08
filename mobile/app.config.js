export default {
  expo: {
    sdkVersion: '54.0.8',
    name: 'MamaPlus Mobile',
    slug: 'mamaplus-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        backgroundColor: '#FFFFFF'
      }
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000',
      expoGoogleClientId: process.env.EXPO_GOOGLE_CLIENT_ID || '',
      expoGoogleWebClientId: process.env.EXPO_GOOGLE_WEB_CLIENT_ID || '',
      expoMicrosoftClientId: process.env.EXPO_MICROSOFT_CLIENT_ID || ''
    }
  }
}
