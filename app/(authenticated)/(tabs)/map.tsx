import { Stack } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { YStack, Theme, Text, XStack, View, Spinner, Button } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import LeafletView from 'react-native-leaflet-view';
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
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.7167, -17.4677]); // Dakar par défaut
  const [zoom, setZoom] = useState(12);
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
        setMapCenter([location.coords.latitude, location.coords.longitude]);
      }
    })();
  }, []);
  
  const handleCenterMap = () => {
    Haptics.selectionAsync();
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
      setZoom(14);
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
  
  // Préparation des marqueurs pour LeafletView
  const prepareMarkers = () => {
    if (!mapData) return [];
    
    const markers = [];
    
    // Filtrer les données selon le filtre actif
    if (filterType === 'all' || filterType === 'outages') {
      mapData.outages.forEach((outage: OutagePoint) => {
        markers.push({
          id: `outage-${outage.id}`,
          position: { lat: outage.latitude, lng: outage.longitude },
          icon: outage.resolved ? 'greenmarker' : 'redmarker', // Utiliser des icônes prédéfinies ou des icônes personnalisées
          title: outage.resolved ? 'Coupure résolue' : 'Coupure active',
          description: `${outage.reportCount} signalement(s) associé(s)`
        });
      });
    }
    
    if (filterType === 'all' || filterType === 'reports') {
      mapData.reports.forEach((report: ReportPoint) => {
        markers.push({
          id: `report-${report.id}`,
          position: { lat: report.latitude, lng: report.longitude },
          icon: 'bluemarker',
          title: 'Signalement',
          description: `Type d'impact: ${report.impactType}`
        });
      });
    }
    
    return markers;
  };
  
  // Préparation des cercles pour LeafletView
  const prepareCircles = () => {
    return [
      {
        id: 'silence-zone-1',
        center: { lat: 14.7828, lng: -16.9456 },
        radius: 3000,
        color: 'rgba(150, 150, 150, 0.5)',
        fillColor: 'rgba(150, 150, 150, 0.3)'
      },
      {
        id: 'silence-zone-2',
        center: { lat: 14.1652, lng: -16.0769 },
        radius: 4000,
        color: 'rgba(150, 150, 150, 0.5)',
        fillColor: 'rgba(150, 150, 150, 0.3)'
      }
    ];
  };

  // Configuration de la carte LeafletView
  const mapOptions = {
    center: mapCenter,
    zoom: zoom,
    zoomControl: false,
    attributionControl: true,
    layerUrl: mapType === 'standard' 
      ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    showUserLocation: locationPermission
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
            <LeafletView
              style={{ width: '100%', height: '100%' }}
              mapOptions={mapOptions}
              mapMarkers={prepareMarkers()}
              mapCircles={prepareCircles()}
              onMapMarkerClicked={(marker) => {
                console.log('Marker clicked:', marker);
              }}
              onMapClicked={(position) => {
                console.log('Map clicked:', position);
              }}
            />
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