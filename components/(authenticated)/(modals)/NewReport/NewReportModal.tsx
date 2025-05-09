import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { YStack, Theme, Text, XStack, View, Button, Input, ScrollView, Separator } from 'tamagui';
import { TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { XMarkIcon, MapPinIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReportsStore } from '~/store/reportsStore';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_REPORT_MUTATION, GET_IMPACT_TYPES_QUERY } from '~/apollo/mutations';
import { 
  CreateReportInput, 
  CreateReportMutationVariables, 
  GetImpactTypesResponse,
  ImpactType,
  NetworkStatus
} from '~/apollo/types';
import * as Location from 'expo-location';
import { useNetworkStore } from '~/store/networkStore';
import { v4 as uuidv4 } from 'uuid';
import { COLORS } from '~/constants/theme';

export const ModalContent = () => {
    const { 
        description, 
        sentimentText, 
        impactTypeId,
        latitude,
        longitude,
        setDescription,
        setSentimentText,
        setImpactTypeId,
        setLatitude,
        setLongitude,
        addPendingReport,
        reset 
    } = useReportsStore();
    
    const [filteredImpactTypes, setFilteredImpactTypes] = useState<ImpactType[]>([]);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const { isConnected, addPendingReport: incrementPendingCount } = useNetworkStore();
    
    const { data: impactTypesData, loading: impactTypesLoading } = useQuery<GetImpactTypesResponse>(
        GET_IMPACT_TYPES_QUERY
    );
    
    const [createReport, { loading: createLoading }] = useMutation<
        { createReport: { id: string } },
        CreateReportMutationVariables
    >(CREATE_REPORT_MUTATION);

    useEffect(() => {
        if (impactTypesData?.impactTypes) {
            setFilteredImpactTypes(impactTypesData.impactTypes);
        }
    }, [impactTypesData]);

    const handleGetLocation = async () => {
        setLocationLoading(true);
        setLocationError(null);
        
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationError('Permission de localisation refusée');
                setLocationLoading(false);
                return;
            }
            
            const location = await Location.getCurrentPositionAsync({});
            setLatitude(location.coords.latitude);
            setLongitude(location.coords.longitude);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            setLocationError('Impossible d\'obtenir la localisation');
            console.error('Location error:', error);
        } finally {
            setLocationLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!description.trim()) {
            Alert.alert('Erreur', 'Veuillez décrire le problème');
            return;
        }

        if (impactTypeId === null) {
            Alert.alert('Erreur', 'Veuillez sélectionner un type d\'impact');
            return;
        }

        const createReportInput: CreateReportInput = {
            description: description.trim(),
            sentimentText: sentimentText.trim() || undefined,
            impactTypeId: Number(impactTypeId),
            latitude: latitude || undefined,
            longitude: longitude || undefined
        };

        try {
            // Si connecté, envoyer directement au serveur
            if (isConnected) {
                await createReport({
                    variables: {
                        createReportInput
                    },
                    refetchQueries: ['GetReports', 'GetMonthlyReportCounts']
                });
            } 
            // Sinon, stocker localement
            else {
                const newPendingReport = {
                    id: uuidv4(),
                    description: description.trim(),
                    sentimentText: sentimentText.trim() || undefined,
                    impactTypeId: Number(impactTypeId),
                    latitude: latitude || null,
                    longitude: longitude || null,
                    createdAt: new Date().toISOString(),
                    networkStatus: NetworkStatus.PENDING
                };
                
                await addPendingReport(newPendingReport);
                incrementPendingCount();
            }
            
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            reset(); 
            router.back();
        } catch (error) {
            console.error('Error creating report:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Erreur', 'Échec lors de la création du signalement. Veuillez réessayer.');
        }
    };

    const getSelectedImpactType = () => {
        return impactTypesData?.impactTypes.find(type => type.id === String(impactTypeId));
    };

    return (
        <Theme name="light">
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <YStack flex={1} backgroundColor="#fff">         
            <YStack paddingTop="$2" paddingHorizontal="$4" space="$4" flex={1}>
                {/* Header */}
                <XStack 
                alignItems="center" 
                justifyContent='space-between'
                paddingVertical="$2" 
                space={10}
            >
            <Text fontSize={24} fontWeight="bold" color={COLORS.primary} >Signaler un problème</Text>
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
                    
                <ScrollView showsVerticalScrollIndicator={false} flex={1} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Offline Warning */}
                {!isConnected && (
                    <View
                        backgroundColor={COLORS.accentLight}
                        borderRadius={10}
                        padding="$3"
                        marginBottom="$4"
                    >
                        <Text color={COLORS.accent} fontWeight="500">
                            Vous êtes actuellement hors ligne. Votre signalement sera enregistré localement et 
                            envoyé automatiquement lorsque vous serez connecté.
                        </Text>
                    </View>
                )}
                
                {/* Description */}
                <YStack space="$2" marginBottom="$4">
                    <Text fontSize={16} fontWeight="500" color={COLORS.primary}>Description du problème</Text>
                    <Input
                        backgroundColor="white"
                        borderWidth={1}
                        borderColor={COLORS.border}
                        height={100}
                        paddingHorizontal={16}
                        fontSize={16}
                        fontWeight={'500'}
                        placeholder="Décrivez le problème d'électricité"
                        value={description}
                        onChangeText={setDescription}
                        multiline={true}
                        textAlignVertical="top"
                    />
                </YStack>
                
                {/* Impact */}
                <YStack space="$2" marginBottom="$4">
                    <Text fontSize={16} fontWeight="500" color={COLORS.primary}>Impact sur votre quotidien</Text>
                    <Input
                        backgroundColor="white"
                        borderWidth={1}
                        borderColor={COLORS.border}
                        height={100}
                        paddingHorizontal={16}
                        fontSize={16}
                        fontWeight={'500'}
                        placeholder="Comment ce problème vous affecte-t-il? (Ex: Je ne peux pas travailler, Je ne peux pas conserver mes aliments, etc.)"
                        value={sentimentText}
                        onChangeText={setSentimentText}
                        multiline={true}
                        textAlignVertical="top"
                    />
                </YStack>

                {/* Location */}
                <YStack space="$2" marginBottom="$4">
                    <Text fontSize={16} fontWeight="500" color={COLORS.primary}>Localisation</Text>
                    <XStack space="$2" alignItems="center">
                        <TouchableOpacity
                            onPress={handleGetLocation}
                            style={{ flex: 1 }}
                            disabled={locationLoading}
                        >
                            <XStack
                                backgroundColor="white"
                                borderWidth={1}
                                borderColor={COLORS.border}
                                height={50}
                                paddingHorizontal={16}
                                alignItems="center"
                                justifyContent="space-between"
                                borderRadius={8}
                            >
                                <Text color={COLORS.textPrimary}>
                                    {latitude && longitude
                                        ? "Position capturée"
                                        : "Capturer ma position"
                                    }
                                </Text>
                                {locationLoading ? (
                                    <ActivityIndicator size="small" color={COLORS.primary} />
                                ) : (
                                    <MapPinIcon size={20} color={COLORS.primary} />
                                )}
                            </XStack>
                        </TouchableOpacity>
                    </XStack>
                    {locationError && (
                        <Text color={COLORS.accent} fontSize={14}>
                            {locationError}
                        </Text>
                    )}
                    {latitude && longitude && (
                        <Text color={COLORS.success} fontSize={14}>
                            Coordonnées : {latitude.toFixed(6)}, {longitude.toFixed(6)}
                        </Text>
                    )}
                </YStack>
                
                {/* Impact Type Selection */}
                <YStack space="$2" marginBottom="$4">
                    <Text fontSize={16} fontWeight="500" color={COLORS.primary}>Type d'impact</Text>
                    
                    {/* Loading state */}
                    {impactTypesLoading && (
                        <Text color={COLORS.textTertiary} textAlign="center" paddingVertical="$3">Chargement des types d'impact...</Text>
                    )}
                    
                    {/* Selected Impact Type */}
                    {!impactTypesLoading && impactTypeId !== null && (
                    <XStack marginBottom="$2" alignItems="center" justifyContent="space-between">
                        <XStack alignItems="center" space="$2">
                        <View 
                            backgroundColor={COLORS.accentLight}
                            padding="$2"
                            borderRadius={8}
                            alignItems="center"
                            justifyContent="center"
                            width={36}
                            height={36}
                        >
                            <Text fontSize={16}>{getSelectedImpactType()?.emoji}</Text>
                        </View>
                        <Text fontSize={16}>{getSelectedImpactType()?.name}</Text>
                        </XStack>
                        
                        <TouchableOpacity onPress={() => {
                        Haptics.selectionAsync();
                        setImpactTypeId(null);
                        }}>
                        <View
                            backgroundColor="#f2f2f2"
                            borderRadius={20}
                            width={28}
                            height={28}
                            alignItems="center"
                            justifyContent="center"
                        >
                            <XMarkIcon size={16} color="#666" />
                        </View>
                        </TouchableOpacity>
                    </XStack>
                    )}
                    
                    {/* Impact Type List */}
                    {!impactTypesLoading && impactTypeId === null && (
                    <View
                        backgroundColor="white"
                        borderWidth={1}
                        borderColor="#e0e0e0"
                        borderRadius={10}
                        overflow="hidden"
                    >
                        {filteredImpactTypes.map((impactType, index) => (
                            <React.Fragment key={impactType.id}>
                            <TouchableOpacity
                                onPress={() => {
                                Haptics.selectionAsync();
                                setImpactTypeId(Number(impactType.id));
                                }}
                            >
                                <XStack 
                                padding="$3"
                                alignItems="center"
                                space="$3"
                                >
                                <View 
                                    backgroundColor={COLORS.accentLight}
                                    padding="$2"
                                    borderRadius={8}
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Text fontSize={16}>{impactType.emoji}</Text>
                                </View>
                                <Text fontSize={16}>{impactType.name}</Text>
                                </XStack>
                            </TouchableOpacity>
                            {index < filteredImpactTypes.length - 1 && (
                                <Separator />
                            )}
                            </React.Fragment>
                        ))}
                        
                        {filteredImpactTypes.length === 0 && (
                            <YStack padding="$4" alignItems="center">
                            <Text color={COLORS.textTertiary}>Aucun type d'impact trouvé</Text>
                            <TouchableOpacity 
                                onPress={() => router.push('/NewImpactType')}
                                style={{ marginTop: 10 }}
                            >
                                <Text color={COLORS.primary}>Créer un nouveau type d'impact</Text>
                            </TouchableOpacity>
                            </YStack>
                        )}
                    </View>
                    )}
                    
                    {/* Add Impact Type Button */}
                    {!impactTypesLoading && impactTypeId === null && filteredImpactTypes.length > 0 && (
                    <TouchableOpacity 
                        onPress={() => router.push('/NewImpactType')}
                        style={{ marginTop: 8 }}
                    >
                        <Text color={COLORS.primary}>+ Ajouter un nouveau type d'impact</Text>
                    </TouchableOpacity>
                    )}
                </YStack>
                </ScrollView>
                
                {/* Submit Button */}
                <XStack position="absolute" bottom={20 + bottom} left={16} right={16}>
                <Button
                    backgroundColor={COLORS.primary}
                    color="white"
                    fontSize={16}
                    fontWeight="500"
                    height={50}
                    flex={1}
                    onPress={handleSubmit}
                    disabled={createLoading || !description.trim() || impactTypeId === null}
                    opacity={(createLoading || !description.trim() || impactTypeId === null) ? 0.5 : 1}
                    borderRadius={10}
                >
                    {createLoading ? "Enregistrement..." : "Envoyer le signalement"}
                </Button>
                </XStack>
            </YStack>
            </YStack>
        </KeyboardAvoidingView>
        </Theme>
    );
};