import '../polyfills'; 
import 'react-native-get-random-values';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { TamaguiProvider } from 'tamagui';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from "expo-status-bar";
import { ApolloProvider } from '@apollo/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Slot, useRouter, useSegments } from "expo-router";
import { View } from 'tamagui';
import NetInfo from '@react-native-community/netinfo';

import { client, setupCache, handleNetworkStatusChange } from '../apollo/client';
import config from '../tamagui.config';
import { useAuthStore } from '~/store/authStore';
import { useReportsStore } from '~/store/reportsStore';

function RootLayoutNav() {
  const { isAuthenticated, checkAuth } = useAuthStore(state => ({
    isAuthenticated: state.isAuthenticated,
    checkAuth: state.checkAuth
  }));
  const { loadPendingReports } = useReportsStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await checkAuth();
        await loadPendingReports();
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
      }
    };
    
    verifyAuth();
  }, [checkAuth, loadPendingReports]);

  useEffect(() => {
    const inAuthGroup = segments[0] === "(authenticated)";

    if (!isAuthenticated && inAuthGroup) {
      router.replace("/login");
    } else if (isAuthenticated && !inAuthGroup) {
      router.replace("/(authenticated)/(tabs)");
    }
  }, [isAuthenticated, segments]);

  // Monitor network status
  useEffect(() => {
    // Initialize cache
    setupCache();
    
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      handleNetworkStatusChange(!!state.isConnected);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View flex={1} backgroundColor="white">
      <Slot />
    </View>
  );
}

export default function Layout() {
  const [loaded] = useFonts({
    'Inter': require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    'Inter-Medium': require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    'Inter-Bold': require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ApolloProvider client={client}>
          <TamaguiProvider config={config}>
            <BottomSheetModalProvider>
              <StatusBar style="auto" />
              <RootLayoutNav />
            </BottomSheetModalProvider>
          </TamaguiProvider>
        </ApolloProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}