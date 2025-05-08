import { Stack } from 'expo-router';
import { YStack, Theme, Image, View, Text, Button, Input, XStack } from 'tamagui';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '~/apollo/mutations';
import { useAuthStore } from '~/store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EnvelopeIcon, LockClosedIcon } from 'react-native-heroicons/outline';
import { COLORS } from '~/constants/theme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function Login() {
  const { bottom, top } = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const minSpacing = Math.min(screenHeight * 0.5, -10);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuthStore();

  // Version simplifiée sans typage générique complexe
  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: async (data) => {
      const { access_token, user } = data.login;
      await AsyncStorage.setItem('auth_token', access_token);
      login(access_token, user);
      
      router.replace('/(authenticated)/(tabs)');
    },
    onError: (error) => {
      Alert.alert(
        'Erreur de connexion', 
        error.message || 'Une erreur est survenue'
      );
    }
  });

  const handleLogin = () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre email');
      return;
    }
    if (!password) {
      Alert.alert('Erreur', 'Veuillez entrer votre mot de passe');
      return;
    }
    
    loginMutation({
      variables: {
        loginInput: { email, password }
      }
    });
  };

  return (
    <Theme name="light">
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <YStack flex={1} padding="$4" space={minSpacing}>
          <YStack 
            flex={1} 
            alignItems="center" 
            justifyContent="center" 
            paddingTop={top}
          >
            <Image 
              source={require('~/assets/icon.png')}
              width={150}
              height={150}
            />
            <Text
              fontSize={28}
              fontWeight="bold"
              color={COLORS.primary}
              marginTop="$4"
            >
              SeneLight
            </Text>
          </YStack>

          <YStack paddingBottom={bottom}>
            <View
              padding={"$4"}
              borderRadius={"$10"}
              backgroundColor={COLORS.primaryLight}
            >
              <Text
                fontSize={24}
                fontWeight={"bold"}
                textAlign={"center"}
                marginBottom={"$2"}
                color={COLORS.primary}
              >
                Bienvenue
              </Text>
              <Text
                fontSize={16}
                textAlign={"center"}
                marginBottom={"$4"}
                color={COLORS.textSecondary}
              >
                Connectez-vous pour continuer
              </Text>
              
              <View position="relative" marginBottom="$4">
                <View 
                  position="absolute" 
                  left={16} 
                  top={0}
                  bottom={0}
                  zIndex={1}
                  justifyContent="center"
                >
                  <EnvelopeIcon size={20} color={COLORS.textTertiary} />
                </View>
                <Input
                  backgroundColor="white"
                  borderRadius={10}
                  borderWidth={1}
                  borderColor={COLORS.border}
                  height={50}
                  paddingLeft={45}
                  paddingRight={16}
                  fontSize={16}
                  fontWeight="500"
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View position="relative" marginBottom="$4">
                <View 
                  position="absolute" 
                  left={16} 
                  top={0}
                  bottom={0}
                  zIndex={1}
                  justifyContent="center"
                >
                  <LockClosedIcon size={20} color={COLORS.textTertiary} />
                </View>
                <Input
                  backgroundColor="white"
                  borderRadius={10}
                  borderWidth={1}
                  borderColor={COLORS.border}
                  height={50}
                  paddingLeft={45}
                  paddingRight={16}
                  fontSize={16}
                  fontWeight="500"
                  placeholder="Mot de passe"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <Button 
                backgroundColor={COLORS.primary}
                color="white"
                size="$4"
                fontWeight="bold"
                marginBottom={"$4"}
                onPress={handleLogin}
                disabled={loading}
                opacity={loading ? 0.7 : 1}
              >
                {loading ? (
                  <XStack space="$2" justifyContent="center" alignItems="center">
                    <ActivityIndicator size="small" color="white" />
                    <Text color="white" fontWeight="bold">Connexion...</Text>
                  </XStack>
                ) : (
                  "Se connecter"
                )}
              </Button>
              
              <View paddingBottom={"$2"}>
                <Link href={{ pathname: '/register' }} asChild>
                  <Text 
                    color={COLORS.primary} 
                    textAlign='center'
                    fontWeight="500"
                  >
                    Vous n'avez pas de compte ? S'inscrire
                  </Text>
                </Link>
              </View>
            </View>
          </YStack>
        </YStack>
      </KeyboardAwareScrollView>
    </Theme>
  );
}