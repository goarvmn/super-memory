// client/src/features/merchant/hooks/useMerchants.ts

import { createMerchantsResponse } from '@/lib/data/merchant';
import { useGroupStore, useMerchantStore, useUiStore } from '@/lib/stores/merchant';
import type { MerchantRegistryWithStats, UpdateMerchantRegistryRequest } from '@guesense-dash/shared';
import { useCallback, useEffect } from 'react';

export const useMerchants = () => {
  const {
    registeredMerchants,
    setRegisteredMerchants,
    updateMerchantRegistry,
    removeMerchantFromRegistry,
    selectedMerchant,
    setSelectedMerchant,
    configMerchant,
    setConfigMerchant,
  } = useMerchantStore();
  const { updateGroup, selectedGroup, setSelectedGroup } = useGroupStore();

  const { setLoadingState } = useUiStore();

  // Initialize with mock data (later will be replaced with API integration)
  useEffect(() => {
    if (registeredMerchants.length === 0) {
      loadMerchants();
    }
  }, []);

  // Load registered merchants from mock/API
  const loadMerchants = useCallback(async () => {
    try {
      setLoadingState('load-merchants', true);

      // TODO: integrate with API
      // const response = await merchantAPI.getRegisteredMerchants();

      const mockResponse = createMerchantsResponse(1, 6);
      setRegisteredMerchants(mockResponse.merchants);

      return { success: true };
    } catch (error) {
      console.error('Failed to load merchants:', error);
      return { success: false, error: error as Error };
    } finally {
      setLoadingState('load-merchants', false);
    }
  }, [setRegisteredMerchants, setLoadingState]);

  // Update merchant configuration
  const updateMerchantConfig = useCallback(
    async (registryId: number, configData: Omit<UpdateMerchantRegistryRequest, 'registryId'>) => {
      try {
        setLoadingState('save-merchant-config', true);

        const selected = registeredMerchants.find(m => m.registryId === registryId);
        const oldGroupId = selected?.groupId;
        const newGroupId = configData.groupId;

        // Optimistic update (immediate UI feedback)
        updateMerchantRegistry(registryId, configData);

        if (oldGroupId !== newGroupId) {
          if (oldGroupId) {
            updateGroup(oldGroupId, { membersCount: -1 });

            // handle decrement
            if (selectedGroup?.id === oldGroupId) {
              const counter = (selectedGroup.membersCount ?? 0) - 1;
              const members = selectedGroup.members.filter(member => member.id !== registryId);
              const updatedGroup = { ...selectedGroup, membersCount: counter < 0 ? 0 : counter, members };
              console.log('selected', selected);
              console.log('updatedGroup', updatedGroup);
              setSelectedGroup(updatedGroup);
            }
          }

          // handle increment
          if (newGroupId) {
            updateGroup(newGroupId, { membersCount: +1 });

            if (selectedGroup?.id === newGroupId) {
              const counter = (selectedGroup.membersCount ?? 0) + 1;
              // append selected to group members
              delete selected?.groupId;
              const members = selectedGroup.members.concat({ ...selected, isMerchantSource: false });
              const updatedGroup = { ...selectedGroup, membersCount: counter > 0 ? counter : 0, members };
              console.log('selected', selected);
              console.log('updatedGroup', updatedGroup);
              setSelectedGroup(updatedGroup);
            }
          }
        }

        // @TODO: API integration

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Merchant config updated:', { registryId, configData });

        return { success: true };
      } catch (error) {
        console.error('Failed to update merchant config:', error);

        // Rollback on error
        await loadMerchants();

        return { success: false, error: error as Error };
      } finally {
        setLoadingState('save-merchant-config', false);
      }
    },
    [updateMerchantRegistry, updateGroup, selectedGroup, setSelectedGroup, setLoadingState, loadMerchants]
  );

  // Delete merchant from registry
  const deleteMerchantFromRegistry = useCallback(
    async (registryId: number) => {
      try {
        setLoadingState('delete-merchant', true);

        // Optimistic update (immediate UI feedback)
        removeMerchantFromRegistry(registryId);

        if (selectedMerchant?.registryId === registryId) {
          setSelectedMerchant(null);
        }

        // @TODO: API integration

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Merchant deleted from registry:', registryId);

        return { success: true };
      } catch (error) {
        console.error('Failed to delete merchant:', error);

        // Rollback on error
        await loadMerchants();

        return { success: false, error: error as Error };
      } finally {
        setLoadingState('delete-merchant', false);
      }
    },
    [removeMerchantFromRegistry, setLoadingState, loadMerchants, setSelectedMerchant, selectedMerchant]
  );

  // Add new merchant to registry
  const addMerchantToRegistry = useCallback(
    async (merchantData: Partial<MerchantRegistryWithStats>) => {
      try {
        setLoadingState('add-merchant', true);

        // @TODO: API integration

        // Simulate API
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Merchant added to registry:', merchantData);

        // Refresh merchants list to get the new merchant
        await loadMerchants();

        return { success: true };
      } catch (error) {
        console.error('Failed to add merchant:', error);
        return { success: false, error: error as Error };
      } finally {
        setLoadingState('add-merchant', false);
      }
    },
    [setLoadingState, loadMerchants]
  );

  // Get merchant by registry ID
  // const getMerchantByRegistryId = useCallback(
  //   (registryId: number) => {
  //     return registeredMerchants.find(merchant => merchant.registryId === registryId);
  //   },
  //   [registeredMerchants]
  // );

  // Get merchants by group ID
  // const getMerchantsByGroupId = useCallback(
  //   (groupId: number | null) => {
  //     return registeredMerchants.filter(merchant => merchant.groupId === groupId);
  //   },
  //   [registeredMerchants]
  // );

  // Refresh merchants data
  const refreshMerchants = useCallback(async () => {
    return await loadMerchants();
  }, [loadMerchants]);

  // Selection helpers
  const selectMerchant = useCallback(
    (merchant: MerchantRegistryWithStats | null) => {
      setSelectedMerchant(merchant);
    },
    [setSelectedMerchant]
  );

  const clearSelectionMerchant = useCallback(() => {
    setSelectedMerchant(null);
  }, [setSelectedMerchant]);

  // Configuration helpers
  const openMerchantConfig = useCallback(
    (merchant: MerchantRegistryWithStats) => {
      setConfigMerchant(merchant);
    },
    [setConfigMerchant]
  );

  const closeMerchantConfig = useCallback(() => {
    setConfigMerchant(null);
  }, [setConfigMerchant]);

  return {
    // Data
    registeredMerchants,
    selectedMerchant,
    configMerchant,

    // API Operations
    loadMerchants,
    updateMerchantConfig,
    deleteMerchantFromRegistry,
    addMerchantToRegistry,
    refreshMerchants,

    // Query Helpers
    // getMerchantByRegistryId,
    // getMerchantsByGroupId,

    // Selection Helpers
    selectMerchant,
    clearSelectionMerchant,

    // Configuration Helpers
    openMerchantConfig,
    closeMerchantConfig,
  };
};
