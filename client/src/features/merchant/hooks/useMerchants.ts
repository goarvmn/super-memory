// client/src/features/merchant/hooks/useMerchants.ts

import { createMerchantsResponse } from '@/lib/data/merchant';
import { useMerchantStore, useUiStore } from '@/lib/stores/merchant';
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

        // Optimistic update (immediate UI feedback)
        updateMerchantRegistry(registryId, configData);

        // API call (TODO: Replace with real API)
        // const updatedMerchant = await merchantAPI.updateMerchantRegistry(registryId, registryData);

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
    [updateMerchantRegistry, setLoadingState, loadMerchants]
  );

  // Delete merchant from registry
  const deleteMerchantFromRegistry = useCallback(
    async (registryId: number) => {
      try {
        setLoadingState('delete-merchant', true);

        console.log(selectedMerchant, registryId);
        if (selectedMerchant?.registryId === registryId) {
          setSelectedMerchant(null);
        }

        // Optimistic update (immediate UI feedback)
        removeMerchantFromRegistry(registryId);

        // API call (TODO: Replace with real API)
        // await merchantAPI.removeMerchantFromRegistry(registryId);

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
    [removeMerchantFromRegistry, setLoadingState, loadMerchants]
  );

  // Add new merchant to registry
  const addMerchantToRegistry = useCallback(
    async (merchantData: Partial<MerchantRegistryWithStats>) => {
      try {
        setLoadingState('add-merchant', true);

        // TODO: Replace with real API call
        // const newMerchant = await merchantAPI.addMerchantToRegistry(merchantData);

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
