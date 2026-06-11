import { useEffect } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import * as AuthSession from 'expo-auth-session'
import { socialSignIn } from '../api/client'
import { getOAuthExtra, isMicrosoftAuthConfigured } from '../constants'
import { useAuth } from '../context/AuthContext'

type Props = {
  label?: string
  onError: (message: string) => void
}

const msDiscovery = {
  authorizationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
}

function MicrosoftSignInButtonInner({
  label = 'Sign in with Microsoft',
  onError
}: Props) {
  const { signInWithSocial } = useAuth()
  const extra = getOAuthExtra()
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'mamaplus' })

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: extra.expoMicrosoftClientId || undefined,
      scopes: ['openid', 'profile', 'User.Read'],
      redirectUri,
      responseType: AuthSession.ResponseType.Token
    },
    msDiscovery
  )

  useEffect(() => {
    async function handleMicrosoftResponse() {
      if (response?.type !== 'success') return

      const { access_token } = response.params as { access_token?: string }
      if (!access_token) {
        onError('Microsoft sign-in did not return an access token')
        return
      }

      try {
        const res = await socialSignIn('microsoft', { accessToken: access_token })
        await signInWithSocial(res.data)
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Microsoft sign-in failed')
      }
    }

    handleMicrosoftResponse()
  }, [response, onError, signInWithSocial])

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => promptAsync()}
      disabled={!request}
    >
      <Text style={styles.microsoftIcon}>◼</Text>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  )
}

export default function MicrosoftSignInButton(props: Props) {
  if (!isMicrosoftAuthConfigured()) {
    return (
      <TouchableOpacity
        style={[styles.button, styles.buttonDisabled]}
        onPress={() =>
          props.onError('Microsoft sign-in is not configured. Set EXPO_PUBLIC_MICROSOFT_CLIENT_ID.')
        }
      >
        <Text style={styles.microsoftIcon}>◼</Text>
        <Text style={styles.buttonText}>{props.label ?? 'Sign in with Microsoft'}</Text>
      </TouchableOpacity>
    )
  }

  return <MicrosoftSignInButtonInner {...props} />
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
  microsoftIcon: {
    color: '#2F2F90',
    fontSize: 14,
    fontWeight: '700'
  }
})
