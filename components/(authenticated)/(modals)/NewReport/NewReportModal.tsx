import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { YStack, Theme, Text, XStack, View, Button, Input, ScrollView, Separator } from 'tamagui';
import { TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { XMarkIcon, MapPinIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReportStore } from '~/store/useReportStore';
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
import { useNetworkStore } from '~/store/useNetworkStore';

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
        reset 
    } = useReportStore();
    
    const [filteredImpactTypes, setFilteredImpactTypes] = useState<ImpactType[]>([]);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const { isConnected } = useNetworkStore();
    
    const { data: impactTypesData, loading: impactTypesLoading } = useQuery<GetImpactTypesResponse>(
        GET_IMPACT_TYPES_QUERY
    );
    
    const [createReport, { loading: createLoading }] = useMutation
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
            alert('Veuillez décrire le problème');
            return;
        }

        if (impactTypeId === null) {
            alert('Veuillez sélectionner un type d\'impact');
            return;
        }

        const createReportInput: CreateReportInput = {
            description: description.trim(),
            sentimentText: sentimentText.trim(),
            impactTypeId: Number(impactTypeId),
            latitude,
            longitude
        };

        try {
            const response = await createReport({
                variables: {
                    createReportInput
                },
                // Si déconnecté, ne pas refetch
                refetchQueries: isConnected ? ['GetReports', 'GetDailyReportCounts'] : []
            });
            
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            reset(); 
            router.back();
        } catch (error) {
            console.error('Error creating report:', error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            alert('Échec lors de la création du signalement. Veuillez réessayer.');
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
            <Text fontSize={24} fontWeight="bold" color={"#4b61dc"} >Signaler un problème</Text>
                <TouchableOpacity
                style={{
                    backgroundColor: '#dde3fb',
                    padding: 8,
                    borderRadius: 1000,
                    alignSelf: 'flex-start'
                }}
                onPress={() => router.back()}
            >
                <XMarkIcon size={25} color="#4b61dc" /> 
            </TouchableOpacity>
                </XStack>
                    
                <ScrollView showsVerticalScrollIndicator={false} flex={1} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Offline Warning */}
                {!isConnected && (
                    <View
                        backgroundColor="#ffeded"
                        borderRadius={10}
                        padding="$3"
                        marginBottom="$4"
                    >
                        <Text color="#dc4b4b" fontWeight="500">
                            Vous êtes actuellement hors ligne. Votre signalement sera enregistré localement et 
                            envoyé automatiquement lorsque vous serez connecté.
                        </Text>
                    </View>
                )}
                
                {/* Description */}
                <YStack space="$2" marginBottom="$4">
                    <Text fontSize={16} fontWeight="500" color="#4b61dc">Description du problème</Text>
                    <Input
                        backgroundColor="white"
                        borderWidth={1}
                        borderColor="#E2E8F0"
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
                    <Text fontSize={16} fontWeight="500" color="#4b61dc">Impact sur votre quotidien</Text>
                    <Input
                        backgroundColor="white"
                        borderWidth={1}
                        borderColor="#E2E8F0"
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
                    <Text fontSize={16} fontWeight="500" color="#4b61dc">Localisation</Text>
                    <XStack space="$2" alignItems="center">
                        <TouchableOpacity
                            onPress={handleGetLocation}
                            style={{ flex: 1 }}
                            disabled={locationLoading}
                        >
                            <XStack
                                backgroundColor="white"
                                borderWidth={1}
                                borderColor="#E2E8F0"
                                height={50}
                                paddingHorizontal={16}
                                alignItems="center"
                                justifyContent="space-between"
                                borderRadius={8}
                            >
                                <Text color="#333">
                                    {latitude && longitude
                                        ? "Position capturée"
                                        : "Capturer ma position"
                                    }
                                </Text>
                                {locationLoading ? (
                                    <ActivityIndicator size="small" color="#4b61dc" />
                                ) : (
                                    <MapPinIcon size={20} color="#4b61dc" />
                                )}
                            </XStack>
                        </TouchableOpacity>
                    </XStack>
                    {locationError && (
                        <Text color="#dc4b4b" fontSize={14}>
                            {locationError}
                        </Text>
                    )}
                    {latitude && longitude && (
                        <Text color="#4bdc7d" fontSize={14}>
                            Coordonnées : {latitude.toFixed(6)}, {longitude.toFixed(6)}
                        </Text>
                    )}
                </YStack>
                
                {/* Impact Type Selection */}
                <YStack space="$2" marginBottom="$4">
                    <Text fontSize={16} fontWeight="500" color="#4b61dc">Type d'impact</Text>
                    
                    {/* Loading state */}
                    {impactTypesLoading && (
                        <Text color="#666" textAlign="center" paddingVertical="$3">Chargement des types d'impact...</Text>
                    )}
                    
                    {/* Selected Impact Type */}
                    {!impactTypesLoading && impactTypeId !== null && (
                    <XStack marginBottom="$2" alignItems="center" justifyContent="space-between">
                        <XStack alignItems="center" space="$2">
                        <View 
                            backgroundColor="#ffeded"
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
                                    backgroundColor="#ffeded"
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
                            <Text color="#666">Aucun type d'impact trouvé</Text>
                            <TouchableOpacity 
                                onPress={() => router.push('/NewImpactType')}
                                style={{ marginTop: 10 }}
                            >
                                <Text color="#4b61dc">Créer un nouveau type d'impact</Text>
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
                        <Text color="#4b61dc">+ Ajouter un nouveau type d'impact</Text>
                    </TouchableOpacity>
                    )}
                </YStack>
                </ScrollView>
                
                {/* Submit Button */}
                <XStack position="absolute" bottom={20 + bottom} left={16} right={16}>
                <Button
                    backgroundColor="#4b61dc"
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