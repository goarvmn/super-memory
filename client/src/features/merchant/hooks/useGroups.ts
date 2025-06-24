// client/src/features/merchant/hooks/useGroups.ts

import { createGroupsResponse, getGroupWithMembers } from '@/lib/data/merchant';
import { useGroupStore, useUiStore } from '@/lib/stores/merchant';
import type { GroupWithMembers, UpdateGroupRequest } from '@guesense-dash/shared';
import { useCallback, useEffect } from 'react';

export const useGroups = () => {
  const { groups, updateGroup, setGroups, removeGroup, selectedGroup, setSelectedGroup, configGroup, setConfigGroup } =
    useGroupStore();

  const { setLoadingState } = useUiStore();

  // Initialize with mock data (later will be replaced with API integration)
  useEffect(() => {
    if (groups.length === 0) {
      loadGroups();
    }
  }, []);

  // Load groups from mock/API
  const loadGroups = useCallback(async () => {
    try {
      setLoadingState('load-groups', true);

      // TODO: integrate with API
      // const response = await merchantAPI.getRegisteredMerchants();

      const mockResponse = createGroupsResponse(1, 6);
      setGroups(mockResponse.groups);

      return { success: true };
    } catch (error) {
      console.error('Failed to load groups:', error);
      return { success: false, error: error as Error };
    } finally {
      setLoadingState('load-groups', false);
    }
  }, [setGroups, setLoadingState]);

  const updateGroupConfig = useCallback(
    async (groupId: number, configData: Omit<UpdateGroupRequest, 'id'>) => {
      try {
        setLoadingState('save-group-config', true);

        // Optimistic update (immediate UI feedback)
        updateGroup(groupId, configData);

        // 2. API call (TODO: Replace with real API)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Group config updated:', { groupId, configData });

        return { success: true };
      } catch (error) {
        console.error('Failed to update group config:', error);

        // Rollback group on error
        await loadGroups();

        return { success: false, error: error as Error };
      } finally {
        setLoadingState('save-group-config', false);
      }
    },
    [updateGroup, setLoadingState, loadGroups]
  );

  const deleteGroup = useCallback(
    async (groupId: number) => {
      try {
        setLoadingState('delete-group', true);

        // Optimistic update (immediate UI feedback)
        removeGroup(groupId);

        // 2. API call (TODO: Replace with real API)
        // await merchantAPI.removeMerchantFromRegistry(registryId);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Group deleted from registry:', groupId);

        // Clear selection if deleted group was selected
        if (selectedGroup?.id === groupId) {
          selectGroup(null);
        }

        return { success: true };
      } catch (error) {
        console.error('Failed to delete group:', error);

        // Rollback on error
        await loadGroups();

        return { success: false, error: error as Error };
      } finally {
        setLoadingState('delete-group', false);
      }
    },
    [removeGroup, setLoadingState, loadGroups]
  );

  // Refresh groups data
  const refreshGroups = useCallback(async () => {
    return await loadGroups();
  }, [loadGroups]);

  // Selection helpers
  const selectGroup = useCallback(
    async (group: GroupWithMembers | null) => {
      if (!group) {
        setSelectedGroup(null);
        return;
      }

      try {
        setLoadingState(`load-group-${group.id}`, true);

        // Fetch detailed group with members
        // TODO: Replace with real API
        // const groupWithMembers = await groupAPI.getGroupWithMembers(group.id);

        const groupWithMembers = await getGroupWithMembers(group.id);
        if (groupWithMembers) {
          setSelectedGroup(groupWithMembers);
        }
      } catch (error) {
        console.error('Failed to select group:', error);
        setSelectedGroup(group);
      } finally {
        setLoadingState(`load-group-${group.id}`, false);
      }
    },
    [setSelectedGroup, setLoadingState]
  );

  const clearSelectionGroup = useCallback(() => {
    setSelectedGroup(null);
  }, [setSelectedGroup]);

  // Configuration helpers
  const openGroupConfig = useCallback(
    async (group: GroupWithMembers) => {
      try {
        setLoadingState(`load-config-${group.id}`, true);

        // Fetch detailed group with members for config
        // TODO: Replace with real API
        // const groupWithMembers = await groupAPI.getGroupWithMembers(group.id);

        const groupWithMembers = await getGroupWithMembers(group.id);
        if (groupWithMembers) {
          setConfigGroup(groupWithMembers);
        }
      } catch (error) {
        console.error('Failed to load group for config:', error);
        // Fallback to basic group data
        setConfigGroup(group);
      } finally {
        setLoadingState(`load-config-${group.id}`, false);
      }
    },
    [setConfigGroup, setLoadingState]
  );

  const closeGroupConfig = useCallback(() => {
    setConfigGroup(null);
  }, [setConfigGroup]);

  return {
    // Data
    groups,
    selectedGroup,
    configGroup,

    // API Operations
    loadGroups,
    updateGroupConfig,
    deleteGroup,
    refreshGroups,

    // Selection Helpers
    selectGroup,
    clearSelectionGroup,

    // Configuration Helpers
    openGroupConfig,
    closeGroupConfig,
  };
};
