import { useMemo } from 'react'
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { ROLE_DISPLAY_NAMES, ROLE_DASHBOARD_LABELS } from '../constants'

export default function DashboardScreen() {
  const { user, signOut } = useAuth()

  const roleLabel = useMemo(() => {
    if (!user) return 'Guest'
    return ROLE_DISPLAY_NAMES[user.role] ?? user.role
  }, [user])

  const description = useMemo(() => {
    if (!user) return 'Sign in to see your dashboard.'
    return ROLE_DASHBOARD_LABELS[user.role] ?? 'Your role dashboard is ready.'
  }, [user])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back, {user?.name ?? 'User'}!</Text>
        <Text style={styles.role}>Role: {roleLabel}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next steps</Text>
        <View style={styles.row}>
          <Text style={styles.item}>• Browse courses</Text>
          <Text style={styles.item}>• Track your progress</Text>
          <Text style={styles.item}>• Manage profile settings</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    marginBottom: 24,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)'
      },
      default: {
        shadowColor: '#0f172a',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4
      }
    })
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8
  },
  role: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 16
  },
  description: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 24
  },
  section: {
    marginBottom: 32
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12
  },
  row: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    gap: 12
  },
  item: {
    color: '#334155',
    fontSize: 15
  },
  signOutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  signOutText: {
    color: '#ffffff',
    fontWeight: '700'
  }
})
