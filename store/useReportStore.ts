import { create } from 'zustand';

type ReportStore = {
  description: string;
  sentimentText: string;
  impactTypeId: number | null;
  latitude: number | null;
  longitude: number | null;
  setDescription: (description: string) => void;
  setSentimentText: (sentimentText: string) => void;
  setImpactTypeId: (impactTypeId: number | null) => void;
  setLatitude: (latitude: number | null) => void;
  setLongitude: (longitude: number | null) => void;
  reset: () => void;
};

export const useReportStore = create<ReportStore>((set) => ({
  description: '',
  sentimentText: '',
  impactTypeId: null,
  latitude: null,
  longitude: null,
  setDescription: (description) => set({ description }),
  setSentimentText: (sentimentText) => set({ sentimentText }),
  setImpactTypeId: (impactTypeId) => set({ impactTypeId }),
  setLatitude: (latitude) => set({ latitude }),
  setLongitude: (longitude) => set({ longitude }),
  reset: () => set({ 
    description: '', 
    sentimentText: '', 
    impactTypeId: null,
    latitude: null,
    longitude: null
  }),
}));