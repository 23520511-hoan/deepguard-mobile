import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from './_store/appStore';

export default function RootLayout() {
  const theme = useAppStore((s) => s.theme);
  return (
    <SafeAreaProvider>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="index" />
        <Stack.Screen name="prepare" />
        <Stack.Screen name="processing" />
        <Stack.Screen name="result" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="history" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="about" />
      </Stack>
    </SafeAreaProvider>
  );
}
