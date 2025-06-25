// client/src/lib/stores/merchant/merchant.store.ts

import type { Merchant, MerchantRegistryWithStats, UpdateMerchantRegistryRequest } from '@guesense-dash/shared';
import { create } from 'zustand';

interface MerchantState {
  // Data State
  availableMerchants: Merchant[];
  registeredMerchants: MerchantRegistryWithStats[];

  // Data Management Actions
  setRegisteredMerchants: (merchants: MerchantRegistryWithStats[]) => void;
  updateMerchantRegistry: (registryId: number, data: Omit<UpdateMerchantRegistryRequest, 'registryId'>) => void;
  removeMerchantFromRegistry: (registryId: number) => void;

  // UI Selection State
  selectedMerchant: MerchantRegistryWithStats | null;
  setSelectedMerchant: (merchant: MerchantRegistryWithStats | null) => void;
  configMerchant: MerchantRegistryWithStats | null;
  setConfigMerchant: (merchant: MerchantRegistryWithStats | null) => void;
}

const initialState = {
  availableMerchants: [],
  registeredMerchants: [],
};

export const useMerchantStore = create<MerchantState>(set => ({
  ...initialState,

  setRegisteredMerchants: merchants => set({ registeredMerchants: merchants }),
  updateMerchantRegistry: (registryId, data) =>
    set(state => ({
      registeredMerchants: state.registeredMerchants.map(merchant => {
        if (merchant.registryId === registryId) {
          const updated = {
            ...merchant,
            ...data,
          };
          return updated;
        }
        return merchant;
      }),
    })),
  removeMerchantFromRegistry: registryId =>
    set(state => ({
      registeredMerchants: state.registeredMerchants.filter(merchant => merchant.registryId !== registryId),
    })),

  selectedMerchant: null,
  setSelectedMerchant: merchant => set({ selectedMerchant: merchant }),
  configMerchant: null,
  setConfigMerchant: merchant => set({ configMerchant: merchant }),
}));
