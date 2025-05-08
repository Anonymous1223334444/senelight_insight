// components/Welcome/WelcomeScreenContent.tsx
import { YStack, Theme, Text, XStack, Button } from 'tamagui';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'react-native';

export const ScreenContent = () => {
  const router = useRouter();
  const { bottom, top } = useSafeAreaInsets();

  return (
    <Theme name="light">
      <YStack
        flex={1}
        backgroundColor="white"
        paddingTop={top + 20}
        paddingHorizontal="$4"
        paddingBottom={bottom + 20}
        space="$6"
      >
        <YStack alignItems="center" flex={1} justifyContent="center">
          <Image
            source={require('../../assets/icone.png')}
            style={{ width: 150, height: 150, marginBottom: 40 }}
            resizeMode="contain"
          />
          <Text
            fontSize={32}
            fontWeight="bold"
            color="#4b61dc"
            textAlign="center"
            marginBottom="$2"
          >
            Bienvenue sur SeneLight Insight
          </Text>
          <Text
            fontSize={16}
            color="#666"
            textAlign="center"
            marginBottom="$6"
          >
            Suivez et signalez les problèmes d'électricité
          </Text>

          <XStack space="$4" marginTop="$6">
            <Button
              backgroundColor="#4b61dc"
              color="white"
              fontSize={16}
              fontWeight="500"
              height={50}
              paddingHorizontal="$6"
              borderRadius={10}
              onPress={() => router.push('/login')}
            >
              Se connecter
            </Button>
            <Button
              backgroundColor="#dde3fb"
              color="#4b61dc"
              fontSize={16}
              fontWeight="500"
              height={50}
              paddingHorizontal="$6"
              borderRadius={10}
              onPress={() => router.push('/register')}
            >
              S'inscrire
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </Theme>
  );
};