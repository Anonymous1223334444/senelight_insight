import { Stack } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { YStack, Theme, Text, XStack, View, ScrollView, Spinner } from 'tamagui';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_REPORTS_QUERY } from '~/apollo/queries';
import { 
  PlusIcon,
} from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { GetReportsResponse, NetworkStatus } from '~/apollo/types';
import { ErrorMessage } from '~/components/common/ErrorMessage';
import { COLORS } from '~/constants/theme';
import { ReportItem } from '~/components/(authenticated)/Home/ReportItem';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ReportsScreen() {
  const router = useRouter();
  const { bottom, top } = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<NetworkStatus | null>(null);

  // Récupération des rapports
  const { 
    data, 
    loading,
    error,
    refetch 
  } = useQuery<GetReportsResponse>(GET_REPORTS_QUERY, {
    variables: { 
      status: statusFilter
    }
  });
  
  // Fonction pour rafraîchir les données
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await refetch();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return (
    <Theme name="light">
      <Stack.Screen options={{ headerShown: false }} />
      <YStack flex={1} backgroundColor="#f9f9f9">
        {/* Header */}
        <XStack
          paddingHorizontal="$4"
          paddingTop={top + 10}
          paddingBottom="$2"
          backgroundColor="white"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text
            fontSize={28}
            fontWeight="700"
            color={COLORS.primary}
          >
            Signalements
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.primaryLight,
              padding: 8,
              borderRadius: 1000,
            }}
            onPress={() => {
              Haptics.selectionAsync();
              router.push('/NewReport');
            }}
          >
            <PlusIcon size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </XStack>

        {/* Filtres de statut */}
        <XStack
          paddingHorizontal="$4"
          paddingVertical="$2"
          backgroundColor="white"
          space="$2"
        >
          <FilterButton 
            label="Tous" 
            active={statusFilter === null} 
            onPress={() => setStatusFilter(null)} 
          />
          <FilterButton 
            label="Envoyés" 
            active={statusFilter === NetworkStatus.SENT} 
            onPress={() => setStatusFilter(NetworkStatus.SENT)} 
          />
          <FilterButton 
            label="En attente" 
            active={statusFilter === NetworkStatus.PENDING} 
            onPress={() => setStatusFilter(NetworkStatus.PENDING)} 
          />
          <FilterButton 
            label="Échoués" 
            active={statusFilter === NetworkStatus.FAILED} 
            onPress={() => setStatusFilter(NetworkStatus.FAILED)} 
          />
        </XStack>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 120,
            paddingTop: 16
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        >
          {loading ? (
            <YStack alignItems="center" paddingVertical="$4">
              <Spinner size="large" color={COLORS.primary} />
            </YStack>
          ) : error ? (
            <ErrorMessage 
              message="Erreur de chargement des signalements" 
              details={error.message} // Pass the actual error message
              onRetry={onRefresh} // Use the existing refresh function
            />
          ) : !data?.reports || data.reports.length === 0 ? (
            <YStack alignItems="center" paddingVertical="$4">
              <Text color={COLORS.textSecondary}>Aucun signalement trouvé</Text>
            </YStack>
          ) : (
            <YStack space={8}>
              {data.reports.map((report) => (
                <ReportItem
                  key={report.id}
                  id={Number(report.id)}
                  impactType={report.impactType.name}
                  emoji={report.impactType.emoji}
                  date={format(parseISO(report.reportDate), "EEE d MMM", { locale: fr })}
                  description={report.description}
                  status={report.networkStatus}
                />
              ))}
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </Theme>
  );
}

type FilterButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
}

const FilterButton = ({ label, active, onPress }: FilterButtonProps) => {
  return (
    <TouchableOpacity onPress={() => {
      Haptics.selectionAsync();
      onPress();
    }}>
      <View
        backgroundColor={active ? COLORS.primary : COLORS.primaryLight}
        paddingVertical="$1"
        paddingHorizontal="$2"
        borderRadius={8}
      >
        <Text 
          color={active ? "white" : COLORS.primary}
          fontWeight={active ? "600" : "400"}
          fontSize={14}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
