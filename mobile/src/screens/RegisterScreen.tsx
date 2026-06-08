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

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>

export default function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      await signUp({ email: email.trim(), password, name: name.trim(), phoneNumber: phoneNumber.trim() })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to register')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession()
  }, [])

  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    clientId: (Constants.expoConfig?.extra as any)?.expoGoogleClientId || undefined,
    webClientId: (Constants.expoConfig?.extra as any)?.expoGoogleWebClientId || undefined,
    scopes: ['openid', 'profile', 'email']
  })

  useEffect(() => {
    async function handle() {
      if (googleResponse && googleResponse.type === 'success') {
        const { id_token } = (googleResponse as any).params
        try {
          const res = await socialSignIn('google', { idToken: id_token })
          const auth = res.data
          const { saveAuthData } = await import('../api/client')
          await saveAuthData(auth)
          if (typeof window !== 'undefined') window.location.reload()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Google sign-up failed')
        }
      }
    }
    handle()
  }, [googleResponse])

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
          const { saveAuthData } = await import('../api/client')
          await saveAuthData(auth)
          if (typeof window !== 'undefined') window.location.reload()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Microsoft sign-up failed')
        }
      }
    }
    handleMs()
  }, [msResponse])

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.wrapper}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create an account</Text>
          <Text style={styles.subtitle}>Start using MamaPlus on mobile.</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />
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
            placeholder="Phone number"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
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
            <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Register'}</Text>
          </TouchableOpacity>

          <View style={{ height: 12 }} />
          <TouchableOpacity style={[styles.button, { backgroundColor: '#DB4437' }]} onPress={() => promptGoogleAsync()} disabled={!googleRequest}>
            <Text style={styles.buttonText}>Sign up with Google</Text>
          </TouchableOpacity>

          <View style={{ height: 8 }} />
          <TouchableOpacity style={[styles.button, { backgroundColor: '#2F2F90' }]} onPress={() => promptMsAsync()} disabled={!msRequest}>
            <Text style={styles.buttonText}>Sign up with Microsoft</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerAction}>Sign in</Text>
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
    fontSize: 32,
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
