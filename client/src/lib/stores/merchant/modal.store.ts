// client/src/lib/stores/merchant/modal.store.ts

import { create } from 'zustand';

interface ModalState {
  // Merchant Modal
  showAddMerchantModal: boolean;
  setShowAddMerchantModal: (show: boolean) => void;
  showMerchantConfigModal: boolean;
  setShowMerchantConfigModal: (show: boolean) => void;

  // Group Modal
  showCreateGroupModal: boolean;
  setShowCreateGroupModal: (show: boolean) => void;
  showGroupConfigModal: boolean;
  setShowGroupConfigModal: (show: boolean) => void;
}

export const useModalStore = create<ModalState>(set => ({
  showAddMerchantModal: false,
  setShowAddMerchantModal: show => set({ showAddMerchantModal: show }),
  showMerchantConfigModal: false,
  setShowMerchantConfigModal: show => set({ showMerchantConfigModal: show }),

  showCreateGroupModal: false,
  setShowCreateGroupModal: show => set({ showCreateGroupModal: show }),
  showGroupConfigModal: false,
  setShowGroupConfigModal: show => set({ showGroupConfigModal: show }),
}));
