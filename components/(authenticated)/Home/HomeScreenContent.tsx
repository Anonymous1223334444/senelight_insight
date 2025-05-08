import { YStack, Theme, Text, XStack, ScrollView, Spinner, Button } from 'tamagui';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, RefreshControl } from 'react-native';
import { MapIcon, BoltIcon, SignalIcon } from 'react-native-heroicons/outline';
import { TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { StatusCard } from './StatusCard';
import { useAuthStore } from '~/store/authStore';
import { GET_DAILY_REPORT_COUNTS_QUERY } from '~/apollo/mutations';
import { useQuery } from '@apollo/client';
import { RecentReportsList } from './RecentReportsList';
import { useState, useCallback } from 'react';
import { DailyReportCount } from '~/apollo/types';
import { LineChart } from 'react-native-chart-kit';

export const ScreenContent = () => {
    const router = useRouter();
    const { bottom, top } = useSafeAreaInsets();
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const minSpacing = Math.min(screenHeight * 0.5, -10);
    const { user } = useAuthStore();
    const [refreshing, setRefreshing] = useState(false);

    const { data: reportsData, loading: reportsLoading, refetch: refetchReports } = 
        useQuery<{ dailyReportCounts: DailyReportCount[] }>(GET_DAILY_REPORT_COUNTS_QUERY, {
            variables: { days: 7 }
        });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        try {
            await refetchReports();
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setRefreshing(false);
        }
    }, [refetchReports]);

    const chartData = {
        labels: reportsData?.dailyReportCounts.map(item => item.date.slice(-5)) || [],
        datasets: [
            {
                data: reportsData?.dailyReportCounts.map(item => item.count) || [],
                color: (opacity = 1) => `rgba(75, 97, 220, ${opacity})`,
                strokeWidth: 2
            }
        ]
    };
    
    return (
    <Theme name="light">
        <YStack flex={1} space={minSpacing}>
            <XStack
                paddingTop="$8"
                paddingHorizontal="$4"
                paddingBottom="$2"
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                backgroundColor={"white"}
            >
                <YStack>
                    <Text
                        fontSize={16}
                        fontWeight="400"
                        color="#4b61dc"
                    >
                        Bonjour,
                    </Text>
                    <Text
                        fontSize={18}
                        fontWeight="700"
                        color="#4b61dc"
                    >
                        {user?.name}
                    </Text>
                </YStack>
                <TouchableOpacity
                style={{
                    backgroundColor: '#dde3fb',
                    padding: 8,
                    borderRadius: 1000,
                    alignSelf: 'flex-start'
                    }}
                onPress={() => {Haptics.selectionAsync();}}
                >
                    <MapIcon size={24} color="#4b61dc" />
                </TouchableOpacity>
            </XStack>
            <YStack
            paddingHorizontal={"$4"}
            >
            <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: 200,
                    }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#4b61dc"
                        colors={["#4b61dc"]}
                    />
                }
            >
            <YStack paddingTop="$3">
                <StatusCard />

                <YStack 
                    backgroundColor={"#dde3fb"}
                    borderRadius={20}
                    padding={"$5"}
                    marginVertical={"$4"}
                >
                    <Text
                        fontSize={18}
                        fontWeight="700"
                        color="#4b61dc"
                        marginBottom={"$2"}
                    >
                        Signaler une coupure de courant
                    </Text>
                    <Text
                        fontSize={14}
                        color="#333333"
                        marginBottom={"$4"}
                    >
                        Aidez SENELEC à améliorer ses services en signalant les problèmes d'électricité.
                    </Text>
                    <Button
                        backgroundColor="#4b61dc"
                        color="white"
                        borderRadius={10}
                        height={50}
                        alignItems="center"
                        justifyContent="center"
                        onPress={() => {
                            Haptics.selectionAsync();
                            router.push('/NewReport');
                        }}
                    >
                        <BoltIcon size={20} color="white" />
                        <Text color="white" fontWeight="600" fontSize={16} marginLeft={8}>
                            Signaler un problème
                        </Text>
                    </Button>
                </YStack>

                <YStack space={6}>
                    <XStack 
                        justifyContent="space-between" 
                        alignItems="center"
                        paddingVertical="$2"
                    >
                        <Text
                            fontSize={18}
                            fontWeight="700"
                            color="#4b61dc"
                        >
                            Statistiques récentes
                        </Text>
                    </XStack>
                    
                    {reportsLoading ? (
                        <YStack 
                            backgroundColor="white" 
                            borderRadius={15} 
                            padding="$4" 
                            alignItems="center"
                            height={220}
                            justifyContent="center"
                        >
                            <Spinner size="large" color="#4b61dc" />
                        </YStack>
                    ) : (
                        <YStack 
                            backgroundColor="white" 
                            borderRadius={15} 
                            padding="$4"
                        >
                            <Text
                                fontSize={16}
                                fontWeight="600"
                                color="#333"
                                marginBottom={"$2"}
                            >
                                Signalements sur 7 jours
                            </Text>
                            {chartData.labels.length > 0 ? (
                                <LineChart
                                    data={chartData}
                                    width={screenWidth - 50}
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
                                            stroke: "#4b61dc"
                                        }
                                    }}
                                    bezier
                                    style={{
                                        marginVertical: 8,
                                        borderRadius: 16
                                    }}
                                />
                            ) : (
                                <Text 
                                    color="#666" 
                                    textAlign="center" 
                                    marginVertical="$4"
                                >
                                    Aucune donnée disponible
                                </Text>
                            )}
                        </YStack>
                    )}
                    
                    <XStack 
                        justifyContent="space-between" 
                        alignItems="center"
                        paddingVertical="$2"
                    >
                        <Text
                            fontSize={18}
                            fontWeight="700"
                            color="#4b61dc"
                        >
                            Mes signalements
                        </Text>
                        <TouchableOpacity onPress={() => {
                            Haptics.selectionAsync();
                            router.push('/reports');
                        }}>
                            <Text
                                fontSize={14}
                                fontWeight={"500"}
                                color="#4b61dc"
                            >
                                Voir tout
                            </Text>
                        </TouchableOpacity>
                    </XStack>
                    
                    <RecentReportsList />
                </YStack>
            </YStack>
            </ScrollView>
            </YStack>
        </YStack>
    </Theme>
    );
};