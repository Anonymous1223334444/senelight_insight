import { createWithEqualityFn } from 'zustand/traditional';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetworkStatus } from '../apollo/types';

type ReportStore = {
  description: string;
  sentimentText: string;
  impactTypeId: number | null;
  latitude: number | null;
  longitude: number | null;
  pendingReports: PendingReport[];
  setDescription: (description: string) => void;
  setSentimentText: (sentimentText: string) => void;
  setImpactTypeId: (impactTypeId: number | null) => void;
  setLatitude: (latitude: number | null) => void;
  setLongitude: (longitude: number | null) => void;
  addPendingReport: (report: PendingReport) => Promise<void>;
  removePendingReport: (id: string) => Promise<void>;
  loadPendingReports: () => Promise<void>;
  reset: () => void;
};

export type PendingReport = {
  id: string;
  description: string;
  sentimentText?: string;
  impactTypeId: number;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  networkStatus: NetworkStatus;
};

export const useReportsStore = createWithEqualityFn<ReportStore>((set, get) => ({
  description: '',
  sentimentText: '',
  impactTypeId: null,
  latitude: null,
  longitude: null,
  pendingReports: [],
  
  setDescription: (description) => set({ description }),
  setSentimentText: (sentimentText) => set({ sentimentText }),
  setImpactTypeId: (impactTypeId) => set({ impactTypeId }),
  setLatitude: (latitude) => set({ latitude }),
  setLongitude: (longitude) => set({ longitude }),
  
  addPendingReport: async (report) => {
    const { pendingReports } = get();
    const updatedReports = [...pendingReports, report];
    set({ pendingReports: updatedReports });
    await AsyncStorage.setItem('pendingReports', JSON.stringify(updatedReports));
  },
  
  removePendingReport: async (id) => {
    const { pendingReports } = get();
    const updatedReports = pendingReports.filter(report => report.id !== id);
    set({ pendingReports: updatedReports });
    await AsyncStorage.setItem('pendingReports', JSON.stringify(updatedReports));
  },
  
  loadPendingReports: async () => {
    try {
      const storedReports = await AsyncStorage.getItem('pendingReports');
      if (storedReports) {
        set({ pendingReports: JSON.parse(storedReports) });
      }
    } catch (error) {
      console.error('Failed to load pending reports:', error);
    }
  },
  
  reset: () => set({ 
    description: '', 
    sentimentText: '', 
    impactTypeId: null,
    latitude: null,
    longitude: null
  }),
}));