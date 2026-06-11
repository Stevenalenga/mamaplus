import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import GoogleSignInButton from './GoogleSignInButton'
import MicrosoftSignInButton from './MicrosoftSignInButton'

type Props = {
  mode: 'login' | 'register'
  onError: (message: string) => void
}

export default function SocialAuthSection({ mode, onError }: Props) {
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession()
  }, [])

  const googleLabel = mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'
  const microsoftLabel = mode === 'login' ? 'Sign in with Microsoft' : 'Sign up with Microsoft'

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleSignInButton label={googleLabel} onError={onError} />
      <MicrosoftSignInButton label={microsoftLabel} onError={onError} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0'
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#64748b',
    fontSize: 14
  }
})
