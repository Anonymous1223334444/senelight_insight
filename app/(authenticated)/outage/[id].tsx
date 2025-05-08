import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { YStack, XStack, Theme, Text, View, ScrollView } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowLongLeftIcon, BoltIcon, ClockIcon, MapPinIcon } from "react-native-heroicons/outline";
import { useQuery } from '@apollo/client';
import { GET_OUTAGE_QUERY } from '~/apollo/queries';
import { GetOutageResponse } from '~/apollo/types';
import { COLORS } from '~/constants/theme';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function OutageDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { top } = useSafeAreaInsets();
  const outageId = typeof id === 'string' ? parseInt(id) : parseInt(id[0]);
  
  const { loading, error, data } = useQuery<GetOutageResponse>(
    GET_OUTAGE_QUERY,
    {
      variables: { id: outageId },
      fetchPolicy: 'network-only',
    }
  );
  
  if (loading) {
    return (
      <Theme name="light">
        <YStack flex={1} backgroundColor="#f9f9f9" justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </YStack>
      </Theme>
    );
  }
  
  if (error) {
    return (
      <Theme name="light">
        <YStack flex={1} backgroundColor="#f9f9f9" justifyContent="center" alignItems="center" padding="$4">
          <Text color={COLORS.accent} textAlign="center">Erreur: {error.message}</Text>
        </YStack>
      </Theme>
    );
  }
  
  const outage = data?.outage;
  
  if (!outage) {
    return (
      <Theme name="light">
        <YStack flex={1} backgroundColor="#f9f9f9" justifyContent="center" alignItems="center" padding="$4">
          <Text color={COLORS.textSecondary} textAlign="center">Coupure non trouvée</Text>
        </YStack>
      </Theme>
    );
  }
  
  const startDate = format(parseISO(outage.startDate), 'EEEE d MMMM yyyy, HH:mm', { locale: fr });
  const endDate = outage.endDate ? format(parseISO(outage.endDate), 'EEEE d MMMM yyyy, HH:mm', { locale: fr }) : null;
  
  return (
    <Theme name="light">
      <Stack.Screen options={{ headerShown: false }} />
      <YStack flex={1} backgroundColor="#f9f9f9">
        {/* Header */}
        <YStack
          paddingHorizontal="$4"
          paddingTop={top + 10}
          backgroundColor="white"
        >
          <XStack alignItems="center" paddingVertical="$2" space={10}>
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.primaryLight,
                padding: 12,
                borderRadius: 1000,
                alignSelf: 'flex-start'
              }}
              onPress={() => router.back()}
            >
              <ArrowLongLeftIcon size={25} color={COLORS.primary} /> 
            </TouchableOpacity>
            <Text fontSize={22} fontWeight="700" color={COLORS.primary}>
              Détails de la coupure
            </Text>
          </XStack>
        </YStack>
        
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 100,
            paddingHorizontal: 16,
          }}
        >
          {/* Outage Header Card */}
          <YStack
            alignItems="center"
            paddingVertical="$6"
            marginTop="$4"
            backgroundColor="white"
            borderRadius={20}
          >
            <View 
              backgroundColor={outage.resolvedStatus ? COLORS.successLight : COLORS.accentLight}
              borderRadius={20}
              alignItems="center"
              justifyContent="center"
              width={80}
              height={80}
              marginBottom="$4"
            >
              <BoltIcon size={40} color={outage.resolvedStatus ? COLORS.success : COLORS.accent} />
            </View>
            
            <Text 
              fontSize={24} 
              fontWeight="700" 
              color={COLORS.primary}
              marginBottom="$2"
              paddingHorizontal="$4"
              textAlign="center"
            >
              {outage.resolvedStatus ? 'Coupure Résolue' : 'Coupure Active'}
            </Text>
            
            <XStack 
              backgroundColor={outage.resolvedStatus ? COLORS.successLight : COLORS.accentLight}
              paddingHorizontal="$3"
              paddingVertical="$1"
              borderRadius={20}
              marginTop="$1"
            >
              <Text 
                fontSize={16} 
                color={outage.resolvedStatus ? COLORS.success : COLORS.accent} 
                fontWeight="600"
              >
                {outage.reportCount} signalement{outage.reportCount > 1 ? 's' : ''}
              </Text>
            </XStack>
          </YStack>
          
          {/* Outage Details */}
          <YStack space="$4" marginTop="$5">
            {/* Outage Info Section */}
            <YStack 
              backgroundColor="white" 
              borderRadius={20} 
              padding="$5" 
              space="$4"
            >
              <Text fontSize={18} fontWeight="700" color={COLORS.primary} marginBottom="$1">
                Informations
              </Text>
              
              <YStack space="$3">
                {outage.description && (
                  <YStack space="$1">
                    <Text fontSize={14} color={COLORS.textTertiary} fontWeight="500">Description</Text>
                    <Text fontSize={16} color={COLORS.textPrimary} fontWeight="400">
                      {outage.description}
                    </Text>
                  </YStack>
                )}
                
                <YStack space="$1">
                  <Text fontSize={14} color={COLORS.textTertiary} fontWeight="500">Statut</Text>
                  <XStack alignItems="center" space="$2">
                    <View
                      width={10}
                      height={10}
                      borderRadius={5}
                      backgroundColor={outage.resolvedStatus ? COLORS.success : COLORS.accent}
                    />
                    <Text 
                      fontSize={16} 
                      fontWeight="500"
                      color={outage.resolvedStatus ? COLORS.success : COLORS.accent}
                    >
                      {outage.resolvedStatus ? 'Résolu' : 'Actif'}
                    </Text>
                  </XStack>
                </YStack>
                
                <YStack space="$1">
                  <Text fontSize={14} color={COLORS.textTertiary} fontWeight="500">
                    <ClockIcon size={14} color={COLORS.textTertiary} style={{ marginRight: 5 }} />
                    Début
                  </Text>
                  <Text fontSize={16} color={COLORS.textPrimary} fontWeight="400">
                    {startDate}
                  </Text>
                </YStack>
                
                {endDate && (
                  <YStack space="$1">
                    <Text fontSize={14} color={COLORS.textTertiary} fontWeight="500">
                      <ClockIcon size={14} color={COLORS.textTertiary} style={{ marginRight: 5 }} />
                      Fin
                    </Text>
                    <Text fontSize={16} color={COLORS.textPrimary} fontWeight="400">
                      {endDate}
                    </Text>
                  </YStack>
                )}
                
                {(outage.latitude && outage.longitude) && (
                  <YStack space="$1">
                    <Text fontSize={14} color={COLORS.textTertiary} fontWeight="500">
                      <MapPinIcon size={14} color={COLORS.textTertiary} style={{ marginRight: 5 }} />
                      Localisation
                    </Text>
                    <Text fontSize={16} color={COLORS.textPrimary} fontWeight="400">
                      {outage.latitude.toFixed(6)}, {outage.longitude.toFixed(6)}
                    </Text>
                  </YStack>
                )}
                
                <YStack space="$1">
                  <Text fontSize={14} color={COLORS.textTertiary} fontWeight="500">Nombre de signalements</Text>
                  <Text fontSize={16} color={COLORS.textPrimary} fontWeight="400">
                    {outage.reportCount}
                  </Text>
                </YStack>
              </YStack>
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>
    </Theme>
  );
}