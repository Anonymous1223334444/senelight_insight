import { XStack, YStack, Text } from 'tamagui';
import { TouchableOpacity } from 'react-native';
import { SignalIcon, CheckIcon, BoltSlashIcon } from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { useNetworkStore } from '~/store/useNetworkStore';
import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';

export const StatusCard = () => {
    const { isConnected, updateConnectionStatus } = useNetworkStore();
    
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
            backgroundColor={isConnected ? "#e3fff0" : "#ffeded"}
            borderRadius={20}
            padding={"$5"}
            justifyContent='space-between'
            alignItems='center'
        >
            <YStack>
                <Text
                    fontSize={12}
                    color={isConnected ? "#4bdc7d" : "#dc4b4b"}
                >
                    Statut de connexion
                </Text>
                <Text
                    fontSize={18}
                    fontWeight="600"
                    color={isConnected ? "#4bdc7d" : "#dc4b4b"}
                >
                    {isConnected ? "Connecté" : "Hors ligne"}
                </Text>
                <Text
                    fontSize={14}
                    color={isConnected ? "#4bdc7d" : "#dc4b4b"}
                    opacity={0.8}
                >
                    {isConnected 
                        ? "Vos signalements seront envoyés immédiatement"
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
            >
                {isConnected ? (
                    <CheckIcon size={25} color="#4bdc7d" />
                ) : (
                    <BoltSlashIcon size={25} color="#dc4b4b" />
                )}
            </YStack>
        </XStack>
    );
};