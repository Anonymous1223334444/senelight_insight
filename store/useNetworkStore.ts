import { create } from 'zustand';

interface NetworkState {
  isConnected: boolean;
  updateConnectionStatus: (status: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: true, // Default to true
  updateConnectionStatus: (status) => set({ isConnected: status }),
}));