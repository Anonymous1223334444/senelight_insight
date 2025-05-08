import { Stack } from 'expo-router';
import { YStack, H2, Theme, Image, Paragraph, View, Text, Button } from 'tamagui';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  Easing,
  interpolate
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { COLORS } from '~/constants/theme';

export default function Welcome() {
  const { bottom, top } = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const minSpacing = Math.min(screenHeight * 0.5, -10);

  const imageAnimation = useSharedValue(0);
  
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      opacity: imageAnimation.value,
      transform: [
        { scale: interpolate(imageAnimation.value, [0, 1], [0.8, 1]) }
      ]
    };
  });
  
  const textContainerAnimation = useSharedValue(0);
  
  const animatedTextContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(textContainerAnimation.value, [0, 1], [0, 1]),
      transform: [
        { translateY: interpolate(textContainerAnimation.value, [0, 1], [30, 0]) }
      ]
    };
  });
  
  useEffect(() => {
    imageAnimation.value = withTiming(1, { 
      duration: 800, 
      easing: Easing.out(Easing.quad) 
    });
    
    textContainerAnimation.value = withDelay(
      400, 
      withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
    );
  }, []);
  
  return (
    <Theme name="light">
      <Stack.Screen options={{ headerShown: false }} />
      <YStack flex={1} padding="$4" space={minSpacing}>
        <YStack 
          flex={1} 
          alignItems="center" 
          justifyContent="center" 
          paddingTop={top}
        >
          <Animated.View style={animatedImageStyle}>
            <Image 
              source={require('~/assets/electricity.png')}
              width={300}
              height={300}
            />
          </Animated.View>
        </YStack>
        
        <Animated.View style={animatedTextContainerStyle}>
          <YStack paddingBottom={bottom}>
            <View
              padding={"$3"}
              borderRadius={"$10"}
              backgroundColor={COLORS.primaryLight}
            >
              <H2 
                color={COLORS.primary} 
                textAlign="center"
                fontSize="$10"
                fontWeight="bold"
                paddingHorizontal={"$8"}
                paddingTop={"$2"}
                marginTop={"$2"}
              >
                SeneLight Insight
              </H2>
              <Paragraph
                color={COLORS.textPrimary}
                textAlign="center"
                fontSize="$4"
                fontWeight={500}
                marginBottom={"$3"}
                paddingHorizontal={"$4"}
              >
                Signaler les coupures d'électricité, partager votre expérience et contribuer à améliorer le service de SENELEC
              </Paragraph>
              <Link href={{ pathname: '/login'}} asChild>
                <Button 
                  backgroundColor={COLORS.primary}
                  color="white"
                  size="$4"
                  fontWeight="bold"
                  marginVertical="$2"
                >
                  Commencer
                </Button>
              </Link>
            </View>
          </YStack>
        </Animated.View>
      </YStack>
    </Theme>
  );
}