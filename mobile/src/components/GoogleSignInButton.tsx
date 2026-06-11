import { useEffect } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import * as Google from 'expo-auth-session/providers/google'
import { socialSignIn } from '../api/client'
import { getOAuthExtra, isGoogleAuthConfigured } from '../constants'
import { useAuth } from '../context/AuthContext'

type Props = {
  label?: string
  onError: (message: string) => void
}

function GoogleSignInButtonInner({
  label = 'Sign in with Google',
  onError
}: Props) {
  const { signInWithSocial } = useAuth()
  const extra = getOAuthExtra()

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: extra.expoGoogleClientId || undefined,
    webClientId: extra.expoGoogleWebClientId || undefined,
    iosClientId: extra.expoGoogleIosClientId || undefined,
    androidClientId: extra.expoGoogleAndroidClientId || undefined,
    scopes: ['openid', 'profile', 'email']
  })

  useEffect(() => {
    async function handleGoogleResponse() {
      if (response?.type !== 'success') return

      const { id_token } = response.params as { id_token?: string }
      if (!id_token) {
        onError('Google sign-in did not return an ID token')
        return
      }

      try {
        const res = await socialSignIn('google', { idToken: id_token })
        await signInWithSocial(res.data)
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Google sign-in failed')
      }
    }

    handleGoogleResponse()
  }, [response, onError, signInWithSocial])

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => promptAsync()}
      disabled={!request}
    >
      <Text style={styles.googleIcon}>G</Text>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  )
}

export default function GoogleSignInButton(props: Props) {
  if (!isGoogleAuthConfigured()) {
    return (
      <TouchableOpacity
        style={[styles.button, styles.buttonDisabled]}
        onPress={() =>
          props.onError(
            'Google sign-in is not configured. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID for web or EXPO_PUBLIC_GOOGLE_CLIENT_ID for native.'
          )
        }
      >
        <Text style={styles.googleIcon}>G</Text>
        <Text style={styles.buttonText}>{props.label ?? 'Sign in with Google'}</Text>
      </TouchableOpacity>
    )
  }

  return <GoogleSignInButtonInner {...props} />
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10
  },
  buttonDisabled: {
    opacity: 0.7
  },
  buttonText: {
    color: '#0f172a',
    fontWeight: '600'
  },
  googleIcon: {
    color: '#DB4437',
    fontSize: 18,
    fontWeight: '800'
  }
})
