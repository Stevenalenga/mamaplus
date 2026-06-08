import { useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useAuth } from '../context/AuthContext'
import { RootStackParamList } from '../types'
import * as Google from 'expo-auth-session/providers/google'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import Constants from 'expo-constants'
import { socialSignIn } from '../api/client'

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      await signIn(email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  // Configure WebBrowser for AuthSession
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession()
  }, [])

  // Google auth request
  const googleExtra = (Constants.expoConfig?.extra as any) || {}
  const googleClientId = googleExtra.expoGoogleClientId || undefined
  const googleWebClientId = googleExtra.expoGoogleWebClientId || undefined

  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    clientId: googleClientId,
    webClientId: googleWebClientId,
    scopes: ['openid', 'profile', 'email']
  })

  useEffect(() => {
    async function handle() {
      if (googleResponse && googleResponse.type === 'success') {
        const { id_token } = (googleResponse as any).params
        try {
          const res = await socialSignIn('google', { idToken: id_token })
          const auth = res.data
          await saveAndSet(auth)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Google sign-in failed')
        }
      }
    }
    handle()
  }, [googleResponse])

  // Microsoft auth using generic AuthSession with discovery
  const msDiscovery = {
    authorizationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
  }

  const redirectUri = AuthSession.makeRedirectUri()

  const [msRequest, msResponse, promptMsAsync] = AuthSession.useAuthRequest(
    {
      clientId: (Constants.expoConfig?.extra as any)?.expoMicrosoftClientId || undefined,
      scopes: ['openid', 'profile', 'User.Read'],
      redirectUri,
      responseType: 'token'
    },
    msDiscovery
  )

  useEffect(() => {
    async function handleMs() {
      if (msResponse && msResponse.type === 'success') {
        const { access_token } = (msResponse as any).params
        try {
          const res = await socialSignIn('microsoft', { accessToken: access_token })
          const auth = res.data
          await saveAndSet(auth)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Microsoft sign-in failed')
        }
      }
    }
    handleMs()
  }, [msResponse])

  // helper to save auth from social login by calling internal AuthContext flows
  async function saveAndSet(auth: any) {
    // Reuse saveAuthData and context by calling signInRequest is complex; instead store directly
    // Import saveAuthData here dynamically to avoid cycles
    const { saveAuthData } = await import('../api/client')
    await saveAuthData(auth)
    // Reload window to let AuthProvider restore
    if (typeof window !== 'undefined') window.location.reload()
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.wrapper}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <Image source={require('../../assets/icon.png')} style={{ width: 160, height: 56, resizeMode: 'contain' }} />
          </View>
          <Text style={styles.title}>MamaPlus</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>

          <View style={{ height: 12 }} />
          <TouchableOpacity style={[styles.button, { backgroundColor: '#DB4437' }]} onPress={() => promptGoogleAsync()} disabled={!googleRequest}>
            <Text style={styles.buttonText}>Sign in with Google</Text>
          </TouchableOpacity>

          <View style={{ height: 8 }} />
          <TouchableOpacity style={[styles.button, { backgroundColor: '#2F2F90' }]} onPress={() => promptMsAsync()} disabled={!msRequest}>
            <Text style={styles.buttonText}>Sign in with Microsoft</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New here?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerAction}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  wrapper: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center'
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 24
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
    color: '#0f172a'
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700'
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  footerText: {
    color: '#64748b',
    marginRight: 8
  },
  footerAction: {
    color: '#2563eb',
    fontWeight: '600'
  },
  error: {
    color: '#b91c1c',
    marginBottom: 16,
    textAlign: 'center'
  }
})
