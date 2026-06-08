import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native'

export default function LoadingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#2f6cb3" />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
