import React, { useState } from 'react';
import { YStack, Theme, Text, XStack, View, Button, Input, Separator } from 'tamagui';
import { TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { XMarkIcon } from 'react-native-heroicons/outline';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from '@apollo/client';
import { CREATE_IMPACT_TYPE_MUTATION } from '~/apollo/mutations';
import { CreateImpactTypeInput } from '~/apollo/types';
import { COLORS } from '~/constants/theme';

export default function NewImpactType() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  
  const [createImpactType, { loading }] = useMutation(CREATE_IMPACT_TYPE_MUTATION, {
    onCompleted: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    },
    refetchQueries: ['GetImpactTypes']
  });
  
  const handleSubmit = () => {
    if (!name.trim() || !emoji.trim()) return;
    
    const impactTypeInput: CreateImpactTypeInput = {
      name: name.trim(),
      emoji: emoji.trim()
    };
    
    createImpactType({
      variables: {
        createImpactTypeInput: impactTypeInput
      }
    });
  };
  
  return (
    <Theme name="light">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <YStack flex={1} backgroundColor="#fff">
          <YStack paddingTop="$2" paddingHorizontal="$4" space="$4" flex={1}>
            <XStack 
              alignItems="center" 
              justifyContent='space-between'
              paddingVertical="$2" 
              space={10}
            >
              <Text fontSize={24} fontWeight="bold" color={COLORS.primary}>Nouveau type d'impact</Text>
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.primaryLight,
                  padding: 8,
                  borderRadius: 1000,
                  alignSelf: 'flex-start'
                }}
                onPress={() => router.back()}
              >
                <XMarkIcon size={25} color={COLORS.primary} /> 
              </TouchableOpacity>
            </XStack>
            
            <YStack space="$4">
              <YStack space="$2">
                <Text fontSize={16} fontWeight="500" color={COLORS.primary}>Nom</Text>
                <Input
                  backgroundColor="white"
                  borderWidth={1}
                  borderColor={COLORS.border}
                  height={50}
                  paddingHorizontal={16}
                  fontSize={16}
                  fontWeight={'500'}
                  placeholder="Ex: Appareils endommagés"
                  value={name}
                  onChangeText={setName}
                />
              </YStack>
              
              <YStack space="$2">
                <Text fontSize={16} fontWeight="500" color={COLORS.primary}>Emoji</Text>
                <Input
                  backgroundColor="white"
                  borderWidth={1}
                  borderColor={COLORS.border}
                  height={50}
                  paddingHorizontal={16}
                  fontSize={16}
                  fontWeight={'500'}
                  placeholder="Ex: 🔌"
                  value={emoji}
                  onChangeText={setEmoji}
                />
              </YStack>
            </YStack>
            
            <XStack position="absolute" bottom={20 + bottom} left={16} right={16}>
              <Button
                backgroundColor={COLORS.primary}
                color="white"
                fontSize={16}
                fontWeight="500"
                height={50}
                flex={1}
                onPress={handleSubmit}
                disabled={loading || !name.trim() || !emoji.trim()}
                opacity={(loading || !name.trim() || !emoji.trim()) ? 0.5 : 1}
                borderRadius={10}
              >
                {loading ? "Création..." : "Créer"}
              </Button>
            </XStack>
          </YStack>
        </YStack>
      </KeyboardAvoidingView>
    </Theme>
  );
}