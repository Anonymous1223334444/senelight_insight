import { createWithEqualityFn } from 'zustand/traditional';
import { NetworkStatus } from '../apollo/types';

interface NetworkState {
  isConnected: boolean;
  pendingReports: number;
  addPendingReport: () => void;
  removePendingReport: () => void;
  setPendingReports: (count: number) => void;
  updateConnectionStatus: (status: boolean) => void;
}

export const useNetworkStore = createWithEqualityFn<NetworkState>((set) => ({
  isConnected: true,
  pendingReports: 0,
  addPendingReport: () => set((state) => ({ pendingReports: state.pendingReports + 1 })),
  removePendingReport: () => set((state) => ({ 
    pendingReports: Math.max(0, state.pendingReports - 1) 
  })),
  setPendingReports: (count) => set({ pendingReports: count }),
  updateConnectionStatus: (status) => set({ isConnected: status }),
}));