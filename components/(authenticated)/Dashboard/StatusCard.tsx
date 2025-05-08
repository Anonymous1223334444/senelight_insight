import { XStack, YStack, Text } from 'tamagui';
import { TouchableOpacity } from 'react-native';
import { SignalIcon, CheckIcon, BoltSlashIcon } from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { useNetworkStore } from '~/store/networkStore';
import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { COLORS } from '~/constants/theme';

export const StatusCard = () => {
    const { isConnected, pendingReports, updateConnectionStatus } = useNetworkStore();
    
    useEffect(() => {
        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener(state => {
            updateConnectionStatus(!!state.isConnected);
        });
        
        // Check initial connection status
        NetInfo.fetch().then(state => {
            updateConnectionStatus(!!state.isConnected);
        });
        
        return () => {
            unsubscribe();
        };
    }, [updateConnectionStatus]);
    
    return (
        <XStack
            backgroundColor={isConnected ? COLORS.successLight : COLORS.accentLight}
            borderRadius={20}
            padding={"$5"}
            justifyContent='space-between'
            alignItems='center'
        >
            <YStack flex={1}>
                <Text
                    fontSize={12}
                    color={isConnected ? COLORS.success : COLORS.accent}
                >
                    Statut de connexion
                </Text>
                <Text
                    fontSize={18}
                    fontWeight="600"
                    color={isConnected ? COLORS.success : COLORS.accent}
                >
                    {isConnected ? "Connecté" : "Hors ligne"}
                </Text>
                <Text
                    fontSize={14}
                    color={isConnected ? COLORS.success : COLORS.accent}
                    opacity={0.8}
                >
                    {isConnected 
                        ? pendingReports > 0 
                            ? `Synchronisation de ${pendingReports} signalement${pendingReports > 1 ? 's' : ''} en attente...`
                            : "Vos signalements seront envoyés immédiatement" 
                        : "Vos signalements seront envoyés lorsque vous serez connecté"
                    }
                </Text>
            </YStack>
            <YStack 
                backgroundColor="white"
                width={40}
                height={40}
                borderRadius={20}
                alignItems="center"
                justifyContent="center"
                marginLeft="$2"
            >
                {isConnected ? (
                    <CheckIcon size={25} color={COLORS.success} />
                ) : (
                    <BoltSlashIcon size={25} color={COLORS.accent} />
                )}
            </YStack>
        </XStack>
    );
};