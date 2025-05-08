import { Stack } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { YStack, Theme, Text, XStack, View, Spinner, Button } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Circle, Heatmap } from 'react-native-maps';
import * as Location from 'expo-location';
import { useQuery } from '@apollo/client';
import { GET_MAP_DATA_QUERY } from '~/apollo/queries';
import { GetMapDataResponse, MapData, OutagePoint, ReportPoint } from '~/apollo/types';
import { COLORS } from '~/constants/theme';
import { 
  MapPinIcon, 
  FunnelIcon, 
  BoltIcon, 
  ExclamationTriangleIcon, 
  ArrowPathIcon 
} from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';

export default function MapScreen() {
  const { bottom, top } = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [filterType, setFilterType] = useState<'all' | 'outages' | 'reports'>('all');
  
  const { data, loading, error, refetch } = useQuery<GetMapDataResponse>(
    GET_MAP_DATA_QUERY,
    { fetchPolicy: 'network-only' }
  );
  
  const mapData = data?.mapData;
  
  // Demande de permission et obtention de la localisation de l'utilisateur
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      }
    })();
  }, []);
  
  // Centrer la carte sur le Sénégal si pas de localisation utilisateur
  const initialRegion = userLocation 
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : {
        latitude: 14.7167, // Dakar
        longitude: -17.4677,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };
    
  const handleCenterMap = () => {
    Haptics.selectionAsync();
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  };
  
  const toggleMapType = () => {
    Haptics.selectionAsync();
    setMapType(mapType === 'standard' ? 'satellite' : 'standard');
  };
  
  const handleRefresh = () => {
    Haptics.selectionAsync();
    refetch();
  };
  
  const renderMarkers = () => {
    if (!mapData) return null;
    
    const markers = [];
    
    // Filtrer les données selon le filtre actif
    if (filterType === 'all' || filterType === 'outages') {
      mapData.outages.forEach((outage: OutagePoint) => {
        markers.push(
          <Marker
            key={`outage-${outage.id}`}
            coordinate={{
              latitude: outage.latitude,
              longitude: outage.longitude
            }}
            pinColor={outage.resolved ? COLORS.success : COLORS.accent}
            title={outage.resolved ? 'Coupure résolue' : 'Coupure active'}
            description={`${outage.reportCount} signalement(s) associé(s)`}
          >
            <View
              backgroundColor={outage.resolved ? COLORS.successLight : COLORS.accentLight}
              borderRadius={30}
              width={36}
              height={36}
              alignItems="center"
              justifyContent="center"
              borderWidth={2}
              borderColor={outage.resolved ? COLORS.success : COLORS.accent}
            >
              <BoltIcon size={18} color={outage.resolved ? COLORS.success : COLORS.accent} />
            </View>
            <Callout>
              <View width={200} padding={10}>
                <Text fontWeight="bold" color={outage.resolved ? COLORS.success : COLORS.accent}>
                  {outage.resolved ? 'Coupure résolue' : 'Coupure active'}
                </Text>
                <Text marginTop={5}>
                  {outage.reportCount} signalement{outage.reportCount > 1 ? 's' : ''} associé{outage.reportCount > 1 ? 's' : ''}
                </Text>
              </View>
            </Callout>
          </Marker>
        );
      });
    }
    
    if (filterType === 'all' || filterType === 'reports') {
      mapData.reports.forEach((report: ReportPoint) => {
        markers.push(
          <Marker
            key={`report-${report.id}`}
            coordinate={{
              latitude: report.latitude,
              longitude: report.longitude
            }}
            title="Signalement"
            description={report.impactType}
          >
            <View
              backgroundColor={COLORS.primaryLight}
              borderRadius={30}
              width={30}
              height={30}
              alignItems="center"
              justifyContent="center"
              borderWidth={2}
              borderColor={COLORS.primary}
            >
              <ExclamationTriangleIcon size={14} color={COLORS.primary} />
            </View>
            <Callout>
              <View width={200} padding={10}>
                <Text fontWeight="bold" color={COLORS.primary}>Signalement</Text>
                <Text marginTop={5}>Type d'impact: {report.impactType}</Text>
                <Text marginTop={2}>
                  Statut: {report.status === 'SENT' ? 'Envoyé' : 
                          report.status === 'PENDING' ? 'En attente' : 'Échec'}
                </Text>
              </View>
            </Callout>
          </Marker>
        );
      });
    }
    
    return markers;
  };

  return (
    <Theme name="light">
      <Stack.Screen options={{ headerShown: false }} />
      <YStack flex={1} backgroundColor="#fff">
        {/* Header */}
        <XStack
          paddingHorizontal="$4"
          paddingTop={top + 10}
          paddingBottom="$2"
          backgroundColor="white"
          alignItems="center"
        >
          <Text
            fontSize={28}
            fontWeight="700"
            color={COLORS.primary}
          >
            Carte
          </Text>
        </XStack>
        
        {/* Map Container */}
        <View flex={1} position="relative">
          {loading && !mapData ? (
            <YStack flex={1} justifyContent="center" alignItems="center">
              <Spinner size="large" color={COLORS.primary} />
              <Text marginTop="$4" color={COLORS.textSecondary}>
                Chargement de la carte...
              </Text>
            </YStack>
          ) : error ? (
            <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
              <Text color={COLORS.accent} textAlign="center">
                Impossible de charger les données de la carte
              </Text>
              <Button 
                marginTop="$4" 
                onPress={handleRefresh}
                backgroundColor={COLORS.primary}
                color="white"
              >
                Réessayer
              </Button>
            </YStack>
          ) : (
            <MapView
              ref={mapRef}
              style={{ width: '100%', height: '100%' }}
              initialRegion={initialRegion}
              provider={PROVIDER_GOOGLE}
              showsUserLocation={locationPermission}
              showsMyLocationButton={false}
              showsCompass={true}
              mapType={mapType}
            >
              {renderMarkers()}
              
              {/* Zones silencieuses (simulées) */}
              <Circle
                center={{ latitude: 14.7828, longitude: -16.9456 }}
                radius={3000}
                fillColor="rgba(150, 150, 150, 0.3)"
                strokeColor="rgba(150, 150, 150, 0.5)"
                strokeWidth={1}
              />
              <Circle
                center={{ latitude: 14.1652, longitude: -16.0769 }}
                radius={4000}
                fillColor="rgba(150, 150, 150, 0.3)"
                strokeColor="rgba(150, 150, 150, 0.5)"
                strokeWidth={1}
              />
            </MapView>
          )}
          
          {/* Map Controls */}
          <View
            position="absolute"
            top={16}
            right={16}
            backgroundColor="white"
            borderRadius={8}
            padding="$2"
            {...styles.shadow}
          >
            <YStack space="$2">
              {/* Refresh Button */}
              <TouchableOpacity
                style={styles.mapButton}
                onPress={handleRefresh}
              >
                <ArrowPathIcon size={20} color={COLORS.primary} />
              </TouchableOpacity>
              
              {/* Toggle Map Type Button */}
              <TouchableOpacity
                style={styles.mapButton}
                onPress={toggleMapType}
              >
                <MapPinIcon size={20} color={COLORS.primary} />
              </TouchableOpacity>
              
              {/* Center Map Button */}
              {locationPermission && (
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={handleCenterMap}
                >
                  <View 
                    width={20} 
                    height={20} 
                    alignItems="center"
                    justifyContent="center"
                  >
                    <View
                      width={12}
                      height={12}
                      borderRadius={6}
                      backgroundColor={COLORS.primary}
                      borderWidth={2}
                      borderColor="white"
                    />
                  </View>
                </TouchableOpacity>
              )}
            </YStack>
          </View>
          
          {/* Filters */}
          <View
            position="absolute"
            bottom={bottom + 20}
            left={16}
            right={16}
            backgroundColor="white"
            borderRadius={12}
            padding="$3"
            {...styles.shadow}
          >
            <XStack space="$2" justifyContent="space-between">
              <FilterButton 
                label="Tout" 
                active={filterType === 'all'} 
                onPress={() => {
                  Haptics.selectionAsync();
                  setFilterType('all');
                }}
                flex={1}
              />
              <FilterButton 
                label="Coupures" 
                active={filterType === 'outages'} 
                onPress={() => {
                  Haptics.selectionAsync();
                  setFilterType('outages');
                }}
                flex={1}
              />
              <FilterButton 
                label="Signalements" 
                active={filterType === 'reports'} 
                onPress={() => {
                  Haptics.selectionAsync();
                  setFilterType('reports');
                }}
                flex={1}
              />
            </XStack>
          </View>
        </View>
      </YStack>
    </Theme>
  );
}

type FilterButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  flex?: number;
}

const FilterButton = ({ label, active, onPress, flex }: FilterButtonProps) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={{ flex: flex || undefined }}
    >
      <View
        backgroundColor={active ? COLORS.primary : COLORS.primaryLight}
        padding="$2"
        borderRadius={8}
        alignItems="center"
      >
        <Text 
          color={active ? "white" : COLORS.primary}
          fontWeight={active ? "600" : "400"}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  mapButton: {
    width: 36,
    height: 36,
    backgroundColor: 'white',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  }
});