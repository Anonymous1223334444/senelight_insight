import { Stack } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { YStack, Theme, Text, XStack, View, ScrollView, Spinner } from 'tamagui';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery } from '@apollo/client';
import { 
  GET_DASHBOARD_STATS_QUERY, 
  GET_MONTHLY_REPORT_COUNTS_QUERY,
  GET_REPORTS_BY_IMPACT_TYPE_QUERY
} from '~/apollo/queries';
import {
  BoltIcon,
  PlusIcon,
  PresentationChartLineIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { 
  GetDashboardStatsResponse, 
  GetMonthlyReportCountsResponse,
  GetReportsByImpactTypeResponse 
} from '~/apollo/types';
import { StatusCard } from '~/components/(authenticated)/Dashboard/StatusCard';
import { RecentReportsList } from '~/components/(authenticated)/Dashboard/RecentReportsList';
import { COLORS } from '~/constants/theme';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DashboardScreen() {
  const router = useRouter();
  const { bottom, top } = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const [refreshing, setRefreshing] = useState(false);

  // Récupération des statistiques du tableau de bord
  const { 
    data: dashboardData, 
    loading: dashboardLoading, 
    refetch: refetchDashboard 
  } = useQuery<GetDashboardStatsResponse>(GET_DASHBOARD_STATS_QUERY);
  
  // Récupération des données de signalements mensuels
  const { 
    data: monthlyData, 
    loading: monthlyLoading, 
    refetch: refetchMonthly 
  } = useQuery<GetMonthlyReportCountsResponse>(GET_MONTHLY_REPORT_COUNTS_QUERY, {
    variables: { days: 7 }
  });

  // Récupération des données par type d'impact
  const { 
    data: impactTypesData, 
    loading: impactTypesLoading, 
    refetch: refetchImpactTypes 
  } = useQuery<GetReportsByImpactTypeResponse>(GET_REPORTS_BY_IMPACT_TYPE_QUERY);

  // Fonction pour rafraîchir toutes les données
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await Promise.all([
        refetchDashboard(),
        refetchMonthly(),
        refetchImpactTypes()
      ]);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchDashboard, refetchMonthly, refetchImpactTypes]);

  // Préparation des données pour les graphiques
  const monthlyReportData = {
    labels: monthlyData?.monthlyReportCounts.map(item => format(new Date(item.date), 'dd/MM', { locale: fr })) || [],
    datasets: [
      {
        data: monthlyData?.monthlyReportCounts.map(item => item.count) || [],
        color: (opacity = 1) => `rgba(75, 97, 220, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ["Signalements"]
  };

  const impactTypesPieData = impactTypesData?.reportsByImpactType.map((item, index) => ({
    name: item.impactTypeName,
    count: item.count,
    color: getColorForIndex(index),
    legendFontColor: "#7F7F7F",
    legendFontSize: 12
  })) || [];

  function getColorForIndex(index: number) {
    const colors = [
      COLORS.primary,
      COLORS.accent,
      COLORS.success,
      "#FFA726",
      "#9C27B0",
      "#2196F3",
    ];
    return colors[index % colors.length];
  }

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
            Dashboard
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
          {/* Carte de statut de connexion */}
          <StatusCard />

          {/* Statistiques globales */}
          <YStack marginTop="$4">
            <Text
              fontSize={18}
              fontWeight="700"
              color={COLORS.primary}
              marginBottom="$3"
            >
              Aperçu général
            </Text>

            <XStack space="$3">
              {/* Carte des coupures actives */}
              <StatCard
                title="Coupures actives"
                value={dashboardLoading ? "..." : `${dashboardData?.dashboardStats.activeOutages}`}
                icon={<BoltIcon size={24} color={COLORS.accent} />}
                backgroundColor={COLORS.accentLight}
                textColor={COLORS.accent}
                loading={dashboardLoading}
                flex={1}
              />

              {/* Carte des signalements en attente */}
              <StatCard
                title="En attente"
                value={dashboardLoading ? "..." : `${dashboardData?.dashboardStats.pendingReports}`}
                icon={<ExclamationTriangleIcon size={24} color={COLORS.warning} />}
                backgroundColor={COLORS.warningLight}
                textColor={COLORS.warning}
                loading={dashboardLoading}
                flex={1}
              />
            </XStack>

            <XStack space="$3" marginTop="$3">
              {/* Carte des coupures totales */}
              <StatCard
                title="Total coupures"
                value={dashboardLoading ? "..." : `${dashboardData?.dashboardStats.totalOutages}`}
                icon={<PresentationChartLineIcon size={24} color={COLORS.primary} />}
                backgroundColor={COLORS.primaryLight}
                textColor={COLORS.primary}
                loading={dashboardLoading}
                flex={1}
              />

              {/* Carte des signalements totaux */}
              <StatCard
                title="Total signalements"
                value={dashboardLoading ? "..." : `${dashboardData?.dashboardStats.totalReports}`}
                icon={<CheckCircleIcon size={24} color={COLORS.success} />}
                backgroundColor={COLORS.successLight}
                textColor={COLORS.success}
                loading={dashboardLoading}
                flex={1}
              />
            </XStack>
          </YStack>

          {/* Graphique des signalements par jour */}
          <YStack marginTop="$6">
            <Text
              fontSize={18}
              fontWeight="700"
              color={COLORS.primary}
              marginBottom="$3"
            >
              Signalements récents
            </Text>

            <View
              backgroundColor="white"
              borderRadius={16}
              padding="$4"
              {...boxShadow}
            >
              <Text
                fontSize={16}
                fontWeight="600"
                color={COLORS.textPrimary}
                marginBottom="$3"
              >
                Derniers 7 jours
              </Text>

              {monthlyLoading ? (
                <YStack height={180} justifyContent="center" alignItems="center">
                  <Spinner size="large" color={COLORS.primary} />
                </YStack>
              ) : monthlyReportData.labels.length === 0 ? (
                <YStack height={180} justifyContent="center" alignItems="center">
                  <Text color={COLORS.textSecondary}>Aucune donnée disponible</Text>
                </YStack>
              ) : (
                <LineChart
                  data={monthlyReportData}
                  width={screenWidth - 64}
                  height={180}
                  chartConfig={{
                    backgroundColor: "white",
                    backgroundGradientFrom: "white",
                    backgroundGradientTo: "white",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(75, 97, 220, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: "6",
                      strokeWidth: "2",
                      stroke: COLORS.primary
                    }
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16
                  }}
                />
              )}
            </View>
          </YStack>

          {/* Graphique des types d'impact */}
          {impactTypesPieData.length > 0 && (
            <YStack marginTop="$6">
              <Text
                fontSize={18}
                fontWeight="700"
                color={COLORS.primary}
                marginBottom="$3"
              >
                Impacts par type
              </Text>

              <View
                backgroundColor="white"
                borderRadius={16}
                padding="$4"
                {...boxShadow}
              >
                {impactTypesLoading ? (
                  <YStack height={180} justifyContent="center" alignItems="center">
                    <Spinner size="large" color={COLORS.primary} />
                  </YStack>
                ) : (
                  <PieChart
                    data={impactTypesPieData}
                    width={screenWidth - 64}
                    height={200}
                    chartConfig={{
                      backgroundColor: "white",
                      backgroundGradientFrom: "white",
                      backgroundGradientTo: "white",
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor="count"
                    backgroundColor="transparent"
                    paddingLeft="0"
                    absolute
                  />
                )}
              </View>
            </YStack>
          )}

          {/* Liste des signalements récents */}
          <YStack marginTop="$6">
            <XStack
              justifyContent="space-between"
              alignItems="center"
              marginBottom="$3"
            >
              <Text
                fontSize={18}
                fontWeight="700"
                color={COLORS.primary}
              >
                Derniers signalements
              </Text>
              <TouchableOpacity onPress={() => {
                Haptics.selectionAsync();
                router.push('/reports');
              }}>
                <Text
                  fontSize={14}
                  fontWeight="500"
                  color={COLORS.primary}
                >
                  Voir tous
                </Text>
              </TouchableOpacity>
            </XStack>

            <RecentReportsList />
          </YStack>
        </ScrollView>
      </YStack>
    </Theme>
  );
}

// Composant de carte statistique
type StatCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  backgroundColor: string;
  textColor: string;
  loading?: boolean;
  flex?: number;
};

const StatCard = ({
  title,
  value,
  icon,
  backgroundColor,
  textColor,
  loading = false,
  flex
}: StatCardProps) => {
  return (
    <YStack
      backgroundColor="white"
      borderRadius={16}
      padding="$3"
      flex={flex}
      {...boxShadow}
    >
      <XStack alignItems="center" space="$2" marginBottom="$2">
        <View
          backgroundColor={backgroundColor}
          borderRadius={8}
          padding="$1"
          width={36}
          height={36}
          alignItems="center"
          justifyContent="center"
        >
          {icon}
        </View>
        <Text fontSize={14} color={COLORS.textSecondary}>
          {title}
        </Text>
      </XStack>
      
      {loading ? (
        <Spinner size="small" color={textColor} />
      ) : (
        <Text
          fontSize={26}
          fontWeight="bold"
          color={textColor}
          textAlign="center"
          marginTop="$1"
        >
          {value}
        </Text>
      )}
    </YStack>
  );
};

// Style d'ombre pour les cartes
const boxShadow = {
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.5,
  shadowRadius: 4,
  elevation: 3,
};