import { YStack, XStack, Theme, Text, View, ScrollView } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLongLeftIcon } from "react-native-heroicons/outline";
import { useQuery } from '@apollo/client';
import { GET_REPORT_QUERY } from '~/apollo/queries';
import { GetReportResponse } from '~/apollo/types';
import { COLORS, networkStatusColors } from '~/constants/theme';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

type ReportScreenContentProps = {
    id: string | string[];
};

export const ScreenContent = ({ id }: ReportScreenContentProps) => {
    const router = useRouter();
    const { top } = useSafeAreaInsets();
    const reportId = typeof id === 'string' ? parseInt(id) : parseInt(id[0]);
    
    const { loading, error, data } = useQuery<GetReportResponse>(
        GET_REPORT_QUERY,
        {
            variables: { id: reportId },
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
    
    const report = data?.report;
    
    if (!report) {
        return (
            <Theme name="light">
                <YStack flex={1} backgroundColor="#f9f9f9" justifyContent="center" alignItems="center" padding="$4">
                    <Text color={COLORS.textSecondary} textAlign="center">Signalement non trouvé</Text>
                </YStack>
            </Theme>
        );
    }
    
    const formattedDate = format(parseISO(report.reportDate), 'EEEE d MMMM yyyy', { locale: fr });
    const statusColor = networkStatusColors[report.networkStatus];
    
    return (
        <Theme name="light">
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
                        Détails du signalement
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
                {/* Report Header Card */}
                <YStack
                    alignItems="center"
                    paddingVertical="$6"
                    marginTop="$4"
                    backgroundColor="white"
                    borderRadius={20}
                >
                    <View 
                        backgroundColor={COLORS.accentLight}
                        borderRadius={20}
                        alignItems="center"
                        justifyContent="center"
                        width={80}
                        height={80}
                        marginBottom="$4"
                    >
                        <Text fontSize={40}>{report.impactType.emoji}</Text>
                    </View>
                    
                    <Text 
                        fontSize={24} 
                        fontWeight="700" 
                        color={COLORS.primary}
                        marginBottom="$2"
                        paddingHorizontal="$4"
                        textAlign="center"
                    >
                        {report.impactType.name}
                    </Text>
                    
                    <XStack 
                        backgroundColor={statusColor + '20'}
                        paddingHorizontal="$3"
                        paddingVertical="$1"
                        borderRadius={20}
                        marginTop="$1"
                    >
                        <Text 
                            fontSize={16} 
                            color={statusColor} 
                            fontWeight="600"
                        >
                            {report.networkStatus === 'SENT' ? 'Envoyé' : 
                             report.networkStatus === 'PENDING' ? 'En attente' : 'Échec d\'envoi'}
                        </Text>
                    </XStack>
                </YStack>
                
                {/* Report Details */}
                <YStack space="$4" marginTop="$5">
                    {/* Report Info Section */}
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
                            <YStack space="$1">
                                <Text fontSize={14} color={COLORS.textTertiary} fontWeight="500">Description</Text>
                                <Text fontSize={16} color={COLORS.textPrimary} fontWeight="400">
                                    {report.description}
                                </Text>
                            </YStack>
                            
                            {report.sentimentText && (
                                <YStack space="$1">
                                    <Text fontSize={14} color={COLORS.textTertiary} fontWeight="500">Impact ressenti</Text>
                                    <Text fontSize={16} color={COLORS.textPrimary} fontWeight="400">
                                        {report.sentimentText}
                                    </Text>
                                </YStack>
                            )}
                            
                            <YStack space="$1">
                                <Text fontSize={14} color={COLORS.textTertiary} fontWeight="500">Date</Text>
                                <Text fontSize={16} color={COLORS.textPrimary} fontWeight="400">
                                    {formattedDate}
                                </Text>
                            </YStack>
                            
                            <YStack space="$1">
                                <Text fontSize={14} color={COLORS.textTertiary} fontWeight="500">Type d'impact</Text>
                                <Text fontSize={16} color={COLORS.textPrimary} fontWeight="400">
                                    {report.impactType.name}
                                </Text>
                            </YStack>
                            
                            <YStack space="$1">
                                <Text fontSize={14} color={COLORS.textTertiary} fontWeight="500">Statut</Text>
                                <XStack alignItems="center" space="$2">
                                    <View
                                        width={10}
                                        height={10}
                                        borderRadius={5}
                                        backgroundColor={statusColor}
                                    />
                                    <Text 
                                        fontSize={16} 
                                        fontWeight="500"
                                        color={statusColor}
                                    >
                                        {report.networkStatus === 'SENT' ? 'Envoyé' : 
                                         report.networkStatus === 'PENDING' ? 'En attente' : 'Échec d\'envoi'}
                                    </Text>
                                </XStack>
                            </YStack>
                            
                            {(report.latitude && report.longitude) && (
                                <YStack space="$1">
                                    <Text fontSize={14} color={COLORS.textTertiary} fontWeight="500">Localisation</Text>
                                    <Text fontSize={16} color={COLORS.textPrimary} fontWeight="400">
                                        {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                                    </Text>
                                </YStack>
                            )}
                        </YStack>
                    </YStack>
                </YStack>
            </ScrollView>
        </YStack>
        </Theme>
    );
};