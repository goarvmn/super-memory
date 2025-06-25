// client/src/lib/stores/merchant/ui.store.ts

import { create } from 'zustand';

interface UiState {
  // Loading
  loadingStates: { [key: string]: boolean };
  setLoadingState: (key: string, loading: boolean) => void;

  // Pagination
  merchantsPage: number;
  setMerchantsPage: (page: number) => void;
  groupsPage: number;
  setGroupsPage: (page: number) => void;
}

export const useUiStore = create<UiState>(set => ({
  loadingStates: {},
  setLoadingState: (key, loading) =>
    set(state => ({
      loadingStates: { ...state.loadingStates, [key]: loading },
    })),

  merchantsPage: 1,
  setMerchantsPage: page => set({ merchantsPage: page }),
  groupsPage: 1,
  setGroupsPage: page => set({ groupsPage: page }),
}));
